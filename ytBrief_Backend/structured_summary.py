"""Structured Gemini summaries that match the Next.js `Summary` type."""
import json
import os
import re

import requests
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# gemini-1.5-* has been retired; override with GEMINI_MODEL in .env if this one changes.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
MAX_CHARS = 100_000

LANG_NAMES = {"en": "English", "es": "Spanish", "fr": "French"}

TYPE_GUIDE = {
    "quick": "tldr: 2-3 sentences. takeaways: 3-5 short bullets. detailed: empty string. chapterSummaries: [].",
    "detailed": "tldr: 2-3 sentences. takeaways: 5-8 bullets. detailed: 4-8 well-structured paragraphs separated by blank lines. chapterSummaries: [].",
    "key-points": "tldr: 1-2 sentences. takeaways: 8-12 concise, scannable bullets. detailed: empty string. chapterSummaries: [].",
    "chapters": "tldr: 1-2 sentences. takeaways: 3-5 bullets. detailed: empty string. chapterSummaries: one entry per section, each with a short title and 2-4 sentences of text.",
}


class SummaryError(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code


def _build_prompt(transcript, language, summary_type, chapter_titles):
    lang = LANG_NAMES.get(language, "English")
    if summary_type == "chapters":
        if chapter_titles:
            sections = "Use exactly these section titles, in order: " + "; ".join(chapter_titles) + "."
        else:
            sections = "The video has no chapter markers, so split it into 4-8 logical sections and title each one."
    else:
        sections = ""
    return f"""Summarize this YouTube video transcript. Write everything in {lang}.
Respond with ONLY a JSON object, no markdown fences, with exactly these keys:
{{"tldr": string, "takeaways": [string], "detailed": string, "chapterSummaries": [{{"title": string, "text": string}}]}}

Length rules for this request: {TYPE_GUIDE[summary_type]}
{sections}
Do not invent facts that are not in the transcript.

Transcript:
{transcript}"""


def _parse(text):
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    data = json.loads(text)
    return {
        "tldr": str(data.get("tldr", "")).strip(),
        "takeaways": [str(x).strip() for x in data.get("takeaways", []) if str(x).strip()],
        "detailed": str(data.get("detailed", "")).strip(),
        "chapterSummaries": [
            {"title": str(c.get("title", "")).strip(), "text": str(c.get("text", "")).strip()}
            for c in data.get("chapterSummaries", [])
            if isinstance(c, dict)
        ],
    }


def _extract_text(data):
    """Join the text parts of the first candidate (skipping thought parts)."""
    cand = (data.get("candidates") or [None])[0] or {}
    parts = (cand.get("content") or {}).get("parts") or []
    text = "".join(
        p.get("text", "") for p in parts if isinstance(p, dict) and not p.get("thought")
    )
    return text, cand.get("finishReason")


def generate_structured_summary(transcript, language="en", summary_type="quick", chapter_titles=None):
    if not GEMINI_API_KEY:
        raise SummaryError("gemini_error", "Gemini API key not configured")
    if len(transcript) > MAX_CHARS:
        transcript = transcript[:MAX_CHARS] + "..."

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    payload = {
        "contents": [{"parts": [{"text": _build_prompt(transcript, language, summary_type, chapter_titles)}]}],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json",
        },
    }
    # Gemini 2.5 Flash "thinks" by default and thinking tokens count against
    # maxOutputTokens, which can cut the JSON off mid-way. Summaries don't need it.
    if "2.5-flash" in GEMINI_MODEL:
        payload["generationConfig"]["thinkingConfig"] = {"thinkingBudget": 0}
    try:
        # key goes in a header so it never ends up in logs or exception messages
        r = requests.post(url, json=payload, headers={"x-goog-api-key": GEMINI_API_KEY}, timeout=90)
    except requests.exceptions.RequestException:
        raise SummaryError("gemini_error", "Could not reach the Gemini API")

    if r.status_code != 200:
        try:
            msg = r.json().get("error", {}).get("message", "")
        except ValueError:
            msg = ""
        raise SummaryError("gemini_error", f"Gemini error {r.status_code}: {msg}".strip())

    try:
        data = r.json()
    except ValueError:
        print(f"[gemini] non-JSON HTTP body: {r.text[:200]!r}", flush=True)
        raise SummaryError("gemini_error", "Gemini returned an unreadable response")

    text, finish = _extract_text(data)
    if not text:
        block = (data.get("promptFeedback") or {}).get("blockReason")
        print(f"[gemini] empty output: finishReason={finish} blockReason={block}", flush=True)
        if block:
            raise SummaryError("gemini_error", f"Gemini blocked this request ({block})")
        raise SummaryError("gemini_error", f"Gemini returned no text (finishReason: {finish})")

    try:
        return _parse(text)
    except (ValueError, TypeError, AttributeError):
        print(
            f"[gemini] unparseable JSON: finishReason={finish} "
            f"usage={data.get('usageMetadata')} tail={text[-200:]!r}",
            flush=True,
        )
        if finish == "MAX_TOKENS":
            raise SummaryError(
                "gemini_error",
                "Gemini ran out of output space. Try a shorter summary type or a shorter video.",
            )
        raise SummaryError("gemini_error", "Gemini returned an unreadable response")
# ytBrief_Backend/transcripts.py
import json
import os
import sqlite3
import time

import requests

DB_PATH = os.getenv("YTBRIEF_DB", "ytbrief.db")
API_URL = "https://api.supadata.ai/v1/transcript"


class TranscriptError(Exception):
    def __init__(self, message, status=502):
        super().__init__(message)
        self.status = status


# ---------- cache ----------
def _db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """CREATE TABLE IF NOT EXISTS transcript_cache (
               video_id TEXT PRIMARY KEY,
               data TEXT NOT NULL,
               fetched_at INTEGER NOT NULL)"""
    )
    return conn


def _cache_get(video_id):
    with _db() as conn:
        row = conn.execute(
            "SELECT data FROM transcript_cache WHERE video_id = ?", (video_id,)
        ).fetchone()
    return json.loads(row[0]) if row else None


def _cache_put(video_id, data):
    with _db() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO transcript_cache VALUES (?, ?, ?)",
            (video_id, json.dumps(data), int(time.time())),
        )


# ---------- providers ----------
def _fetch_supadata(video_id, lang="en"):
    key = os.getenv("SUPADATA_API_KEY")
    if not key:
        raise TranscriptError("SUPADATA_API_KEY is not set on the server.", 500)

    params = {
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "lang": lang,
        "mode": "native",  # never trigger paid AI generation
    }
    for attempt in range(2):
        resp = requests.get(API_URL, headers={"x-api-key": key},
                            params=params, timeout=30)
        if resp.status_code == 429 and attempt == 0:
            time.sleep(1.2)  # free tier allows 1 request/second
            continue
        break

    if resp.status_code == 429:
        raise TranscriptError(
            "Transcript service is busy or out of credits. Try again later "
            "or paste the transcript manually.", 429)
    if resp.status_code != 200:
        raise TranscriptError(
            "No transcript available for this video.", 404)

    data = resp.json()
    chunks = [
        {
            "text": c["text"],
            "start": c["offset"] / 1000,       # offset is in milliseconds
            "duration": c["duration"] / 1000,
        }
        for c in data.get("content", [])
    ]
    if not chunks:
        raise TranscriptError("No transcript available for this video.", 404)
    return {"lang": data.get("lang", lang), "chunks": chunks}


def _fetch_local(video_id, lang="en"):
    # Works on your own machine; blocked on most cloud servers.
    from youtube_transcript_api import YouTubeTranscriptApi

    try:
        fetched = YouTubeTranscriptApi().fetch(video_id, languages=[lang, "en"])
    except Exception as e:
        raise TranscriptError(f"Could not fetch transcript locally: {e}", 404)
    chunks = [{"text": s.text, "start": s.start, "duration": s.duration}
              for s in fetched]
    return {"lang": lang, "chunks": chunks}


# ---------- public API ----------
def get_transcript(video_id, lang="en"):
    cached = _cache_get(video_id)
    if cached:
        return cached

    provider = os.getenv("TRANSCRIPT_PROVIDER", "supadata")
    fetch = _fetch_local if provider == "local" else _fetch_supadata
    data = fetch(video_id, lang)

    _cache_put(video_id, data)
    return data


def transcript_text(transcript):
    return " ".join(c["text"] for c in transcript["chunks"])
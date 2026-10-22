"""Read chapter markers from a video's description (e.g. '03:15 Setting up')."""
import os
import re

from dotenv import load_dotenv
from googleapiclient.discovery import build

load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

_LINE = re.compile(r"^\s*((?:\d{1,2}:)?\d{1,2}:\d{2})\s*[-–—:.)]?\s*(.+?)\s*$")


def parse_chapters(description: str):
    found = []
    for line in (description or "").splitlines():
        m = _LINE.match(line)
        if m:
            found.append({"start": m.group(1), "title": m.group(2)})
    # YouTube only treats it as chapters if the list starts at 0:00 and has 3+ entries
    if len(found) >= 3 and found[0]["start"] in ("0:00", "00:00", "0:00:00"):
        return found
    return []


def get_chapters(video_id: str):
    if not YOUTUBE_API_KEY or not video_id:
        return []
    try:
        yt = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
        items = yt.videos().list(part="snippet", id=video_id).execute().get("items", [])
        if not items:
            return []
        return parse_chapters(items[0]["snippet"].get("description", ""))
    except Exception:
        return []  # chapters are optional; never fail the request over them

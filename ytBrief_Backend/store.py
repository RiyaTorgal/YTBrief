"""Tiny SQLite store for saved summaries (stdlib only, no new dependency)."""
import json
import os
import sqlite3
from contextlib import closing
from datetime import datetime, timezone

DB_PATH = os.getenv("YTBRIEF_DB", os.path.join(os.path.dirname(__file__), "ytbrief.db"))


def _conn():
    return closing(sqlite3.connect(DB_PATH))


def init():
    with _conn() as c:
        c.execute(
            "CREATE TABLE IF NOT EXISTS summaries ("
            "id TEXT PRIMARY KEY, created_at TEXT NOT NULL, data TEXT NOT NULL)"
        )
        c.execute(
            "CREATE TABLE IF NOT EXISTS transcript_cache ("
            "video_id TEXT PRIMARY KEY, text TEXT NOT NULL, fetched_at TEXT NOT NULL)"
        )
        c.commit()


def save(summary: dict) -> None:
    with _conn() as c:
        c.execute(
            "INSERT OR REPLACE INTO summaries (id, created_at, data) VALUES (?, ?, ?)",
            (summary["id"], summary["createdAt"], json.dumps(summary)),
        )
        c.commit()


def list_all() -> list:
    with _conn() as c:
        rows = c.execute("SELECT data FROM summaries ORDER BY created_at DESC").fetchall()
    return [json.loads(r[0]) for r in rows]


def get(summary_id: str):
    with _conn() as c:
        row = c.execute("SELECT data FROM summaries WHERE id = ?", (summary_id,)).fetchone()
    return json.loads(row[0]) if row else None


def delete(summary_id: str) -> bool:
    with _conn() as c:
        cur = c.execute("DELETE FROM summaries WHERE id = ?", (summary_id,))
        c.commit()
        return cur.rowcount > 0


# ---------- transcript cache (one provider call per video, ever) ----------

def get_cached_transcript(video_id: str):
    with _conn() as c:
        row = c.execute(
            "SELECT text FROM transcript_cache WHERE video_id = ?", (video_id,)
        ).fetchone()
    return row[0] if row else None


def cache_transcript(video_id: str, text: str) -> None:
    with _conn() as c:
        c.execute(
            "INSERT OR REPLACE INTO transcript_cache (video_id, text, fetched_at) VALUES (?, ?, ?)",
            (video_id, text, datetime.now(timezone.utc).isoformat()),
        )
        c.commit()
import re
import requests
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled, 
    NoTranscriptFound, 
    VideoUnavailable,
    RequestBlocked,
    YouTubeRequestFailed
)
import os
import time
import random

from dotenv import load_dotenv

import store

load_dotenv()

SUPADATA_URL = "https://api.supadata.ai/v1/transcript"

# Same prefixes app.py treats as "transcript failed" (used here only to decide what to cache)
_FAIL_PREFIXES = (
    "Error", "No ", "Transcript", "Video is unavailable", "Too many", "Failed", "YouTube request failed",
)


def _provider():
    """'supadata' (hosted, works from cloud servers) or 'local' (youtube-transcript-api).

    Set TRANSCRIPT_PROVIDER explicitly. If unset, uses Supadata when SUPADATA_API_KEY exists.
    """
    explicit = (os.getenv("TRANSCRIPT_PROVIDER") or "").strip().lower()
    if explicit in ("supadata", "local"):
        return explicit
    return "supadata" if os.getenv("SUPADATA_API_KEY") else "local"


def _clean_segments(segments):
    """Strip captions noise from each segment and join into one string."""
    parts = []
    for text in segments:
        text = (text or "").strip()
        text = re.sub(r'\[.*?\]', '', text)
        text = re.sub(r'\(.*?\)', '', text)
        text = re.sub(r'♪.*?♪', '', text)
        text = re.sub(r'<.*?>', '', text)
        text = re.sub(r'\b(um|uh|ah|er|mm)\b', '', text, flags=re.IGNORECASE)
        if text.strip():
            parts.append(text.strip())
    return re.sub(r'\s+', ' ', ' '.join(parts)).strip()

def extractVidID(url):
    """Extract video ID from YouTube URL"""
    if not url:
        raise ValueError("URL cannot be empty")
    
    match = re.search(r"(?:v=|youtu\.be/|embed/|/v/|/videos/|/watch\?v=|&v=|/shorts/|/video/)([a-zA-Z0-9_-]{11})", url)
    if match:
        return match.group(1)
    else:
        raise ValueError("Invalid YouTube URL")
    
def extractMetaData(url):
    """Extract title and channel from YouTube video page"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        r = requests.get(url, headers=headers, timeout=10)
        r.raise_for_status()
        
        soup = BeautifulSoup(r.text, features="html.parser")
        
        # Try to get title
        title_element = soup.find("title")
        title = title_element.text if title_element else "Unknown Title"
        
        # Try to get channel name
        channel_element = soup.find("link", itemprop="name")
        channel = channel_element['content'] if channel_element else "Unknown Channel"
        
        return title, channel
    except Exception as e:
        return f"Error extracting metadata: {str(e)}", "Unknown Channel"

def downloadDP(vidID):
    """Download video thumbnail"""
    try:
        imgURL = f"https://img.youtube.com/vi/{vidID}/hqdefault.jpg"
        imgData = requests.get(imgURL, timeout=10).content
        with open('thumbnail.jpg', 'wb') as handler:
            handler.write(imgData)
        return True
    except Exception as e:
        print(f"Error downloading thumbnail: {e}")
        return False

def get_available_transcripts(video_id):
    """Get list of available transcripts for a video"""
    try:
        transcript_list = YouTubeTranscriptApi().list(video_id)
        available_transcripts = []
        
        for transcript in transcript_list:
            available_transcripts.append({
                'language': transcript.language,
                'language_code': transcript.language_code,
                'is_generated': transcript.is_generated,
                'is_translatable': transcript.is_translatable
            })
        
        return available_transcripts
    except Exception as e:
        print(f"Error getting available transcripts: {e}")
        return []


def transcript_with_retry(video_id, max_retries=3, delay_range=(1, 3)):
    """Retrieve and clean a transcript, avoiding retries for persistent HTTP 403 errors."""

    if not video_id:
        return "Error: No video ID provided"

    for attempt in range(max_retries):
        try:
            transcript_list = YouTubeTranscriptApi().list(video_id)

            manual_transcripts = [
                t for t in transcript_list if not t.is_generated
            ]
            auto_transcripts = [
                t for t in transcript_list if t.is_generated
            ]

            selected_transcript = None
            english_codes = ("en", "en-US", "en-GB", "en-CA", "en-AU")

            # Priority 1: Manual English
            for transcript in manual_transcripts:
                if transcript.language_code in english_codes:
                    selected_transcript = transcript
                    break

            # Priority 2: Auto-generated English
            if selected_transcript is None:
                for transcript in auto_transcripts:
                    if transcript.language_code in english_codes:
                        selected_transcript = transcript
                        break

            # Priority 3: Any manual transcript
            if selected_transcript is None and manual_transcripts:
                selected_transcript = manual_transcripts[0]

            # Priority 4: Any auto-generated transcript
            if selected_transcript is None and auto_transcripts:
                selected_transcript = auto_transcripts[0]

            if selected_transcript is None:
                return "No transcripts available for this video."

            transcript_data = selected_transcript.fetch()
            full_transcript = _clean_segments(entry.text for entry in transcript_data)

            if not full_transcript:
                return "Transcript is empty after processing."

            return full_transcript

        except TranscriptsDisabled:
            return "Transcripts are disabled for this video."

        except NoTranscriptFound:
            return "No transcript found for this video."

        except VideoUnavailable:
            return "Video is unavailable or private."

        except (RequestBlocked, YouTubeRequestFailed) as e:
            error_text = str(e)

            # A persistent 403 is not worth retrying repeatedly.
            if "403" in error_text or "forbidden" in error_text.lower():
                print(
                    "YouTube denied the transcript request (HTTP 403). "
                    "Not retrying. Check the deployment environment."
                )
                return (
                    "YouTube is blocking transcript retrieval from the "
                    "server (HTTP 403). Please try again later."
                )

            if attempt < max_retries - 1:
                delay = random.uniform(*delay_range) * (2 ** attempt)
                print(
                    f"Transcript request failed: {error_text}. "
                    f"Retrying in {delay:.1f} seconds..."
                )
                time.sleep(delay)
                continue

            return f"YouTube transcript request failed: {error_text}"

        except Exception as e:
            if attempt < max_retries - 1:
                delay = random.uniform(*delay_range) * (2 ** attempt)
                print(
                    f"Unexpected transcript error: {e}. "
                    f"Retrying in {delay:.1f} seconds..."
                )
                time.sleep(delay)
                continue

            return f"Error retrieving transcript: {e}"

    return "Failed to retrieve transcript after multiple attempts."


def _transcript_supadata(video_id):
    """Fetch existing captions via Supadata (mode=native: never triggers paid AI generation)."""
    key = os.getenv("SUPADATA_API_KEY")
    if not key:
        return "Error: SUPADATA_API_KEY is not configured on the server."

    params = {
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "lang": "en",
        "mode": "native",
    }
    resp = None
    for attempt in range(2):
        try:
            resp = requests.get(
                SUPADATA_URL, headers={"x-api-key": key}, params=params, timeout=30
            )
        except requests.RequestException as e:
            return f"Error retrieving transcript: {e}"
        if resp.status_code == 429 and attempt == 0:
            time.sleep(1.2)  # free tier: 1 request/second
            continue
        break

    if resp.status_code == 429:
        return "Too many requests to the transcript service. Please try again later."
    if resp.status_code != 200:
        print(f"Supadata returned {resp.status_code}: {resp.text[:300]}", flush=True)
        if resp.status_code in (206, 404):
            return "No transcript found for this video."
        return f"Failed to retrieve transcript (service returned {resp.status_code})."

    try:
        content = resp.json().get("content")
    except ValueError:
        return "Failed to retrieve transcript (unreadable service response)."

    if isinstance(content, str):
        segments = [content]
    else:
        segments = [c.get("text", "") for c in (content or [])]

    full_transcript = _clean_segments(segments)
    return full_transcript or "No transcript found for this video."


def transcript(video_id):
    """Main transcript function: cache -> provider. Returns text, or an error string."""
    if not video_id:
        return "Error: No video ID provided"

    cached = store.get_cached_transcript(video_id)
    if cached:
        print(f"[transcript] {video_id}: served from cache (no provider call)", flush=True)
        return cached

    provider = _provider()
    print(f"[transcript] {video_id}: cache miss, fetching via '{provider}'", flush=True)
    if provider == "supadata":
        result = _transcript_supadata(video_id)
    else:
        result = transcript_with_retry(video_id)

    if result and not result.startswith(_FAIL_PREFIXES):
        store.cache_transcript(video_id, result)
        print(f"[transcript] {video_id}: fetched via '{provider}' and cached", flush=True)
    else:
        print(f"[transcript] {video_id}: '{provider}' failed -> {result[:120]}", flush=True)
    return result

def get_transcript_info(video_id):
    """Get detailed information about available transcripts"""
    if _provider() == "supadata":
        return {'error': 'Transcript details are only available with TRANSCRIPT_PROVIDER=local'}
    try:
        transcript_list = YouTubeTranscriptApi().list(video_id)
        
        info = {
            'available_transcripts': [],
            'has_manual': False,
            'has_auto': False,
            'has_english': False,
            'total_count': 0
        }
        
        for transcript in transcript_list:
            transcript_info = {
                'language': transcript.language,
                'language_code': transcript.language_code,
                'is_generated': transcript.is_generated,
                'is_translatable': transcript.is_translatable
            }
            info['available_transcripts'].append(transcript_info)
            
            if not transcript.is_generated:
                info['has_manual'] = True
            else:
                info['has_auto'] = True
                
            if transcript.language_code.startswith('en'):
                info['has_english'] = True
        
        info['total_count'] = len(info['available_transcripts'])
        return info
    
    except Exception as e:
        return {'error': str(e)}

def transcript_original(vidID):
    """Original transcript function (kept for backward compatibility)"""
    try:
        Raw = YouTubeTranscriptApi().fetch(vidID, languages=['en'])
        transcript_parts = []
        for part in Raw:
            text = part.text.strip()
            text = re.sub(r'\[.*?\]', '', text)
            text = re.sub(r'\(.*?\)', '', text)
            if text:
                transcript_parts.append(text)
        
        Full = ' '.join(transcript_parts)
        Full = re.sub(r'\s+', ' ', Full).strip()
        return Full
    except Exception as e:
        return f"Error retrieving transcript: {str(e)}"
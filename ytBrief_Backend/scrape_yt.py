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
import time
import random

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
            transcript_parts = []

            for entry in transcript_data:
                text = entry.text.strip()
                text = re.sub(r'\[.*?\]', '', text)
                text = re.sub(r'\(.*?\)', '', text)
                text = re.sub(r'♪.*?♪', '', text)
                text = re.sub(r'<.*?>', '', text)
                text = re.sub(
                    r'\b(um|uh|ah|er|mm)\b',
                    '',
                    text,
                    flags=re.IGNORECASE,
                )

                if text.strip():
                    transcript_parts.append(text.strip())

            full_transcript = re.sub(
                r'\s+', ' ', ' '.join(transcript_parts)
            ).strip()

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


def transcript(video_id):
    """Main transcript function with enhanced error handling"""
    return transcript_with_retry(video_id)

def get_transcript_info(video_id):
    """Get detailed information about available transcripts"""
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
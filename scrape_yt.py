import streamlit as st
from youtube_transcript_api import YouTubeTranscriptApi
import re
from typing import Tuple, Optional
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

def extract_and_validate_video_id(url: str) -> str:
    """
    Extract and validate YouTube video ID from various URL formats.
    Raises ValueError if URL is invalid.
    """
    match = re.search(r"(?:v=|youtu\.be/|embed/|/v/|/videos/|/watch\?v=|&v=|/shorts/|/video/)([a-zA-Z0-9_-]{11})", url)
    if not match:
        raise ValueError("Invalid YouTube URL format")
    video_id = match.group(1)
    logging.info(f"Extracted video ID: {video_id}")
    return video_id

def get_transcript(video_id: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Attempt to get transcript with better error handling and user feedback.
    Returns tuple of (transcript_text, error_message)
    """
    try:
        # Attempt to fetch transcript with English captions
        logging.info("Fetching transcript...")
        raw_transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
        if not raw_transcript:
            logging.warning("No transcript found for this video")
            return None, "No transcript found for this video"

        # Clean and combine the transcript text
        logging.info("Cleaning transcript text...")
        transcript_parts = []
        for part in raw_transcript:
            text = part['text'].strip()
            # Remove speaker labels and brackets
            text = re.sub(r'\[.*?\]', '', text)
            text = re.sub(r'\(.*?\)', '', text)
            if text:
                transcript_parts.append(text)
        
        full_transcript = ' '.join(transcript_parts)
        # Remove multiple spaces and clean up punctuation
        full_transcript = re.sub(r'\s+', ' ', full_transcript).strip()
        
        if not full_transcript:
            logging.warning("Transcript was empty after cleaning")
            return None, "Transcript was empty after cleaning"
        
        logging.info("Transcript retrieved and cleaned successfully.")
        return full_transcript, None

    except Exception as e:
        error_message = str(e)
        logging.error(f"Error during transcript retrieval: {error_message}")
        if "No transcript" in error_message:
            return None, "This video doesn't have available transcripts"
        elif "Language" in error_message:
            return None, "No English transcript available. Try a video with English captions."
        else:
            return None, f"Error retrieving transcript: {error_message}"

def process_video_url(url: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Process video URL and return transcript with proper error handling.
    Returns tuple of (transcript_text, error_message)
    """
    try:
        video_id = extract_and_validate_video_id(url)
        transcript_text, error_message = get_transcript(video_id)
        
        if error_message:
            st.error(error_message)
            return None, error_message
            
        return transcript_text, None

    except ValueError as e:
        logging.error(f"ValueError: {e}")
        st.error(str(e))
        return None, str(e)
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        st.error(f"Unexpected error: {str(e)}")
        return None, str(e)

# Usage in main app:
def handle_video_processing(url: str) -> Optional[str]:
    """
    Main handler for video processing in the Streamlit app
    """
    if not url:
        st.warning("Please enter a YouTube URL")
        return None
        
    transcript_text, error = process_video_url(url)
    
    if error:
        st.info("Please try another video or check if the video has English captions enabled")
        return None
        
    return transcript_text
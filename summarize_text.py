import os
import streamlit as st
import google.generativeai as genai
from typing import List
import streamlit as st
from datetime import datetime
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

load_dotenv()

# Cache the API clients
@st.cache_resource
def get_youtube_client():
    # return build('youtube', 'v3', developerKey=os.getenv('YOUTUBE_API_KEY'))
    return build('youtube', 'v3', developerKey=st.secrets['YOUTUBE_API_KEY'])

@st.cache_data(ttl=3600)
def generate_summary_with_gemini(transcript_text: str, max_retries: int = 3) -> str:
    """
    Generate a summary using Google's Gemini API with proper chunking and retry logic
    """
    # Configure Gemini
    genai.configure(api_key=st.secrets["GEMINI_API_KEY"])
    model = genai.GenerativeModel('gemini-pro')
    
    # Break long transcripts into chunks (Gemini has a context window of ~30k tokens)
    max_chunk_length = 25000
    chunks = [transcript_text[i:i + max_chunk_length] 
    for i in range(0, len(transcript_text), max_chunk_length)]
    
    try:
        if len(chunks) == 1:
            prompt = f"""Please provide a comprehensive summary of this video transcript. 
            Focus on the main points and key takeaways: {chunks[0]}"""
            response = model.generate_content(prompt)
            return response.text
        else:
            # For longer videos, summarize each chunk then combine
            chunk_summaries = []
            for i, chunk in enumerate(chunks):
                prompt = f"""Please provide a brief summary of this part ({i+1}/{len(chunks)}) 
                of the video transcript: {chunk}"""
                response = model.generate_content(prompt)
                chunk_summaries.append(response.text)
            
            # Combine chunk summaries
            final_prompt = f"""Combine these segment summaries into a coherent overall summary 
            of the video: {' '.join(chunk_summaries)}"""
            final_response = model.generate_content(final_prompt)
            return final_response.text
            
    except Exception as e:
        if max_retries > 0:
            st.warning(f"Retrying summary generation... {max_retries} attempts remaining")
            return generate_summary_with_gemini(transcript_text, max_retries - 1)
        else:
            raise Exception(f"Failed to generate summary after all retries: {str(e)}")

# Optional: Progress tracking helper
def track_summarization_progress(current_chunk: int, total_chunks: int, progress_bar, status_text):
    """Update the progress bar during summarization"""
    progress = (current_chunk / total_chunks) * 100
    progress_bar.progress(int(progress))
    status_text.text(f"Summarizing part {current_chunk} of {total_chunks}...")

@st.cache_data(ttl=3600)
def get_video_statistics(video_id):
    """Cached video statistics retrieval"""
    try:
        youtube = get_youtube_client()
        response = youtube.videos().list(
            part="statistics,contentDetails,snippet",
            id=video_id
        ).execute()
        
        if response['items']:
            video_data = response['items'][0]
            snippet = video_data['snippet']
            
            # Extract video information
            video_title = video_data['snippet']['title']
            # thumbnail_url = video_data['snippet']['thumbnails']['high']['url']
            thumbnails = snippet.get("thumbnails", {})
            # Try to get maxres first, then high, then medium, then default
            thumbnail_url = (thumbnails.get("maxres", {}).get("url") or 
                            thumbnails.get("high", {}).get("url") or 
                            thumbnails.get("medium", {}).get("url") or 
                            thumbnails.get("default", {}).get("url", ""))
            
            # Format video statistics
            stats = {
                'views': int(video_data['statistics'].get('viewCount', 0)),
                'likes': int(video_data['statistics'].get('likeCount', 0)),
                'comments': int(video_data['statistics'].get('commentCount', 0)),
                'published': video_data['snippet']['publishedAt'],
                'channel': video_data['snippet']['channelTitle']
            }
            
            # Format numbers for display
            stats['views_formatted'] = f"{stats['views']:,}"
            stats['likes_formatted'] = f"{stats['likes']:,}"
            stats['comments_formatted'] = f"{stats['comments']:,}"
            
            # Format date
            pub_date = datetime.strptime(stats['published'], '%Y-%m-%dT%H:%M:%SZ')
            stats['published_formatted'] = pub_date.strftime('%B %d, %Y')
            
            return video_title, stats, thumbnail_url
        else:
            # Return default values if video not found
            return "Video not found", {
                'views': 0,
                'likes': 0,
                'comments': 0,
                'views_formatted': '0',
                'likes_formatted': '0',
                'comments_formatted': '0',
                'published': '',
                'published_formatted': '',
                'channel': ''
            }, "https://placehold.co/1280x720"
            
    except HttpError as e:
        st.error(f"YouTube API error: {str(e)}")
        # Return default values on error
        return "Error retrieving video", {
            'views': 0,
            'likes': 0,
            'comments': 0,
            'views_formatted': '0',
            'likes_formatted': '0',
            'comments_formatted': '0',
            'published': '',
            'published_formatted': '',
            'channel': ''
        }, "https://placehold.co/1280x720"

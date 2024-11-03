import os
import streamlit as st
import requests
from datetime import datetime
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv
import concurrent.futures

# Cache the API clients
@st.cache_resource
def get_youtube_client():
    return build('youtube', 'v3', developerKey=os.getenv('YOUTUBE_API_KEY'))

@st.cache_data(ttl=3600)  # Cache for 1 hour
def generate_summary_with_gemini(transcript_text, max_retries=3):
    """Optimized summary generation with retries and chunking"""
    if not transcript_text:
        return "No transcript available."
    
    # Break long transcripts into chunks
    max_chunk_length = 30000
    chunks = [transcript_text[i:i + max_chunk_length] 
             for i in range(0, len(transcript_text), max_chunk_length)]
    
    summaries = []
    for chunk in chunks:
        for attempt in range(max_retries):
            try:
                prompt = f"""
                Provide a concise summary of this YouTube video transcript section.
                Focus on:
                - Main topics and key points
                - Important insights
                - Core conclusions
                
                Transcript:
                {chunk}
                """
                
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={os.getenv('GEMINI_API_KEY')}"
                
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": prompt
                        }]
                    }],
                    "generationConfig": {
                        "temperature": 0.3,  # Lower temperature for more consistent summaries
                        "topK": 40,
                        "topP": 0.8,
                        "maxOutputTokens": 800,
                    }
                }
                
                response = requests.post(
                    url, 
                    json=payload, 
                    headers={'Content-Type': 'application/json'},
                    timeout=30  # Add timeout
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if 'candidates' in data and data['candidates']:
                        summaries.append(data['candidates'][0]['content']['parts'][0]['text'])
                        break
            except Exception as e:
                if attempt == max_retries - 1:
                    st.error(f"Failed to process chunk: {str(e)}")
                    return None
                continue
    
    # Combine summaries if text was chunked
    if len(summaries) > 1:
        combined_text = " ".join(summaries)
        # Create final summary
        try:
            final_summary = generate_summary_with_gemini(combined_text)
            return final_summary
        except Exception as e:
            st.error(f"Error combining summaries: {str(e)}")
            return summaries[0]  # Return first summary as fallback
            
    return summaries[0] if summaries else "Failed to generate summary."

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

import os
import streamlit as st
import requests
from datetime import datetime
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

load_dotenv()

# Set API keys
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY') 
API_KEY = os.getenv('GEMINI_API_KEY') 

def generate_summary_with_gemini(transcript_text):
    # (Function code remains the same)
    """
    Generate a concise summary of the video transcript using Gemini AI.
    
    Args:
        transcript_text (str): The video transcript text
    
    Returns:
        str: Generated summary or error message
    """
    try:
        # Create a more specific prompt for better summaries
        prompt = f"""
        Please provide a concise summary of this YouTube video transcript. 
        Focus on:
        - Main topics and key points
        - Important insights
        - Core conclusions
        
        Transcript:
        {transcript_text}
        """
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 800,
            }
        }
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check if we have valid candidates
            if 'candidates' in data and data['candidates']:
                summary = data['candidates'][0]['content']['parts'][0]['text']
                return summary
            else:
                return "Error: No summary generated. The model returned an empty response."
                
        else:
            error_message = f"Error {response.status_code}: {response.text}"
            st.error(error_message)  # Show error in UI
            return f"Failed to generate summary. {error_message}"
            
    except requests.exceptions.RequestException as e:
        error_message = f"Network error occurred: {str(e)}"
        st.error(error_message)  # Show error in UI
        return error_message
        
    except Exception as e:
        error_message = f"An unexpected error occurred: {str(e)}"
        st.error(error_message)  # Show error in UI
        return error_message

def get_video_statistics(video_id):
    # (Function code remains the same)
    try:
        youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
        request = youtube.videos().list(
            part="statistics,contentDetails,snippet",
            id=video_id
        )
        response = request.execute()
        
        if response['items']:
            video_data = response['items'][0]
            statistics = video_data['statistics']
            content_details = video_data['contentDetails']
            snippet = video_data['snippet']
            
            duration = content_details['duration'].replace('PT', '')
            duration = duration.replace('H', ':').replace('M', ':').replace('S', '')
            published_date = datetime.strptime(snippet['publishedAt'], '%Y-%m-%dT%H:%M:%SZ')
            title = snippet.get("title", "Unknown Title")
            channel_title = snippet.get("channelTitle", "Unknown Channel")

            stats = {
                "Views": statistics.get("viewCount", "N/A"),
                "Likes": statistics.get("likeCount", "N/A"),
                "Comments": statistics.get("commentCount", "N/A"),
                "Duration": duration,
                "Published": published_date,
                "Channel": channel_title
            }
            
            # Get the highest quality thumbnail available
            thumbnails = snippet.get("thumbnails", {})
            # Try to get maxres first, then high, then medium, then default
            thumbnail_url = (thumbnails.get("maxres", {}).get("url") or 
                            thumbnails.get("high", {}).get("url") or 
                            thumbnails.get("medium", {}).get("url") or 
                            thumbnails.get("default", {}).get("url", ""))
            
            return title, stats, thumbnail_url
        return "Video not found", {}, ""
    except HttpError as e:
        return f"An error occurred: {e}", {}, ""
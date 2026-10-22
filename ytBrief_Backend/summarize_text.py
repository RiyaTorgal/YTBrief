import os
import requests
from datetime import datetime
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set API keys
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY') 
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

def generate_summary_with_gemini(transcript_text):
    """Generate structured summary using Gemini AI"""
    try:
        if not GEMINI_API_KEY:
            return "Error: Gemini API key not configured"
        
        if not transcript_text or len(transcript_text.strip()) == 0:
            return "Error: No transcript text provided"
        
        # Limit transcript length to avoid token limits
        max_chars = 30000  # Adjust based on your needs
        if len(transcript_text) > max_chars:
            transcript_text = transcript_text[:max_chars] + "..."
        
        prompt = f"""
        Please provide a structured summary of this YouTube video transcript. 
        Format the summary with the following sections, using bullet points (-) for each item:

        Main Topics and Key Points:
        - [key point 1]
        - [key point 2]
        ...

        Important Insights:
        - [insight 1]
        - [insight 2]
        ...

        Core Conclusions:
        - [conclusion 1]
        - [conclusion 2]
        ...

        Transcript:
        {transcript_text}
        """
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        
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
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if 'candidates' in data and data['candidates']:
                candidate = data['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content']:
                    summary = candidate['content']['parts'][0]['text']
                    return summary
                else:
                    return "Error: Invalid response structure from Gemini API"
            else:
                return "Error: No summary generated. The model returned an empty response."
        else:
            error_msg = f"Failed to generate summary. Error {response.status_code}"
            try:
                error_data = response.json()
                if 'error' in error_data:
                    error_msg += f": {error_data['error'].get('message', 'Unknown error')}"
            except:
                error_msg += f": {response.text}"
            return error_msg
            
    except requests.exceptions.Timeout:
        return "Error: Request to Gemini API timed out"
    except requests.exceptions.RequestException as e:
        return f"Error: Network error while calling Gemini API: {str(e)}"
    except Exception as e:
        return f"An error occurred while generating the summary: {str(e)}"

def get_video_statistics(video_id):
    """Get video statistics using YouTube Data API"""
    try:
        if not YOUTUBE_API_KEY:
            return "Error: YouTube API key not configured", {}, ""
        
        if not video_id:
            return "Error: No video ID provided", {}, ""
        
        youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
        request = youtube.videos().list(
            part="statistics,contentDetails,snippet",
            id=video_id
        )
        response = request.execute()
        
        if not response['items']:
            return "Error: Video not found", {}, ""
        
        video_data = response['items'][0]
        statistics = video_data.get('statistics', {})
        snippet = video_data.get('snippet', {})
        content_details = video_data.get('contentDetails', {})
        
        # Extract basic info
        title = snippet.get("title", "Unknown Title")
        channel_title = snippet.get("channelTitle", "Unknown Channel")
        
        # Extract statistics
        views = statistics.get("viewCount", "N/A")
        likes = statistics.get("likeCount", "N/A")
        comments = statistics.get("commentCount", "N/A")
        
        # Parse duration
        duration = content_details.get('duration', 'PT0S')
        duration_formatted = parse_duration(duration)
        
        # Parse published date
        published_date = "Unknown"
        if 'publishedAt' in snippet:
            try:
                published_date = datetime.strptime(snippet['publishedAt'], '%Y-%m-%dT%H:%M:%SZ')
                published_date = published_date.strftime('%Y-%m-%d')
            except:
                published_date = snippet['publishedAt']
        
        # Compile statistics
        stats = {
            "Views": format_number(views),
            "Likes": format_number(likes),
            "Comments": format_number(comments),
            "Duration": duration_formatted,
            "Published": published_date,
            "Channel": channel_title
        }
        
        # Get best available thumbnail
        thumbnails = snippet.get("thumbnails", {})
        thumbnail_url = (
            thumbnails.get("maxres", {}).get("url") or 
            thumbnails.get("high", {}).get("url") or 
            thumbnails.get("medium", {}).get("url") or 
            thumbnails.get("default", {}).get("url", "")
        )
        
        return title, stats, thumbnail_url
        
    except HttpError as e:
        error_msg = f"YouTube API error: {e}"
        if e.resp.status == 403:
            error_msg = "YouTube API quota exceeded or API key invalid"
        elif e.resp.status == 404:
            error_msg = "Video not found"
        return error_msg, {}, ""
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}", {}, ""

def parse_duration(duration_str):
    """Parse ISO 8601 duration format (PT1H23M45S) to readable format"""
    try:
        # Remove PT prefix
        duration_str = duration_str.replace('PT', '')
        
        hours = 0
        minutes = 0
        seconds = 0
        
        # Extract hours
        if 'H' in duration_str:
            hours = int(duration_str.split('H')[0])
            duration_str = duration_str.split('H')[1]
        
        # Extract minutes
        if 'M' in duration_str:
            minutes = int(duration_str.split('M')[0])
            duration_str = duration_str.split('M')[1]
        
        # Extract seconds
        if 'S' in duration_str:
            seconds = int(duration_str.split('S')[0])
        
        # Format duration
        if hours > 0:
            return f"{hours}:{minutes:02d}:{seconds:02d}"
        else:
            return f"{minutes}:{seconds:02d}"
            
    except Exception as e:
        return "Unknown duration"

def format_number(num_str):
    """Format large numbers with K, M, B suffixes"""
    try:
        if num_str == "N/A" or not num_str:
            return "N/A"
        
        num = int(num_str)
        
        if num >= 1_000_000_000:
            return f"{num / 1_000_000_000:.1f}B"
        elif num >= 1_000_000:
            return f"{num / 1_000_000:.1f}M"
        elif num >= 1_000:
            return f"{num / 1_000:.1f}K"
        else:
            return str(num)
            
    except (ValueError, TypeError):
        return num_str
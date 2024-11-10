import os
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
    try:
        prompt = """
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
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt.format(transcript_text=transcript_text)
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
            if 'candidates' in data and data['candidates']:
                summary = data['candidates'][0]['content']['parts'][0]['text']
                return summary
            else:
                return "Error: No summary generated. The model returned an empty response."
        else:
            return f"Failed to generate summary. Error {response.status_code}: {response.text}"
            
    except Exception as e:
        return f"An error occurred while generating the summary: {str(e)}"


def get_video_statistics(video_id):
    try:
        youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
        request = youtube.videos().list(
            part="statistics,contentDetails,snippet",
            id=video_id
        )
        response = request.execute()
        # print("API response:", response)  # Check the entire response structure
        
        if response['items']:
            video_data = response['items'][0]
            print("Video Data:", video_data)  # Check if statistics and snippet are present
            
            statistics = video_data.get('statistics', {})
            snippet = video_data.get('snippet', {})
            content_details = video_data.get('contentDetails', {})
            duration = content_details['duration'].replace('PT', '')
            duration = duration.replace('H', ':').replace('M', ':').replace('S', '')
            published_date = datetime.strptime(snippet['publishedAt'], '%Y-%m-%dT%H:%M:%SZ')

            title = snippet.get("title", "Unknown Title")
            channel_title = snippet.get("channelTitle", "Unknown Channel")
            views = statistics.get("viewCount", "N/A")
            likes = statistics.get("likeCount", "N/A")
            comments = statistics.get("commentCount", "N/A")

            print("Title:", title)
            print("Channel:", channel_title)
            print("Views:", views)
            print("Likes:", likes)
            print("Comments:", comments)

            stats = {
                "Views": views,
                "Likes": likes,
                "Comments": comments,
                "Duration": duration,
                "Published": published_date,
                "Channel": channel_title
            }
            thumbnails = snippet.get("thumbnails", {})
            ##Try to get maxres first, then high, then medium, then default
            thumbnail_url = (thumbnails.get("maxres", {}).get("url") or 
            thumbnails.get("high", {}).get("url") or 
            thumbnails.get("medium", {}).get("url") or 
            thumbnails.get("default", {}).get("url", ""))

            # Continue with thumbnail, duration, and published date extraction...
            # Assemble and return all the info as before
        
        return title, stats, thumbnail_url
    except HttpError as e:
        print(f"HTTP error occurred: {e}")
        return "An error occurred while fetching video details.", {}, ""
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return "An unexpected error occurred.", {}, ""
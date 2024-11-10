import sys
import re
import requests
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi

def extractVidID(url):
    match = re.search(r"(?:v=|youtu\.be/|embed/|/v/|/videos/|/watch\?v=|&v=|/shorts/|/video/)([a-zA-Z0-9_-]{11})", url)
    if match:
        return match.group(1)
    else:
        raise ValueError("Invalid YouTube URL")
    
def extractMetaData(url):
    r = requests.get(url)
    soup = BeautifulSoup(r.text, features="html.parser")
    title = soup.find("title").text
    channel = soup.find("link", itemprop="name")['content']
    return title, channel

def downloadDP(vidID):
    imgURL = f"https://img.youtube.com/vi/{vidID}/hqdefault.jpg"
    imgData = requests.get(imgURL).content
    with open('thumbnail.jpg', 'wb') as handler:
        handler.write(imgData)

def transcript(vidID):
    try:
        Raw = YouTubeTranscriptApi.get_transcript(vidID, languages=['en'])
        # Clean and combine the transcript text
        transcript_parts = []
        for part in Raw:
            text = part['text'].strip()
            # Remove speaker labels and brackets
            text = re.sub(r'\[.*?\]', '', text)
            text = re.sub(r'\(.*?\)', '', text)
            if text:
                transcript_parts.append(text)
        
        Full = ' '.join(transcript_parts)
        # Remove multiple spaces and clean up punctuation
        Full = re.sub(r'\s+', ' ', Full).strip()
        return Full
    except Exception as e:
        return f"Error retrieving transcript: {str(e)}"
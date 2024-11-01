import streamlit as st
from scrape_yt import extractVidID, extractMetaData, transcript, downloadDP
import requests
import os
from dotenv import load_dotenv
from datetime import datetime
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

load_dotenv()

# Add API keys
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY') 
API_KEY = os.getenv('GEMINI_API_KEY') 

def get_video_statistics(video_id):
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
            
            # Convert duration from ISO 8601 format
            duration = content_details['duration'].replace('PT', '')
            duration = duration.replace('H', ':').replace('M', ':').replace('S', '')
            
            # Convert publish date to readable format
            publish_date = datetime.strptime(snippet['publishedAt'], '%Y-%m-%dT%H:%M:%SZ')
            
            return {
                'views': int(statistics.get('viewCount', 0)),
                'likes': int(statistics.get('likeCount', 0)),
                'comments': int(statistics.get('commentCount', 0)),
                'duration': duration,
                'publish_date': publish_date.strftime('%B %d, %Y'),
                'channel_title': snippet['channelTitle']
            }
    except HttpError as e:
        st.error(f"Error fetching video statistics: {str(e)}")
        return None

def display_video_stats(stats):
    # Create three columns for the first row
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric(
            label="👁️ Views",
            value=f"{stats['views']:,}"
        )
    
    with col2:
        st.metric(
            label="👍 Likes",
            value=f"{stats['likes']:,}"
        )
    
    with col3:
        st.metric(
            label="💬 Comments",
            value=f"{stats['comments']:,}"
        )
    
    # Create three columns for the second row
    col4, col5, col6 = st.columns(3)
    
    with col4:
        st.metric(
            label="⏱️ Duration",
            value=stats['duration']
        )
    
    with col5:
        st.metric(
            label="📅 Published",
            value=stats['publish_date']
        )
    
    with col6:
        st.metric(
            label="📺 Channel",
            value=stats['channel_title']
        )

def generate_summary_with_gemini(transcript):
    """
    Generate a concise summary of the video transcript using Gemini AI.
    
    Args:
        transcript (str): The video transcript text
    
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
        {transcript}
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


def main():

    st.markdown("""
        <style>
        [data-testid="stMetricValue"] {
            font-size: 18px !important;
        }
        </style>
        """, unsafe_allow_html=True)

    title_text = "YTBrief: YouTube AI Video Summarizer"
    image_url = "https://i.pinimg.com/originals/3a/36/20/3a36206f35352b4230d5fc9f17fcea92.png"
    html_code = f"""
    <div style="display: flex; align-items: center; margin-bottom: 30px;">
        <img src="{image_url}" alt="Tiny Image" style="width: 50px; height: 50px; margin-right: 15px;">
        <h3 style="font-size: 45px;">{title_text}</h3>
    </div>
    """
    st.markdown(html_code, unsafe_allow_html=True)

    st.subheader("Enter YouTube URL:")
    st.write("Paste a YouTube link to summarize its content (must have a transcript available)")
    url = st.text_input("URL")
    language = st.radio("Select language to output:", ('English', 'Spanish', 'Korean', 'Hindi', 'Marathi'))

    def get_thumbnail_from_url(url):
        video_id = extractVidID(url)
        downloadDP(video_id)
    
    def get_transcript_from_url(url):
        video_id = extractVidID(url)
        transcript_text = transcript(video_id)
        return transcript_text
    
    if st.button("Summarize"):
        if url:
            try:
                video_id = extractVidID(url)
                title, channel = extractMetaData(url)
                st.subheader("Title:")
                st.write(title)
                st.subheader("Channel:")
                st.write(channel)
                    
                # Show thumbnail
                with st.spinner('Downloading thumbnail...'):
                    get_thumbnail_from_url(url)
                    st.image(os.path.join(os.getcwd(), "thumbnail.jpg"), 
                            caption='Thumbnail', 
                            use_column_width=True)

                st.subheader("Video Statistics:")
                # with st.spinner('Fetching video statistics...'):
                stats = get_video_statistics(video_id)
                if stats:
                    display_video_stats(stats)
                    
                    # Generate and display summary
                    with st.spinner('Retrieving transcript...'):
                        transcript_content = get_transcript_from_url(url)
                        if "Error retrieving transcript" in transcript_content:
                            st.error(transcript_content)
                        else:
                            with st.spinner('Generating summary...'):
                                summary = generate_summary_with_gemini(transcript_content)
                                st.subheader("Video Summary:")
                                st.write(summary)
                
            except Exception as e:
                st.error(f"An error occurred: {str(e)}")
        else:
            st.warning("Please enter a YouTube URL.")

if __name__ == "__main__":
    main()
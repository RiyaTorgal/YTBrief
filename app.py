import streamlit as st
from scrape_yt import extractVidID, extractMetaData, transcript, downloadDP
import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Hardcode your API key here
API_KEY = os.getenv('GEMINI_API_KEY')   # Replace with your actual API key

def generate_summary_with_gemini(transcript):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
    payload = {
        "contents": [{
            "parts": [{"text": transcript}]
        }]
    }
    headers = {
        'Content-Type': 'application/json'
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        summary = data['candidates'][0]['content']['parts'][0]['text']
        return summary
    else:
        return f"Error: {response.status_code} - {response.text}"

def main():
    title_text = "YTBrief: YouTube AI Video Summarizer"
    image_url = "https://i.pinimg.com/originals/3a/36/20/3a36206f35352b4230d5fc9f17fcea92.png"
    html_code = f"""
    <div style="display: flex; align-items: center; margin-bottom: 30px;">
        <img src="{image_url}" alt="Tiny Image" style="width: 50px; height: 50px; margin-right: 15px;">
        <h3 style="font-size: 45px;">{title_text}</h3>
    </div>
    """
    st.markdown(html_code, unsafe_allow_html=True)

    def get_thumbnail_from_url(url):
        video_id = extractVidID(url)
        downloadDP(video_id)
    
    def get_transcript_from_url(url):
        video_id = extractVidID(url)
        transcript_text = transcript(video_id)
        return transcript_text

    st.subheader("Enter YouTube URL:")
    st.write("Paste a YouTube link to summarize its content (must have a transcript available)")
    url = st.text_input("URL")
    language = st.radio("Select language to output:", ('English', 'Spanish', 'Korean', 'Hindi', 'Marathi'))
    
    if st.button("Summarize"):
        if url:
            title, channel = extractMetaData(url)
            st.subheader("Title:")
            st.write(title)
            st.subheader("Channel:")
            st.write(channel)
            
            # Show loading spinner for thumbnail download
            with st.spinner('Downloading thumbnail...'):
                get_thumbnail_from_url(url)
                st.image(os.path.join(os.getcwd(), "thumbnail.jpg"), caption='Thumbnail', use_column_width=True)
            
            # Show loading spinner for transcript retrieval
            with st.spinner('Retrieving transcript...'):
                transcript_content = get_transcript_from_url(url)
                if "Error retrieving transcript" in transcript_content:
                    st.error(transcript_content)
                else:
                    # Show loading spinner for summary generation
                    with st.spinner('Generating summary...'):
                        summary = generate_summary_with_gemini(transcript_content)
                        st.subheader("Video Summary:")
                        st.write(summary)
        else:
            st.warning("Please enter a YouTube URL.")

if __name__ == "__main__":
    main()

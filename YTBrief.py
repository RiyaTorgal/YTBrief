import streamlit as st
from scrape_yt import extract_and_validate_video_id, get_transcript
import os
from dotenv import load_dotenv
from summarize_text import generate_summary_with_gemini, get_video_statistics
import concurrent.futures

# Load environment variables
load_dotenv()

# Set API keys
YOUTUBE_API_KEY = st.secrets['YOUTUBE_API_KEY']
API_KEY = st.secrets['GEMINI_API_KEY']
# YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY') 
# API_KEY = os.getenv('GEMINI_API_KEY') 

st.set_page_config(page_title="YTBrief YouTube AI Video Summarizer", layout="wide")

def main():
    if 'processing_state' not in st.session_state:
        st.session_state.processing_state = {
            'is_processing': False,
            'progress': 0,
            'status': ''
        }
    st.markdown(
        """
        <style>
        .site_desc{
            font-size: 1.2rem;
        }

        .video-title {
            font-size: 2em;
            font-weight: bold;
        }

        .video-stats {
            font-size: 1.1em;
            margin-top: 0.5em;
            margin-bottom: 0.7rem;
        }

        .video-summary {
            line-height: 1.6;
            padding: 1rem 0px 1rem;
            border-radius: 8px;
        }

        .stat-label {
            font-weight: bold;
        }

        .footer {
            font-size: 0.9em;
            color: #999;
            margin-top: 50px;
        }
        </style>
        """,
        unsafe_allow_html=True
    )

    # Title and description
    st.title("YTBrief: YouTube AI Video Summarizer")

    # Initialize variables
    placeholder_url = "https://placehold.co/1280x720"
    video_title = ""
    video_stats = {}
    thumbnail_url = ""
    video_summary = "No summary available."

    # Layout: Input area on the right, thumbnail and summary on the left
    col1, col2 = st.columns([2, 2])
    with col1:
        st.write(f"<div class='site_desc'>YTBrief: Your go-to tool for quick video insights. Paste a YouTube link to instantly see video stats and a streamlined summary of the content.</div>", 
                    unsafe_allow_html=True)
    with col2:
        st.write(f"<div class='site_desc'>Enter the URL of the video you want to summarize:</div>", 
                    unsafe_allow_html=True)
        url = st.text_input("Video URL")

        if st.button("Summarize"):
            try:
                st.session_state.processing_state['is_processing'] = True
                progress_bar = st.progress(0)
                status_text = st.empty()
                
                def update_progress(progress, status):
                    st.session_state.processing_state['progress'] = progress
                    st.session_state.processing_state['status'] = status
                    progress_bar.progress(progress)
                    status_text.text(status)
                
                update_progress(10, "Extracting video ID...")
                video_id = extractVidID(url)
                
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    update_progress(20, "Fetching video information...")
                    future_stats = executor.submit(get_video_statistics, video_id)
                    
                    update_progress(40, "Fetching transcript...")
                    future_transcript = executor.submit(transcript, video_id)
                    
                    video_title, video_stats, thumbnail_url = future_stats.result()
                    video_transcript = future_transcript.result()
                
                update_progress(60, "Generating summary...")
                video_summary = generate_summary_with_gemini(video_transcript)
                
                update_progress(100, "Done!")
        
            except Exception as e:
                st.error(f"An error occurred: {str(e)}")
            finally:
                st.session_state.processing_state['is_processing'] = False

    # Display results
    col3, col4 = st.columns([2, 2])
    with col3:
        if thumbnail_url:
            st.image(thumbnail_url, caption="Video Thumbnail", use_column_width=True)
        else:
            st.image(placeholder_url, caption="Video Thumbnail", use_column_width=True)

    # Displaying Stats in a custom format
    with col4:
        if video_stats:
            st.markdown(f"<div class='video-title'>Stats:</div>", unsafe_allow_html=True)
            
            # Map the stats we want to display with their formatted values
            stats_mapping = {
                'Views': video_stats.get('views_formatted', 'N/A'),
                'Likes': video_stats.get('likes_formatted', 'N/A'),
                'Comments': video_stats.get('comments_formatted', 'N/A'),
                'Published': video_stats.get('published_formatted', 'N/A')
            }
            
            for stat_label, stat_value in stats_mapping.items():
                st.markdown(
                    f"<div class='video-stats'><span class='stat-label'>{stat_label}:</span> {stat_value}</div>",
                    unsafe_allow_html=True
                )

    if video_title:
        st.markdown(f"<div class='video-title'>{video_title}</div>", unsafe_allow_html=True)
        st.markdown(
            f"<div class='video-stats'><span class='stat-label'>Channel:</span> {video_stats.get('channel', 'Unknown Channel')}</div>",
            unsafe_allow_html=True
        )

    col5, col6 = st.columns([2, 2])
    with col5:
        st.subheader("Video Summary")
        
    with col6:
        if st.button("Read Out Loud"):
            st.write("Reading out the summary...")
            
    st.markdown(f"<div class='video-summary'>{video_summary}</div>", unsafe_allow_html=True)

    # Footer
    st.markdown("<div class='footer'>©2024 YTBrief All Rights Reserved</div>", unsafe_allow_html=True)

if __name__ == "__main__":
    main()
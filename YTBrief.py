import streamlit as st
from scrape_yt import extractVidID, transcript  # Importing only necessary functions
import os
from dotenv import load_dotenv
from summarize_text import generate_summary_with_gemini, get_video_statistics

# Load environment variables
load_dotenv()

# Set API keys
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY') 
API_KEY = os.getenv('GEMINI_API_KEY') 



st.set_page_config(page_title="YTBrief YouTube AI Video Summarizer", layout="wide")

# Title and description
# st.title("YTBrief YouTube AI Video Summarizer")


# # Initialize variables
# video_title = ""
# video_stats = {}
# thumbnail_url = ""
# video_summary = "No summary available."

# # Layout: Input area on the right, thumbnail and summary on the left
# col1, col2 = st.columns([2, 2])
# with col1:
#     st.write("YTBrief is an AI YouTube video summarizer which displays the stats of the respective YouTube video as well as the summary")
# with col2:
#     st.write("Enter the URL you want to summarize:")
#     url = st.text_input("")

#     if st.button("Summarize"):
#         video_id = extractVidID(url)
#         video_title, video_stats, thumbnail_url = get_video_statistics(video_id)
        
#         # Fetching the transcript
#         video_transcript = transcript(video_id)
        
#         # Generating summary using Gemini API
#         video_summary = generate_summary_with_gemini(video_transcript) if video_transcript else "Transcript not available."

# # Display Video Thumbnail, Title, and Stats in col1
# col3, col4 = st.columns([2, 2])
# with col3:
#     if thumbnail_url:
#         st.image(thumbnail_url, caption="Video Thumbnail", width=500)
#     else:
#         st.write("[Video Thumbnail Placeholder]")
    
#     if video_title:
#         st.subheader(video_title)
#     st.write(f"**Channel:** {video_stats.get('Channel', 'Unknown Channel')}")

#     # Displaying Stats in a 2x3 grid format
#     with col4:
#         stats_columns = st.columns(2)
#         stats_values = ["Views", "Likes", "Comments", "Duration", "Published", "Channel"]
#         for i, stat in enumerate(stats_values):
#             stats_columns[i % 2].write(f"**{stat}:** {video_stats.get(stat, 'N/A')}")

# # Main area for summary and 'Read Out Loud' button
# col5, col6 = st.columns([2, 2])
# with col5:
#     st.subheader("Video Summary")
    
# with col6:
#     if st.button("Read Out Loud", key="read_out_loud_1"):
#         st.write("Reading out the summary...")
# st.write(video_summary)  # Displaying the generated summary


# # Footer
# st.write("©2024 YTBrief All Right Reserved")

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
        video_id = extractVidID(url)
        video_title, video_stats, thumbnail_url = get_video_statistics(video_id)
        
        # Fetching the transcript
        video_transcript = transcript(video_id)
        
        # Generating summary using Gemini API
        video_summary = generate_summary_with_gemini(video_transcript) if video_transcript else "Transcript not available."

st.subheader("Video Information")
# Display Video Thumbnail, Title, and Stats in col1
col3, col4 = st.columns([2, 2])
with col3:
    if thumbnail_url:
        st.image(thumbnail_url, caption="Video Thumbnail", use_column_width=True)
    else:
        st.image(placeholder_url, caption="Video Thumbnail", use_column_width=True)
    

    # Displaying Stats in a custom format
    with col4:
        stats_values = ["Views", "Likes", "Comments", "Duration", "Published"]
        st.markdown(f"<div class='video-title'>Stats:</div>", unsafe_allow_html=True)
        for stat in stats_values:
            st.markdown(
                f"<div class='video-stats'><span class='stat-label'>{stat}:</span> {video_stats.get(stat, 'N/A')}</div>", 
                unsafe_allow_html=True
            )

if video_title:
        st.markdown(f"<div class='video-title'>{video_title}</div>", unsafe_allow_html=True)
        st.markdown(f"<div class='video-stats'><span class='stat-label'>Channel:</span> {video_stats.get('Channel', 'Unknown Channel')}</div>", unsafe_allow_html=True)

# Main area for summary
col5, col6 = st.columns([2, 2])
with col5:
    st.subheader("Video Summary")
    
with col6:
    if st.button("Read Out Loud"):
        st.write("Reading out the summary...")

st.markdown(f"<div class='video-summary'>{video_summary}</div>", unsafe_allow_html=True)  # Displaying the styled summary


# Footer
st.markdown("<div class='footer'>©2024 YTBrief All Rights Reserved</div>", unsafe_allow_html=True)

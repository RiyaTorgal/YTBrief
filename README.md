# YTBrief: YouTube AI Video Summarizer

![YTBrief Logo](https://github.com/RiyaTorgal/YTBrief/blob/main/images/YTBrief.png)

YTBrief is a simple web application that summarizes YouTube videos using the Gemini API. Users can paste a YouTube link, and the application retrieves the video’s transcript and generates a concise summary, making it easier to grasp the content without watching the entire video.

## Features

- Enter a YouTube URL to summarize its content (transcript must be available).
- Displays the video title, channel name, and thumbnail.
- Displays the stats (Views, Likes, Comments, Duration, Published, Channel)
- Generates video summaries in multiple languages (English, Spanish, Korean, Hindi, Marathi).
- Utilizes the Gemini API for summarization.

## Requirements

- Python 3.7 or higher
- [Streamlit](https://streamlit.io/) for creating an easy-to-use web app framework.
- [Gemini API](https://developers.google.com/generative-language/docs) for summarization capabilities.
- [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/) for web scraping functionality.
- [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) for retrieving video transcripts.
- [python-dotenv](https://pypi.org/project/python-dotenv/) for managing environment variables and securely loading API keys from a `.env` file.
- [google-api-python-client](https://github.com/googleapis/google-api-python-client) for enabling seamless integration with Google APIs.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ytbrief.git
   ```
2. Change the Directory

   ```bash
   cd ytbrief
   ```
3. Install required Packages

   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the root directory of the project and add your Gemini and YouTube Data API key

    ```bash
    GEMINI_API_KEY = "your_api_key_here"
    YOUTUBE_API_KEY = "Your_YouTube_Data_API_Key"
    ```

## Useage

1. Run the streamlit application

   ```bash
   streamlit run YTBrief.py
   ```
2. Open your browser and go to `http://localhost:8501.`

3. Enter a YouTube URL in the input field and click the "Summarize" button. The application will display the video title, channel name, thumbnail, and the generated summary.

## Output
![Demo GIF](https://github.com/RiyaTorgal/YTBrief/blob/main/images/YTBrief_Output-ezgif.com-optimize.gif)

## Contributions
Contributions are welcome! Please fork the repository and submit a pull request with your changes.

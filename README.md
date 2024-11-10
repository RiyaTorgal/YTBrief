# YTBrief: YouTube AI Video Summarizer

![YTBrief Application](https://github.com/RiyaTorgal/YTBrief/blob/main/images/YTBrief(New).jpeg)

YTBrief is a simple web application that summarizes YouTube videos using the Gemini API. Users can paste a YouTube link, and the application retrieves the video’s transcript and generates a concise summary, making it easier to grasp the content without watching the entire video.

## Project Structure

The project is organized into two main parts:

- **Frontend**: Contains the ReactJS UI, located in the `yt-brief` folder.
- **Backend**: Contains the Flask server and Python scripts, located in the `ytBrief_Backend` folder.

## Features

- Enter a YouTube URL to summarize its content (transcript must be available).
- Displays the video title, channel name, and thumbnail.
- Displays the stats (Views, Likes, Comments, Duration, Published, Channel)
- Utilizes the Gemini API for summarization.

## Requirements

- Python 3.7 or higher
- [ReactJS](https://react.dev) for creating an easy-to-use web app framework.
- [Flask](https://flask.palletsprojects.com/en/stable/) for handleling API requests from the backend
- [Gemini API](https://developers.google.com/generative-language/docs) for summarization capabilities.
- [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/) for web scraping functionality.
- [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) for retrieving video transcripts.
- [python-dotenv](https://pypi.org/project/python-dotenv/) for managing environment variables and securely loading API keys from a `.env` file.
- [google-api-python-client](https://github.com/googleapis/google-api-python-client) for enabling seamless integration with Google APIs.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/RiyaTorgal/YTBrief.git
   ```
2. Change the Directory

   ```bash
   cd YTBrief
   ```

3. Create a `.env` file in the root directory of the project and add your Gemini and YouTube Data API key

    ```bash
    GEMINI_API_KEY = "Your_Gemini_api_Key"
    YOUTUBE_API_KEY = "Your_YouTube_Data_API_Key"
    ```
## Setup Instructions

### Frontend (ReactJS)

1. Navigate to the `yt-brief` folder:

   ```bash
   cd yt-brief
   ```
2. Install Dependencies:

   ```bash
   npm install
   ```
3. Start the React App:

   ```bash
   npm run start
   ```

### Backend (Flask)

1. Navigate to the `ytBrief_Backend` folder:

   ```bash
   cd ytBrief_Backend
   ```
2. Install required Python packages:

   ```bash
   pip install -r requirements.txt
   ```
3. Start the Flask serve:

   ```bash
   python app.py
   ```

## Running the Application

1. Start both the frontend and backend servers in separate terminals.
   
2. Open the frontend app by navgating to `http://localhost:3000` in your browser

3. Enter a YouTube URL in the input field and click the "Summarize" button. The application will display the video title, channel name, thumbnail, and the generated summary.

## Output
![Output GIF](https://github.com/RiyaTorgal/YTBrief/blob/main/images/YTBrief(New)Output.gif)

## Contributions
Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License
This project is licensed under the MIT license - see the LICENSE file for details.

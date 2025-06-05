import React from 'react';
import Filters from '../components/FilterSection';
import VideoInformation from '../components/VideoInformation';

const Dashboard = ({
  videoTitle,
  videoStats,
  thumbnailUrl,
  videoSummary,
  isLoading,
  error,
  isSpeaking,
  isPaused,
  handleSummarize,
  handleDownloadPDF,
  readAloud,
  togglePauseSpeech
}) => {
  return (
    <div className="max-w-7xl mx-4 p-2 font-sans">
      <div className="max-w-7xl mx-auto p-2 font-sans">
        <div className="items-center space-x-2">
          <h1 className="text-5xl mb-2 font-bold">YTBrief</h1>
          <h1 className="text-3xl text_tone font-semibold">YouTube AI Video Summarizer</h1>
        </div>
        
        <div className="mt-5">
          <p className="text-lg">
            YTBrief is a web application designed to summarize YouTube videos using the Gemini API.
          </p>
          <p className="text-lg">
            It automates the extraction of video transcripts, providing users with concise summaries that include key statistics of the video.
          </p>
          <p className="text-lg mb-6">
            This application also offers PDF downloads for offline access and a 'Read out Loud' feature for auditory playback of the summaries.
          </p>
          
          <div className="flex flex-col h-full justify-center mb-5">
            <p className="text-gray-800 text-lg font-semibold mb-2">Enter the URL you want to summarize:</p>
            <input
              type="text"
              id="video-url"
              placeholder="Paste YouTube URL here"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 mb-2"
            />
            <button
              className={`px-4 text-lg font-semibold py-2 bg-red-600 hover:bg-red-200 text-white hover:text-red-600 border border-red-600 hover:border-transparent rounded-md transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSummarize}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Summarize'}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </div>
        
        <Filters />
        
        {videoTitle && (
          <VideoInformation
            videoTitle={videoTitle}
            videoStats={videoStats}
            thumbnailUrl={thumbnailUrl}
            videoSummary={videoSummary}
            isSpeaking={isSpeaking}
            isPaused={isPaused}
            onDownloadPDF={handleDownloadPDF}
            onReadAloud={readAloud}
            onTogglePause={togglePauseSpeech}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState } from 'react';
import './App.css'
import { IoMdSunny } from "react-icons/io";
import { BiSolidLike } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import { FaComments } from "react-icons/fa";
import { MdAccessTimeFilled } from "react-icons/md";
import { MdUpload } from "react-icons/md";
import { HiSpeakerWave } from "react-icons/hi2";


function YTBrief() {
  const [videoTitle, setVideoTitle] = useState('');
  const [videoStats, setVideoStats] = useState({});
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoSummary, setVideoSummary] = useState({
    mainTopics: [],
    insights: [],
    conclusions: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatText = (text) => {
    // First handle bold text (wrapped in **)
    const boldFormatted = text.split(/(\*\*.*?\*\*)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove the ** and wrap in bold
        return <strong key={`bold-${index}`}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    
    // Then handle each part for underline (wrapped in ``)
    return boldFormatted.map((part, index) => {
      if (typeof part === 'string') {
        return part.split(/(`.*?`)/).map((subPart, subIndex) => {
          if (subPart.startsWith('`') && subPart.endsWith('`')) {
            return <strong key={`bold-${index}-${subIndex}`}>{subPart.slice(1, -1)}</strong>;
          }
          return subPart;
        });
      }
      return part;
    });
  };


  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseVideoSummary = (summaryText) => {
    const sections = {
      mainTopics: [],
      insights: [],
      conclusions: []
    };

    // Split the summary into lines and categorize them
    const lines = summaryText.split('\n');
    let currentSection = null;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toLowerCase().includes('main topics') || trimmedLine.toLowerCase().includes('key points')) {
        currentSection = 'mainTopics';
      } else if (trimmedLine.toLowerCase().includes('important insights')) {
        currentSection = 'insights';
      } else if (trimmedLine.toLowerCase().includes('core conclusions')) {
        currentSection = 'conclusions';
      } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
        if (currentSection && trimmedLine.length > 1) {
          sections[currentSection].push(trimmedLine.substring(1).trim());
        }
      }
    });

    return sections;
  };

  const handleSummarize = async () => {
    const url = document.getElementById('video-url').value;
    if (!url) {
      setError('Please enter a YouTube URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/video-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch video information');
      }

      const data = await response.json();
      
      setVideoTitle(data.title);
      setVideoStats({
        ...data.stats,
        publishedDate: formatDate(data.stats.Published)
      });
      setThumbnailUrl(data.thumbnail);
      setVideoSummary(parseVideoSummary(data.summary));
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const BulletList = ({ items, title }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-6">
        <h2 className="font-semibold text-2xl mb-2">{title}:</h2>
        <ul className="list-disk list-inside ml-6 text-gray-700 text-lg space-y-2">
          {items.map((item, index) => (
            // <li key={index}>{item}</li>
            <li key={index} className="pl-2">
              <span className="mr-2">•</span>
              <span className="flex-1">{formatText(item)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  return (
    <>
      {/* Header section remains the same */}
      <header className="p-4 flex justify-between items-center mb-4">
        <div className="logo-placeholder1"></div>
        <IoMdSunny className="text-2xl"/>
      </header>

      {/* Main content container */}
      <div className="max-w-7xl mx-auto p-2 font-sans">
        {/* Title and description section remains the same */}
        <div className="flex items-center space-x-2">
          <h1 className="text-4xl font-bold">YTBrief</h1>
          <h1 className="text-4xl font-bold">:YouTube AI Video Summarizer</h1>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-5">
        <p className="text-gray-700 text-lg mb-6">
          YTBrief is an AI-driven YouTube video summarizer that provides users with a quick overview of video content which includes key statistics of the video, along with a concise summary of the video. This tool helps users quickly grasp the main points of YouTube videos without needing to watch the full content.
        </p>
        <div className="flex flex-col h-full justify-center">
          <p className="text-gray-800 text-lg mb-2">Enter the URL you want to summarize:</p>
          <input
            type="text"
            id="video-url"
            placeholder="Paste YouTube URL here"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
          />
          {/* <button className="px-4 text-lg py-2 bg-transparent hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-500 hover:border-transparent rounded-md transition">
            Summarize
          </button> */}
          <button
              className={`px-4 text-lg py-2 bg-transparent hover:bg-red-600 text-red-600 hover:text-white border border-red-600 hover:border-transparent rounded-md transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSummarize}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Summarize'}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>

        {/* Video information section */}
        <h1 className="text-3xl font-bold mb-4">Video Information:</h1>
        <div className="flex mb-6">
          <div className="flex-1">
            <img src={thumbnailUrl || "https://placehold.co/1280x720"} alt="Video Thumbnail" className="rounded-md" />
          </div>

          <div className="flex-1 ml-6 mt-6">
            <h1 className="text-3xl font-bold mb-4">Video Stats:</h1>
            <div className="space-y-2">
              <StatsRow icon={<BiSolidLike />} label="Likes" value={videoStats.Likes} />
              <StatsRow icon={<FaEye />} label="Views" value={videoStats.Views} />
              <StatsRow icon={<FaComments />} label="Comments" value={videoStats.Comments} />
              <StatsRow icon={<MdAccessTimeFilled />} label="Duration" value={videoStats.Duration} />
              <StatsRow icon={<MdUpload />} label="Published" value={videoStats.publishedDate} />
            </div>
          </div>
        </div>

        {/* Video title and channel section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">{videoTitle}</h1>
          <h2 className="text-gray-600 text-xl mb-4">Channel: {videoStats.Channel}</h2>
          
          {/* Summary section */}
          <div className='border border-slate-300 rounded-lg shadow-md p-5'>
            <div className="flex mt-1 justify-between items-center mb-4">
              <h2 className="text-3xl font-bold">Video Summary</h2>
              <button className="flex items-center px-4 py-2 hover:bg-red-600 text-red-600 hover:text-white border border-red-600 hover:border-transparent rounded-md transition">
                <HiSpeakerWave className='text-xl flex mr-3'/>
                Read Out Loud
              </button>
            </div>
            <div className="space-y-4">
              <BulletList items={videoSummary.mainTopics} title="Main Topics and Key Points" />
              <BulletList items={videoSummary.insights} title="Important Insights" />
              <BulletList items={videoSummary.conclusions} title="Core Conclusions" />
            </div>
          </div>
          

          {/* Structured summary content */}
          
        </div>

        <footer className="text-left text-sm text-gray-500 mt-28">
          ©2024 YTBrief All Right Reserved
        </footer>
      </div>
    </>
  );
}

// Helper component for stats display
const StatsRow = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3">
    <span className="text-xl">{icon}</span>
    <span className="text-lg">{label}:</span>
    <span className="text-lg">{value}</span>
  </div>
);

export default YTBrief;
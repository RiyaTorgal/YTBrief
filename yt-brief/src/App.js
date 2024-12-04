import React, { useState } from 'react';
import jsPDF from 'jspdf';
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
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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

  const readAloud = () => {
    // Combine summary sections
    const fullText = [
      ...videoSummary.mainTopics,
      ...videoSummary.insights,
      ...videoSummary.conclusions
    ].join(' ');
  
    // If already speaking, cancel current speech
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }
  
    // If paused, resume speech
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }
  
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
  
    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(fullText);
  
    // Optional: Select a specific voice (English)
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      voice => voice.lang.includes('en') && !voice.name.includes('Google')
    );
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
  
    // Configure speech properties
    utterance.rate = 0.9;  // Slightly slower for clarity
    utterance.pitch = 1.0; // Normal pitch
  
    // Handle speech events
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
  
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
  
    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };
  
    // Speak the text
    window.speechSynthesis.speak(utterance);
  };
  
  const togglePauseSpeech = () => {
    if (isSpeaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  };

  const handleDownloadPDF = () => {
    // Check if we have content to generate PDF
    if (!videoTitle && (!videoSummary || Object.values(videoSummary).every(arr => arr.length === 0))) {
      setError('No content available to generate PDF. Please summarize a video first.');
      return;
    }
  
    // Create a new jsPDF instance with A4 page size
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  
    // Page width and margins
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15; // 15mm margin on all sides
    const lineHeight = 7; // Consistent line height
  
    // Colors
    const headerColor = [31, 41, 55]; // Dark blue-gray
    const textColor = [55, 65, 81]; // Slightly lighter gray
    const accentColor = [220, 38, 38]; // Red
  
    // Font setup
    doc.setFont('helvetica', 'normal');
  
    const waterMark = (page) => {
      // Background watermark
      doc.setTextColor(230, 230, 230);
      doc.setFontSize(80);
      doc.text('YTBrief', pageWidth/2, pageHeight/2, {
        align: 'center',
        angle: -45,
        opacity: 0.1
      });
      doc.setTextColor(55, 65, 81);
    }

    waterMark(1)
  
    // Reset text color
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
    // Header
    doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.rect(margin, margin, pageWidth - (2 * margin), 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('YouTube Video Summary', pageWidth/2, margin + 12, { align: 'center' });
  
    // Reset text color
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
    // Video Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    // doc.text(videoTitle, pageWidth/2, 45, { align: 'center' });
  
    // Video Stats Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    let yPosition = 60;
  
    // Add video stats
    const statsToShow = [
      { label: 'Channel', value: videoStats.Channel },
      { label: 'Views', value: videoStats.Views },
      { label: 'Likes', value: videoStats.Likes },
      { label: 'Published', value: videoStats.publishedDate }
    ];
  
    statsToShow.forEach(stat => {
      doc.text(`${stat.label}: ${stat.value}`, margin + 10, yPosition);
      yPosition += 7;
    });
  
    yPosition += 10;
  
    // Function to add a section with styling and multi-page support
    const addSection = (title, items) => {
      if (!items || items.length === 0) return;
  
      // Ensure we have enough space, if not, add a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = margin;
      }
      

      // Video Title handling
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');

      if (doc.internal.getNumberOfPages() === 1){
        // Split the title into two lines if it's too long
        const splitTitle = doc.splitTextToSize(
          videoTitle, 
          pageWidth - (2 * margin)  // Subtract margins to ensure it fits
        );

        // If the title is longer than two lines, truncate
        const titleLines = splitTitle.length > 2 
          ? splitTitle.slice(0, 2) 
          : splitTitle;

        // Calculate the total height of the title
        const titleHeight = titleLines.length * 10;  // Adjust line height as needed

        // Calculate the starting Y position to center the title block
        const titleYStart = 45 + (20 - titleHeight) / 2;

        // Render each line of the title centered
        titleLines.forEach((line, index) => {
          doc.text(
            line, 
            pageWidth / 2, 
            titleYStart + (index * 10),  // Adjust spacing between lines
            { align: 'center' }
          );
        });
        
        // Underline
        const titleWidth = doc.getTextWidth(title);
        doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.line(margin + 10, yPosition + 2, margin + 10 + titleWidth, yPosition + 2);
    
        yPosition += 10;
      }
  
      // Section content
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
  
      items.forEach(item => {
        // More advanced text wrapping
        const splitText = doc.splitTextToSize(
          `• ${item}`, 
          pageWidth - (2 * margin) - 20
        );
        
        // Check if we need a new page before adding text
        if (yPosition + (splitText.length * lineHeight) > pageHeight - 30) {
          doc.addPage();
          // waterMark(doc.internal.getNumberOfPages())
          yPosition = margin;
        }
  
        doc.text(splitText, margin + 15, yPosition);
        yPosition += (splitText.length * lineHeight);
      });
  
      yPosition += 5; // Space between sections
    };
  
    // Add summary sections
    addSection('Main Topics', videoSummary.mainTopics);
    addSection('Important Insights', videoSummary.insights);
    addSection('Core Conclusions', videoSummary.conclusions);
  
    // Page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
    }
  
    // Save the PDF
    doc.save(`${videoTitle || 'YouTube Video'}-summary.pdf`);
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
        body: JSON.stringify({ url, language: selectedLanguage }),
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
      <header className="p-4 flex justify-between items-center mb-4">
        <div className="logo-placeholder1"></div>
        <IoMdSunny className="text-2xl"/>
      </header>

      <div className="max-w-7xl mx-auto p-2 font-sans">
        <div className="flex items-center space-x-2">
          <h1 className="text-4xl font-bold">YTBrief</h1>
          <h1 className="text-4xl font-bold">:YouTube AI Video Summarizer</h1>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-5">
          <p className="text-gray-700 text-lg mb-6">
            YTBrief is an AI-driven YouTube video summarizer that provides users with a quick overview of video content including key statistics of the video, along with a concise summary of the video.
          </p>
          <div className="flex flex-col h-full justify-center">
            <p className="text-gray-800 text-lg mb-2">Enter the URL you want to summarize:</p>
            <input
              type="text"
              id="video-url"
              placeholder="Paste YouTube URL here"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
            />
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
        <div className="mb-5">
          <p className="text-gray-800 text-lg mb-2">Select a language in which you want your summary to be in:</p>
          <div className="flex items-center space-x-4">
            {[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Español' },
              { value: 'fr', label: 'Français' },
              { value: 'hi', label: 'Hindi' },
              { value: 'mr', label: 'Marathi' }
            ].map(lang => (
              <div key={lang.value} className="flex items-center ml-2">
                <input 
                  id={`language-${lang.value}`} 
                  type="radio" 
                  name="language" 
                  value={lang.value} 
                  className="w-5 h-5"
                  checked={selectedLanguage === lang.value}
                  onChange={() => setSelectedLanguage(lang.value)}
                />
                <label 
                  htmlFor={`language-${lang.value}`} 
                  className="ml-2 text-slate-950"
                >
                  {lang.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Video information section */}
        {videoTitle && (
          <>
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

            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-1">{videoTitle}</h1>
              <h2 className="text-gray-600 text-xl mb-4">Channel: {videoStats.Channel}</h2>
              
              <div className='border border-slate-300 rounded-lg shadow-md p-5'>
                <div className="flex mt-1 justify-between items-center mb-4">
                  <h2 className="text-3xl font-bold">Video Summary</h2>
                  <div className="flex p-2">
                    <button 
                      onClick={readAloud}
                      className="flex items-center px-4 py-2 hover:bg-red-600 text-red-600 hover:text-white border border-red-600 hover:border-transparent rounded-md transition">
                      <HiSpeakerWave className='text-xl flex mr-3'/>
                      {isSpeaking ? 'Stop' : 'Read Out Loud'}
                    </button>
                    {isSpeaking && (
                      <button 
                        onClick={togglePauseSpeech}
                        className="flex ml-4 items-center px-4 py-2 hover:bg-red-600 text-red-600 hover:text-white border border-red-600 hover:border-transparent rounded-md transition">
                        {isPaused ? 'Play' : 'Pause'}
                      </button>
                    )}
                    <button 
                      onClick={handleDownloadPDF}
                      className="flex ml-4 items-center px-4 py-2 hover:bg-red-600 text-red-600 hover:text-white border border-red-600 hover:border-transparent rounded-md transition"
                    >
                      Download Summary as PDF
                    </button>
                  </div>
                                    
                </div>
                <div className="space-y-4">
                  <BulletList items={videoSummary.mainTopics} title="Main Topics and Key Points" />
                  <BulletList items={videoSummary.insights} title="Important Insights" />
                  <BulletList items={videoSummary.conclusions} title="Core Conclusions" />
                </div>
              </div>
            </div>
          </>
        )}

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
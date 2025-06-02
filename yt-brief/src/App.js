import React, { useState } from 'react';
import jsPDF from 'jspdf';
import './App.css'
import { IoMdSunny, IoMdMoon } from "react-icons/io";
import { BiSolidLike } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import { FaComments } from "react-icons/fa";
import { MdAccessTimeFilled } from "react-icons/md";
import { MdUpload } from "react-icons/md";
import { HiSpeakerWave } from "react-icons/hi2";
import { FaFolder, FaCog } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

// MultiSelectDropdown Component
// function MultiSelectDropdown({ options, onSelectionChange }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedOptions, setSelectedOptions] = useState([]);

//   const toggleDropdown = () => setIsOpen(!isOpen);

//   const handleSelect = (option) => {
//     const updatedSelection = selectedOptions.includes(option)
//       ? selectedOptions.filter((item) => item !== option)
//       : [...selectedOptions, option];

//     setSelectedOptions(updatedSelection);
//     onSelectionChange(updatedSelection);
//   };

//   const handleRemove = (option) => {
//     const updatedSelection = selectedOptions.filter((item) => item !== option);
//     setSelectedOptions(updatedSelection);
//     onSelectionChange(updatedSelection);
//   };

//   return (
//     <div className="relative w-full">
//       <button
//         onClick={toggleDropdown}
//         className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-left flex items-center flex-wrap space-x-2 focus:outline-none focus:ring-2 focus:ring-red-600"
//       >
//         {selectedOptions.length > 0 ? (
//           selectedOptions.map((option) => (
//             <span
//               key={option}
//               className="inline-flex items-center px-2 py-1 bg-red-600 text-white rounded-full text-sm mr-2 mb-1"
//             >
//               {option}
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation(); // Prevent dropdown toggle when removing an option
//                   handleRemove(option);
//                 }}
//                 className="ml-2 text-white hover:text-gray-200"
//               >
//                 ✕
//               </button>
//             </span>
//           ))
//         ) : (
//           <span className="text-gray-500">Select options</span>
//         )}
//         <span className="ml-auto">▼</span>
//       </button>

//       {isOpen && (
//         <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg p-2">
//           <div className="divide-y divide-gray-200">
//             {options.map((option) => (
//               <label
//                 key={option}
//                 className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
//               >
//                 <input
//                   type="checkbox"
//                   checked={selectedOptions.includes(option)}
//                   onChange={() => handleSelect(option)}
//                   className="mr-2"
//                 />
//                 {option}
//               </label>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

const Sidebar = ({ activeItem, onItemClick }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <MdDashboard /> },
    { id: 'files', label: 'Files', icon: <FaFolder /> },
    { id: 'settings', label: 'Account/Settings', icon: <FaCog /> }
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="logo-placeholder2"></div>
        {/* <div className="w-8 h-8 bg-gray-100 rounded-full"></div> */}
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 py-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`w-full flex items-center px-6 py-3 justify-center transition-colors duration-200
              ${activeItem === item.id 
                ? 'bg-red-50 text-red-600 ' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
              }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

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
  const [selectedSummaryType, setSelectedSummaryType] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [isToggled, setIsToggled] = useState(false);
  // const [selectedChapters, setSelectedChapters] = useState([]);

  // const handleChapterSelection = (selected) => {
  //   setSelectedChapters(selected);
  // };

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };
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
  <div className="flex h-screen bg-gray-50">
    <Sidebar activeItem={activeView} onItemClick={setActiveView} />
    
    <div className="flex flex-col flex-1">
      {/* Your existing header */}
      <header className="p-4 flex justify-end items-center mb-1">
        <button
        onClick={handleToggle}
        >
          
          {isToggled ? (
          <IoMdSunny className="text-2xl hover:text-red-400 transition"/>
        ) : (
          <IoMdMoon className="text-2xl hover:text-red-400 transition" />
        )}
        </button>
        <div className="logo-placeholder1 ml-6"></div>
      </header>

      {/* Your existing content wrapped in a scrollable container */}
      <div className="flex-1 overflow-y-auto">
      {activeView === 'files' && (
          <div className="flex-1 p-8">
            <h1 className="text-3xl font-bold mb-6">Files</h1>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">Your saved video summaries will appear here.</p>
              <div className="mt-4 space-y-2">
                <div className="p-3 border border-gray-200 rounded-md">
                  <p className="font-medium">Sample Video Summary.pdf</p>
                  <p className="text-sm text-gray-500">Created 2 hours ago</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-md">
                  <p className="font-medium">Tech Tutorial Summary.pdf</p>
                  <p className="text-sm text-gray-500">Created yesterday</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="flex-1 p-8">
            <h1 className="text-3xl font-bold mb-6">Account & Settings</h1>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Preferences</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Auto-save summaries as PDF</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Email notifications</span>
                    </label>
                  </div>
                </div>
                
                <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
    {activeView === 'dashboard' && (
      <div className="max-w-7xl mx-auto p-2 font-sans">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 mb-2"
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
        
        {/* Filters section */}
        <div className="mb-5">
          <h1 className="text-3xl font-bold mb-4">Filters:</h1>
          <div className='grid grid-cols-2 gap-2 mt-5'>
            <div className='flex flex-col h-full justify-center'>
              <p className="text-gray-800 text-lg mb-2">Select a language for the summary:</p>
              <div className="flex items-center space-x-4">
                {[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Español' },
                  { value: 'fr', label: 'Français' },
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
            <div className='flex flex-col h-full justify-center'>
              <div className="w-full">
                <p className="text-gray-800 text-lg mb-2">Select the type of summary:</p>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                id="summaryType"
                value={selectedSummaryType}
                onChange={(e) => setSelectedSummaryType(e.target.value)}
                >
                  <option value="">Choose a type</option>
                  <option value="flash">Flash Cards</option>
                  <option value="para">Paragraph</option>
                  <option value="point">Bullet Points</option>
                </select>
              </div>
            </div>
          </div>
          {/* <div className="w-full mt-6">
            <p className="text-gray-800 text-lg mb-2">Select the chapters you want to summarize:</p>
            <MultiSelectDropdown
              options={['Introduction', 'Chapter 1', 'Chapter 2', 'Conclusion']}
              value={selectedChapters}
              onSelectionChange={handleChapterSelection}
            />
          </div> */}
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
      </div>
    </div>
    )}
        <footer className="text-left text-sm text-gray-500 mt-28">
          ©2024 YTBrief All Right Reserved
        </footer>
      </div>
    </div>
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
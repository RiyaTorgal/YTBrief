import { useState } from 'react';
import { generatePDF } from '../utils/pdfGenerator';
import { parseVideoSummary, formatDate } from '../utils/helpers';

export const useVideoSummary = () => {
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
  const [selectedChapters, setSelectedChapters] = useState([]);

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

  const handleDownloadPDF = () => {
    generatePDF({
      videoTitle,
      videoStats,
      videoSummary,
      onError: setError
    });
  };

  return {
    videoTitle,
    videoStats,
    thumbnailUrl,
    videoSummary,
    isLoading,
    error,
    selectedLanguage,
    selectedSummaryType,
    selectedChapters,
    setSelectedLanguage,
    setSelectedSummaryType,
    setSelectedChapters,
    handleSummarize,
    handleDownloadPDF
  };
};
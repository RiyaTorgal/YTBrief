import { useState } from "react";

export const useSpeechSynthesis = (videoSummary) => {
      const [isSpeaking, setIsSpeaking] = useState(false);
      const [isPaused, setIsPaused] = useState(false);

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

  return {
    isSpeaking,
    isPaused,
    readAloud,
    togglePauseSpeech
  };
}
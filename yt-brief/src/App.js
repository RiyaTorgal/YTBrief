import React, { useState } from 'react';
import './App.css'
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Settings from './page/Setting';
import Files from './page/Files';
import Dashboard from './page/Dashboard';
import LoginForm from './page/Login';
import SignupForm from './page/SignUp';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useVideoSummary } from './hooks/useVideoSummary';
import { generatePDF } from './utils/pdfGenerator';

function YTBrief() {
   const [error, setError] = useState('');
   const {
    videoTitle,
    videoStats,
    thumbnailUrl,
    videoSummary,
    isLoading,
    // error,
    handleSummarize,
    // handleDownloadPDF
  } = useVideoSummary();

    const {
    isSpeaking,
    isPaused,
    readAloud,
    togglePauseSpeech
  } = useSpeechSynthesis(videoSummary);
  const [activeView, setActiveView] = useState('dashboard');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleNavigation = (view) => {
    if (view === 'login') {
      setShowLoginModal(true);
      setShowSignupModal(false);
    } else if (view === 'signup') {
      setShowSignupModal(true);
      setShowLoginModal(false);
    }
  };
    

  // Close all modals
  const closeAllModals = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  // Switch between modals
  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const handleDownloadPDF = () => {
    generatePDF(videoTitle, videoStats, videoSummary, setError);
  };
  return (
    <>
  <div className="flex h-screen bg_tone">
    <Sidebar activeItem={activeView} onItemClick={setActiveView} />
    <div className="flex flex-col flex-1">
      <Header onNavigate={handleNavigation} />
      {/* Your existing content wrapped in a scrollable container */}
      <div className="flex-1 overflow-y-auto">
      {activeView === 'files' && (
        <Files />
        )}

        {activeView === 'settings' && (
          <Settings />
        )}
    {activeView === 'dashboard' && (
      <Dashboard
                videoTitle={videoTitle}
                videoStats={videoStats}
                thumbnailUrl={thumbnailUrl}
                videoSummary={videoSummary}
                isLoading={isLoading}
                error={error}
                isSpeaking={isSpeaking}
                isPaused={isPaused}
                handleSummarize={handleSummarize}
                handleDownloadPDF={handleDownloadPDF}
                readAloud={readAloud}
                togglePauseSpeech={togglePauseSpeech}
              />
    )}
      </div>
    </div>
  </div>
  {/* Modal Overlays */}
      {showLoginModal && (
        <LoginForm 
          onClose={closeAllModals}
          onSwitchToSignup={switchToSignup}
        />
      )}

      {showSignupModal && (
        <SignupForm 
          onClose={closeAllModals}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </>
  );
}

export default YTBrief;

import React, { useState, useEffect } from 'react';
import { LOADING_MESSAGES } from '../constants';
import GlitchText from './GlitchText';

const ProfessionalSpinner: React.FC = () => (
  <div className="relative">
    <div className="w-16 h-16 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-indigo-500 rounded-full animate-spin mx-auto" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
  </div>
);

const LoadingOverlay: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % LOADING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex flex-col justify-center items-center z-50 p-4">
      <ProfessionalSpinner />
      <h3 className="text-2xl font-semibold mt-8 text-white">Generating Video</h3>
      <p className="mt-4 text-lg text-center text-slate-300 max-w-md">
        {LOADING_MESSAGES[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingOverlay;

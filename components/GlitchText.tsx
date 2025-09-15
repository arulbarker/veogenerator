
import React from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute inset-0 text-cyan-400 animate-glitch-1" aria-hidden="true">{text}</span>
      <span className="absolute inset-0 text-fuchsia-500 animate-glitch-2" aria-hidden="true">{text}</span>
      <span className="relative text-white">{text}</span>
    </div>
  );
};

export default GlitchText;

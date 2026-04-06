import React from 'react';

interface StoryTextProps {
  text: string;
  pageNumber: number;
}

const StoryText: React.FC<StoryTextProps> = ({ text, pageNumber }) => {
  // Ensure text is always a string
  const displayText = typeof text === 'string' ? text : String(text || '');
  
  return (
    <div className="h-full">
      <p className="text-gray-800 leading-relaxed font-serif whitespace-pre-line" style={{
        fontFamily: '"Georgia", "Times New Roman", serif',
        lineHeight: '1.8',
        fontSize: 'clamp(12px, 2vw, 18px)',
        textAlign: 'justify'
      }}>
        {displayText}
      </p>
    </div>
  );
};

export default StoryText;

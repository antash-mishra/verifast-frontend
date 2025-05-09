import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState(1);
  const textareaRef = useRef(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to calculate correct scrollHeight
      textareaRef.current.style.height = 'auto';
      
      // Set new height based on scrollHeight (content height)
      const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
      textareaRef.current.style.height = `${newHeight}px`;
      
      // Calculate rows for the textarea based on content
      const lineHeight = 24; // Approximate line height in pixels
      const newRows = Math.min(Math.ceil(newHeight / lineHeight), 6);
      setRows(newRows);
    }
  }, [message]);

  const handleSendMessage = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      setRows(1);
    }
  };

  const handleKeyDown = (e) => {
    // Send message on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-3 md:p-5 shadow-lg">
      <div className="max-w-4xl mx-auto relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="w-full pl-4 pr-12 py-3 bg-slate-700 text-gray-100 rounded-xl border border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all duration-300 shadow-inner resize-none text-sm md:text-base font-normal tracking-wide leading-relaxed placeholder-gray-400"
          rows={rows}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || isLoading}
          className={`absolute right-3 bottom-2.5 md:bottom-3 transition-all duration-300 rounded-full h-8 w-8 md:h-10 md:w-10 flex items-center justify-center ${
            message.trim() && !isLoading 
              ? 'bg-indigo-500 text-white hover:bg-indigo-600 transform hover:scale-105' 
              : 'bg-slate-600 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput; 
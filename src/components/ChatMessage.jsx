import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Citation tooltip component
const CitationTooltip = ({ children, citation }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Extract URL from citation if present
  const extractUrl = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text?.match(urlRegex);
    return match ? match[0] : null;
  };
  
  const url = extractUrl(citation);
  
  return (
    <span 
      className="citation-reference relative inline-block"
      onMouseEnter={() => setShowTooltip(true)} 
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="citation-number rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 text-xs font-medium cursor-help">
        {children}
      </span>
      {showTooltip && (
        <div className="citation-tooltip absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 text-xs max-w-xs z-10">
          <p>{citation || "Source information not available"}</p>
          {url && (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 block mt-1 truncate"
            >
              {url}
            </a>
          )}
        </div>
      )}
    </span>
  );
};

const ChatMessage = ({ message, isUser }) => {
  // Function to process citation text into structured data
  const extractCitations = (text) => {
    // Look for a Sources section at the end of the message
    const sourcesSectionRegex = /\n\s*Sources:\s*\n([\s\S]+)$/i;
    const sourcesMatch = text.match(sourcesSectionRegex);
    
    const citations = {};
    
    if (sourcesMatch) {
      // Extract individual citations
      const sourcesSection = sourcesMatch[1];
      const citationRegex = /\[(\d+)\]\s*(.*?)(?=\n\[\d+\]|\n*$)/gs;
      
      let match;
      while ((match = citationRegex.exec(sourcesSection)) !== null) {
        const id = match[1];
        const source = match[2].trim();
        citations[id] = source;
      }
    }
    
    return citations;
  };

  // Extract and format the message content
  const formatMessageWithCitations = () => {
    if (isUser || !message.content) return message.content;
    
    const citations = extractCitations(message.content);
    
    // Split content and sources section
    let content = message.content;
    const sourcesSectionRegex = /\n\s*Sources:\s*\n([\s\S]+)$/i;
    if (sourcesSectionRegex.test(content)) {
      content = content.replace(sourcesSectionRegex, '');
    }
    
    return content;
  };

  // Extract URL from text
  const extractUrl = (text) => {
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const match = text?.match(urlRegex);
    return match ? match[0] : null;
  };

  const formattedMessage = formatMessageWithCitations();
  const citations = !isUser ? extractCitations(message.content) : {};

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in-up`}>
      {!isUser && (
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mr-2 shadow-md flex-shrink-0">
          B
        </div>
      )}
      <div 
        className={`${isUser ? 'max-w-[70%] sm:max-w-[75%] md:max-w-[80%]' : 'max-w-[75%] sm:max-w-[80%] md:max-w-[85%]'} rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-md ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none' 
            : 'bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
        } transform transition-all duration-200 text-left backdrop-blur-sm break-words`}
      >
        {isUser ? (
          <p className="text-xs sm:text-sm break-words font-medium leading-relaxed tracking-wide">{message.content}</p>
        ) : (
          <>
            <p className="text-xs sm:text-sm break-words leading-relaxed tracking-wide">{formattedMessage}</p>
            {/* Citations section at bottom if present */}
            {Object.keys(citations).length > 0 && (
              <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-gray-200 dark:border-gray-600">
                <h4 className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400 uppercase tracking-wider">Sources:</h4>
                <ul className="text-xs space-y-2 list-none m-0 p-0">
                  {Object.entries(citations).map(([id, citation]) => {
                    const url = extractUrl(citation);
                    return (
                      <li key={id} className="flex items-start">
                        <span className="citation-number rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 text-xs font-medium mr-2 flex-shrink-0 mt-0.5">
                          [{id}]
                        </span>
                        <div className="flex flex-col">
                          <span className="break-words text-gray-700 dark:text-gray-300">{citation}</span>
                          {url && (
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1 truncate transition-colors duration-200 break-all font-medium"
                            >
                              {url}
                            </a>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
        <p className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'} font-light tracking-wide`}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
      {isUser && (
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold ml-2 shadow-md flex-shrink-0">
          U
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
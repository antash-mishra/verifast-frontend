import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// A simple preprocessor to clean up common LLM formatting issues
const cleanupMarkdown = (text) => {
  if (!text) return '';
  
  // Process line by line for better control
  const lines = text.split('\n');
  const cleanedLines = [];
  let inBulletList = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip empty lines at the beginning
    if (cleanedLines.length === 0 && line === '') continue;
    
    // Fix bullet points formatting
    if (line.match(/^[•\-*]\s*(.+)/)) {
      // Normalize to '* ' format
      line = line.replace(/^[•\-*]\s*/, '* ');
      inBulletList = true;
    } 
    // Handle orphaned lines that should be part of the previous bullet point
    else if (inBulletList && line !== '' && !line.startsWith('* ') && !line.startsWith('**Sources')) {
      // If this line doesn't start with a bullet but previous was a bullet,
      // append it to the previous line if previous line exists
      if (cleanedLines.length > 0) {
        cleanedLines[cleanedLines.length - 1] += ' ' + line;
        continue; // Skip adding this line separately
      }
    } else if (line === '') {
      inBulletList = false;
    }
    
    // Fix citations formatting (ensure space before citations)
    line = line.replace(/(\S)\[(\d+)\]/g, '$1 [$2]');
    
    // Fix bold formatting
    line = line.replace(/\*\s+(.+?)\s+\*/g, '*$1*');
    line = line.replace(/\*([^*]+)\*/g, '**$1**'); // Convert single * to double ** for bold
    
    // Add proper spacing for Sources section
    if (line.match(/^sources:$/i)) {
      cleanedLines.push(''); // Add empty line before Sources
      line = '**Sources:**';
      inBulletList = false;
    }
    
    cleanedLines.push(line);
  }
  
  return cleanedLines.join('\n');
};

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

// Custom renderer for links in markdown
const MarkdownLink = ({href, children}) => {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
    >
      {children}
    </a>
  );
};

// Custom renderer for list items to add proper styling
const ListItem = ({children, ...props}) => {
  return (
    <li className="my-2 flex items-start" {...props}>
      <span className="mr-2 mt-1 text-indigo-500 dark:text-indigo-400">•</span>
      <div className="flex-1">{children}</div>
    </li>
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
    } else {
      // Look for inline citations without a separate section
      const inlineCitationRegex = /\[(\d+)\]/g;
      let match;
      const matches = new Set();
      while ((match = inlineCitationRegex.exec(text)) !== null) {
        const id = match[1];
        if (!matches.has(id)) {
          matches.add(id);
          citations[id] = `Reference ${id}`;
        }
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
    
    // Clean up the content using our preprocessor
    content = cleanupMarkdown(content);
    
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

  // Process citation references in the message
  const processMessageWithCitationReferences = (content) => {
    if (isUser || !content) return content;
    
    let processedContent = content;
    
    // Replace citation references with tooltips
    Object.keys(citations).forEach(id => {
      const citationRegex = new RegExp(`\\[${id}\\]`, 'g');
      processedContent = processedContent.replace(citationRegex, `[[${id}]]`);
    });
    
    return processedContent;
  };

  const messageWithReferences = processMessageWithCitationReferences(formattedMessage);

  // Check if content is likely a list (has bullet points)
  const isListContent = formattedMessage?.includes('*') || formattedMessage?.includes('-') || formattedMessage?.includes('•');

  // Custom Markdown components
  const markdownComponents = {
    a: MarkdownLink,
    li: ListItem,
    strong: ({node, ...props}) => <span className="font-bold text-indigo-700 dark:text-indigo-300" {...props} />,
    p: ({node, ...props}) => <p className="mt-2 mb-2" {...props} />,
    ul: ({node, ...props}) => <ul className="space-y-1 pl-0" {...props} />,
    ol: ({node, ...props}) => <ol className="space-y-1 pl-4 list-decimal" {...props} />,
  };

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
            <div className={`prose prose-sm dark:prose-invert max-w-none ${isListContent ? 'prose-li:my-1' : ''} break-words leading-relaxed tracking-wide prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-indigo-700 dark:prose-strong:text-indigo-300 prose-pre:bg-slate-800 prose-pre:text-gray-200 prose-code:text-rose-600 dark:prose-code:text-rose-400 prose-ul:pl-0`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
                children={messageWithReferences}
              />
            </div>
            
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
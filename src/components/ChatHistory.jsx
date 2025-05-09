import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import { APP_TITLE } from '../config';

const ChatHistory = ({ messages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-grow overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-wide">Welcome to {APP_TITLE}</h2>
            <p className="text-slate-300 text-center max-w-md">
              Ask me anything about the latest news articles. I'll search through my knowledge base and provide you with relevant information.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              message={message} 
              isUser={message.sender === 'user'} 
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatHistory; 
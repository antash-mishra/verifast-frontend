import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { chatService } from '../utils/api';

// Mock function for typed-out effect (can be replaced with actual streaming implementation)
const typeMessage = (message, callback, speed = 30) => {
  let i = 0;
  const typing = setInterval(() => {
    callback(message.substring(0, i));
    i++;
    if (i > message.length) {
      clearInterval(typing);
    }
  }, speed);
  
  return () => clearInterval(typing);
};

const Chat = () => {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState(null);

  // Initialize session on component mount
  useEffect(() => {
    const initSession = async () => {
      try {
        // In a real implementation, this would call the backend
        // For now, we'll just generate a UUID client-side
        const newSessionId = uuidv4();
        setSessionId(newSessionId);
        
        // In production, we would fetch any existing history
        // const history = await chatService.getChatHistory(newSessionId);
        // setMessages(history);
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    };

    initSession();
  }, []);

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: uuidv4(),
      sender: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // In a real implementation, this would call the backend API
      // const response = await chatService.sendMessage(sessionId, content);
      
      // Mock response for now
      const botResponse = {
        id: uuidv4(),
        sender: 'bot',
        content: 'This is a simulated response. The backend API is not connected yet.',
        timestamp: new Date().toISOString(),
      };

      // Simulate typing effect
      setTypingMessage(botResponse);
      let partialContent = '';
      
      const cleanupTyping = typeMessage(botResponse.content, (partial) => {
        partialContent = partial;
        setTypingMessage({
          ...botResponse,
          content: partial
        });
      });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add complete bot message after typing effect
      setTimeout(() => {
        cleanupTyping();
        setTypingMessage(null);
        setMessages(prev => [...prev, botResponse]);
        setLoading(false);
      }, botResponse.content.length * 30 + 500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
      
      // Add error message
      const errorMessage = {
        id: uuidv4(),
        sender: 'bot',
        content: 'Sorry, there was an error processing your request.',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleClearSession = async () => {
    try {
      // In a real implementation, this would call the backend
      // await chatService.clearSession(sessionId);
      
      // Generate a new session ID and clear messages
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      setMessages([]);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  // Combine actual messages with typing message for display
  const displayMessages = typingMessage
    ? [...messages.filter(m => m.id !== typingMessage.id), typingMessage]
    : messages;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 shadow-lg flex justify-between items-center">
        <div className="flex items-center">
          <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          <h1 className="text-xl font-bold tracking-wide">RAG News Chatbot</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-xs bg-indigo-800 rounded-full px-3 py-1">
            Session: {sessionId.substring(0, 8)}
          </div>
          <button
            onClick={handleClearSession}
            className="bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Clear Chat
          </button>
        </div>
      </div>
      
      <ChatHistory messages={displayMessages} />
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={loading} />
    </div>
  );
};

export default Chat; 
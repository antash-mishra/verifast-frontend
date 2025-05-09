import React, { useState, useEffect, useRef } from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import SessionsManager from './SessionsManager';
import { chatService, createWebSocketConnection } from '../utils/api';
import { APP_TITLE, USE_WEBSOCKET } from '../config';

const Chat = () => {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState(null);
  const [backendStatus, setBackendStatus] = useState({
    isReady: false,
    message: 'Connecting to backend...'
  });
  const [useWebSocket, setUseWebSocket] = useState(USE_WEBSOCKET);
  const [showSessionsManager, setShowSessionsManager] = useState(false);
  const webSocketRef = useRef(null);

  // Initialize session on component mount
  useEffect(() => {
    const initSession = async () => {
      try {
        // Check backend status first
        const status = await chatService.getStatus();
        setBackendStatus({
          isReady: status.vector_store_ready,
          message: status.vector_store_ready 
            ? 'Connected to backend' 
            : 'Backend is initializing data sources...'
        });

        // Check if we have a saved session in localStorage
        const savedSessionId = localStorage.getItem('sessionId');
        
        if (savedSessionId) {
          // Use the existing session
          setSessionId(savedSessionId);
          
          // Fetch existing history for the saved session
          const history = await chatService.getChatHistory(savedSessionId);
          if (history && history.messages) {
            setMessages(history.messages);
          }
        } else {
          // Create a new session if none exists
          const sessionResponse = await chatService.createSession();
          setSessionId(sessionResponse.sessionId);
          localStorage.setItem('sessionId', sessionResponse.sessionId);
          
          // Fetch existing history if any
          const history = await chatService.getChatHistory(sessionResponse.sessionId);
          if (history && history.messages) {
            setMessages(history.messages);
          }
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        setBackendStatus({
          isReady: false,
          message: 'Error connecting to backend. Please try again later.'
        });
      }
    };

    initSession();

    // Cleanup function
    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, []);

  // Initialize WebSocket connection when session is ready
  useEffect(() => {
    if (sessionId && useWebSocket) {
      // Initialize WebSocket connection
      try {
        const wsConnection = createWebSocketConnection(
          sessionId,
          handleWebSocketMessage,
          (error) => {
            console.error('WebSocket error:', error);
            setUseWebSocket(false); // Fall back to REST API on error
          }
        );
        
        webSocketRef.current = wsConnection;
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
        setUseWebSocket(false); // Fall back to REST API
      }
    }
  }, [sessionId, useWebSocket]);

  // Handle WebSocket messages
  const handleWebSocketMessage = (data) => {
    const { type, taskId, content, id, timestamp } = data;
    
    switch (type) {
      case 'typing_start':
        setLoading(true);
        setTypingMessage({
          id: taskId,
          sender: 'bot',
          content: '...',
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'partial_response':
        setTypingMessage({
          id: taskId,
          sender: 'bot',
          content,
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'complete_response':
        setLoading(false);
        setTypingMessage(null);
        setMessages(prev => [
          ...prev, 
          {
            id,
            sender: 'bot',
            content,
            timestamp
          }
        ]);
        break;
        
      default:
        console.warn('Unknown WebSocket message type:', type);
    }
  };

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      if (useWebSocket && webSocketRef.current) {
        // Send message via WebSocket
        webSocketRef.current.sendMessage(content);
      } else {
        // Fallback to REST API
        const response = await chatService.sendMessage(sessionId, content);
        
        const botResponse = {
          id: response.id,
          sender: 'bot',
          content: response.content,
          timestamp: response.timestamp,
        };
        
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now().toString(),
        sender: 'bot',
        content: 'Sorry, there was an error processing your request.',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      if (!useWebSocket) {
        setLoading(false);
      }
    }
  };

  const handleClearSession = async () => {
    try {
      // Close current WebSocket if open
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
      
      // Clear session on backend
      await chatService.clearSession(sessionId);
      
      // Create a new session
      const sessionResponse = await chatService.createSession();
      setSessionId(sessionResponse.sessionId);
      
      // Save the new session ID to localStorage
      localStorage.setItem('sessionId', sessionResponse.sessionId);
      
      setMessages([]);
      
      // Reconnect WebSocket with new session
      if (useWebSocket) {
        const wsConnection = createWebSocketConnection(
          sessionResponse.sessionId,
          handleWebSocketMessage
        );
        webSocketRef.current = wsConnection;
      }
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  // Function to handle selecting a different session
  const handleSelectSession = async (newSessionId) => {
    try {
      if (newSessionId === sessionId) {
        // Already on this session
        setShowSessionsManager(false);
        return;
      }

      // Close current WebSocket if open
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
      
      // Set the new session ID
      setSessionId(newSessionId);
      
      // Save the new session ID to localStorage
      localStorage.setItem('sessionId', newSessionId);
      
      // Fetch history for the new session
      const history = await chatService.getChatHistory(newSessionId);
      if (history && history.messages) {
        setMessages(history.messages);
      } else {
        setMessages([]);
      }
      
      // Reconnect WebSocket with new session
      if (useWebSocket) {
        const wsConnection = createWebSocketConnection(
          newSessionId,
          handleWebSocketMessage
        );
        webSocketRef.current = wsConnection;
      }

      // Close the sessions manager
      setShowSessionsManager(false);
    } catch (error) {
      console.error('Error switching session:', error);
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
          <h1 className="text-xl font-bold tracking-wide">{APP_TITLE}</h1>
          
          {!backendStatus.isReady && (
            <div className="ml-4 text-xs bg-amber-500 text-white rounded-full px-3 py-1 animate-pulse">
              {backendStatus.message}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSessionsManager(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            Sessions
          </button>
          <div className="text-xs bg-indigo-800 rounded-full px-3 py-1">
            Session: {sessionId.substring(0, 8)}
          </div>
          <button
            onClick={handleClearSession}
            className="bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md flex items-center"
            disabled={loading}
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

      {/* Sessions Manager Modal */}
      {showSessionsManager && (
        <SessionsManager 
          onSelectSession={handleSelectSession}
          currentSessionId={sessionId}
          onClose={() => setShowSessionsManager(false)}
        />
      )}
    </div>
  );
};

export default Chat; 
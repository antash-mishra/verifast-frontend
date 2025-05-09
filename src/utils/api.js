import { API_BASE_URL, WS_BASE_URL } from '../config';

// Helper function for fetch requests
const fetchWithOptions = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  try {
    const response = await fetch(url, { ...options, headers });
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

// WebSocket connection handler
export const createWebSocketConnection = (sessionId, onMessage, onError) => {
  const socket = new WebSocket(`${WS_BASE_URL}/ws/chat/${sessionId}`);
  
  socket.onopen = () => {
    console.log('WebSocket connection established');
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    if (onError) onError(error);
  };
  
  socket.onclose = () => {
    console.log('WebSocket connection closed');
  };
  
  // Return methods to interact with the WebSocket
  return {
    sendMessage: (message) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ message }));
      } else {
        console.error('WebSocket is not open');
      }
    },
    close: () => socket.close()
  };
};

export const chatService = {
  // Send a message to the chatbot
  sendMessage: async (sessionId, message) => {
    try {
      return await fetchWithOptions('/chat', {
        method: 'POST',
        body: JSON.stringify({ sessionId, message })
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get chat history for a session
  getChatHistory: async (sessionId) => {
    try {
      return await fetchWithOptions(`/history/${sessionId}`);
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  },

  // Clear chat session
  clearSession: async (sessionId) => {
    try {
      return await fetchWithOptions(`/session/${sessionId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error clearing session:', error);
      throw error;
    }
  },

  // Create a new session
  createSession: async () => {
    try {
      return await fetchWithOptions('/session', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },
  
  // Get backend status
  getStatus: async () => {
    try {
      return await fetchWithOptions('/status');
    } catch (error) {
      console.error('Error getting status:', error);
      throw error;
    }
  },

  // Get all sessions
  getAllSessions: async () => {
    try {
      return await fetchWithOptions('/sessions');
    } catch (error) {
      console.error('Error getting all sessions:', error);
      throw error;
    }
  },

  // Delete all sessions
  deleteAllSessions: async () => {
    try {
      return await fetchWithOptions('/sessions', {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting all sessions:', error);
      throw error;
    }
  }
};

export default chatService; 
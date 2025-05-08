// We'll use a base URL that will be updated once backend is ready
const API_BASE_URL = 'http://localhost:8000';

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
  }
};

export default chatService; 
# RAG News Chatbot Frontend

This is the frontend application for the RAG News Chatbot, providing a modern React UI to interact with the backend API.

## Features

- Real-time chat interface
- WebSocket streaming for responses
- Session management
- Mobile-responsive design
- Fallback to REST API when WebSocket is unavailable

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Backend API running (see instructions below)

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Configuration

The application configuration is located in `src/config.js`. You can modify the following settings:

- `API_BASE_URL`: The base URL for the REST API (default: `http://localhost:8000`)
- `WS_BASE_URL`: The base URL for WebSocket connections (default: `ws://localhost:8000`)
- `USE_WEBSOCKET`: Enable/disable WebSocket communication (default: `true`)

## Backend Setup

Ensure the backend API is running before starting the frontend application:

1. Clone the backend repository (if not already done)
2. Navigate to the backend directory
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Set up your environment variables in `.env` file:
   ```
   GEMINI_API_KEY=your-gemini-api-key
   ```
5. Start the backend server:
   ```
   python main.py
   ```

The backend API should now be running on `http://localhost:8000`.

## Development

This project uses:
- React for UI components
- Tailwind CSS for styling
- Vite as the build tool

## License

[MIT License](LICENSE)

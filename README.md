# RAG News Chatbot Frontend

A modern React application that provides a conversational interface to query recent news articles using RAG (Retrieval Augmented Generation) technology.

## Features

- Real-time chat interface with streaming responses
- Session management for multiple conversations
- Mobile-responsive design with modern UI
- WebSocket communication with fallback to REST API
- News ingestion status monitoring

## Setup

### Prerequisites

- Node.js (v16+)
- Backend API running (see backend repository)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:5173

## Configuration

Edit `src/config.js` to modify:

- API endpoints: `API_BASE_URL` and `WS_BASE_URL`
- Feature toggles: `USE_WEBSOCKET`

## Usage

1. Open the application in your browser
2. Type a question about recent news
3. The chatbot will retrieve relevant news articles and respond
4. Use the session management buttons to create new sessions or view history

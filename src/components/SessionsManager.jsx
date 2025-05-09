import React, { useState, useEffect } from 'react';
import { chatService } from '../utils/api';

const SessionsManager = ({ onSelectSession, currentSessionId, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Load sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Function to fetch all sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await chatService.getAllSessions();
      setSessions(response.sessions || []);
      setError(null);
    } catch (err) {
      setError('Failed to load sessions. Please try again.');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (err) {
      return 'Invalid date';
    }
  };

  // Format session ID for better display
  const formatSessionId = (fullId) => {
    if (!fullId) return 'N/A';
    return fullId.substring(0, 8) + '...';
  };

  // Handle selecting a session
  const handleSelectSession = (sessionId) => {
    if (onSelectSession) {
      onSelectSession(sessionId);
    }
  };

  // Handle deleting all sessions
  const handleDeleteAllSessions = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      setLoading(true);
      await chatService.deleteAllSessions();
      setDeleteConfirm(false);
      fetchSessions();  // Refresh the list
    } catch (err) {
      setError('Failed to delete sessions. Please try again.');
      console.error('Error deleting sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cancel delete confirmation
  const cancelDelete = () => {
    setDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Session Manager</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading && <div className="text-center py-4">Loading sessions...</div>}
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No active sessions found.
            </div>
          )}

          {sessions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Session ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Messages</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sessions.map((session) => (
                    <tr 
                      key={session.session_id} 
                      className={`hover:bg-gray-50 dark:hover:bg-slate-700 ${currentSessionId === session.session_id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        <span title={session.session_id}>
                          {formatSessionId(session.session_id)}
                          {currentSessionId === session.session_id && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 py-0.5 px-1.5 rounded-full">
                              Current
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {session.message_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatTimestamp(session.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatTimestamp(session.last_active)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleSelectSession(session.session_id)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4"
                          disabled={currentSessionId === session.session_id}
                        >
                          Select
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await chatService.clearSession(session.session_id);
                              fetchSessions();
                            } catch (err) {
                              setError('Failed to delete session.');
                            }
                          }}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer with actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} found
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={fetchSessions}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
            >
              Refresh
            </button>
            {deleteConfirm ? (
              <>
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllSessions}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                >
                  Confirm Delete All
                </button>
              </>
            ) : (
              <button
                onClick={handleDeleteAllSessions}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                disabled={sessions.length === 0}
              >
                Delete All Sessions
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsManager; 
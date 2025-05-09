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
    <div className="flex items-center justify-center w-full h-full">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 md:p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg md:text-xl font-bold tracking-wide">Session Manager</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none transition-transform duration-200 hover:scale-110 p-1"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3 md:p-4">
          {loading && (
            <div className="text-center py-4 animate-pulse">
              <div className="inline-block rounded-full bg-indigo-100 dark:bg-indigo-900 p-3">
                <svg className="w-6 h-6 text-indigo-500 dark:text-indigo-300 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400 font-medium">Loading sessions...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded-md mb-4 animate-fadeIn font-medium">
              {error}
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 animate-fadeIn">
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="font-medium">No active sessions found.</p>
              <p className="text-sm mt-2 font-light">Create a new session to get started.</p>
            </div>
          )}

          {sessions.length > 0 && (
            <div className="overflow-x-auto animate-fadeIn">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Session ID</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Messages</th>
                    <th className="hidden md:table-cell px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                    <th className="hidden md:table-cell px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Active</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sessions.map((session, index) => (
                    <tr 
                      key={session.session_id} 
                      className={`transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-slate-700 ${
                        currentSessionId === session.session_id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-mono">
                        <span title={session.session_id} className="flex items-center">
                          {formatSessionId(session.session_id)}
                          {currentSessionId === session.session_id && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 py-0.5 px-1.5 rounded-full">
                              Current
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-700 dark:text-gray-300">
                        {session.message_count}
                      </td>
                      <td className="hidden md:table-cell px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-700 dark:text-gray-300">
                        {formatTimestamp(session.created_at)}
                      </td>
                      <td className="hidden md:table-cell px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-700 dark:text-gray-300">
                        {formatTimestamp(session.last_active)}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSelectSession(session.session_id)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors duration-200"
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
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer with actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 md:p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sticky bottom-0 bg-white dark:bg-slate-800 z-10">
          <div>
            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} found
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchSessions}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none text-xs md:text-sm transition-colors duration-200"
            >
              Refresh
            </button>
            {deleteConfirm ? (
              <>
                <button
                  onClick={cancelDelete}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none text-xs md:text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllSessions}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none text-xs md:text-sm transition-colors duration-200"
                >
                  Confirm Delete All
                </button>
              </>
            ) : (
              <button
                onClick={handleDeleteAllSessions}
                className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none text-xs md:text-sm transition-colors duration-200"
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
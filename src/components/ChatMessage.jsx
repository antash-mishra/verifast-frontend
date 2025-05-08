import React from 'react';

const ChatMessage = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in-up`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mr-2 shadow-md">
          B
        </div>
      )}
      <div 
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none' 
            : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
        } transform transition-all duration-200`}
      >
        <p className={`text-sm ${!isUser && 'dark:text-gray-100'}`}>{message.content}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold ml-2 shadow-md">
          U
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 
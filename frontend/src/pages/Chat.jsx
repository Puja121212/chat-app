import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import UserProfile from '../components/UserProfile';
import ThemeToggle from '../components/ThemeToggle';

const Chat = () => {
  const { isAuthenticated, user } = useAuth();
  const { 
    getConversations, 
    conversations, 
    currentChat, 
    setCurrentChat,
    loading 
  } = useChat();
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      getConversations();
    }
  }, [isAuthenticated, getConversations]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${currentChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Chat App</h1>
          <ThemeToggle />
        </div>
        <Sidebar 
          user={user}
          conversations={conversations}
          currentChat={currentChat}
          setCurrentChat={setCurrentChat}
          loading={loading}
          showProfile={showProfile}
          setShowProfile={setShowProfile}
        />
      </div>

      {/* Chat Area */}
      <div className={`${currentChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {currentChat ? (
          <ChatArea 
            currentChat={currentChat}
            user={user}
            onBack={() => setCurrentChat(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Welcome to Chat</h2>
              <p className="text-gray-500 dark:text-gray-400">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Sidebar */}
      <div className={`${showProfile ? 'flex' : 'hidden'} w-full md:w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-col`}>
        <UserProfile 
          user={user}
          onClose={() => setShowProfile(false)}
        />
      </div>
    </div>
  );
};

export default Chat;

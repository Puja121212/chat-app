import { useState } from 'react';
import { FiMessageSquare, FiUsers, FiSettings, FiSearch, FiMoreVertical, FiCircle, FiUser, FiLogOut, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import ConversationList from './ConversationList';
import SearchUsers from './SearchUsers';

const Sidebar = ({ 
  user, 
  conversations, 
  currentChat, 
  setCurrentChat, 
  loading, 
  showProfile, 
  setShowProfile 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">{user?.username}</h3>
              <p className="text-xs text-green-500 dark:text-green-400">Online</p>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <FiMoreVertical className="w-5 h-5 text-black" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <button
                  onClick={() => {
                    setShowProfile(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
                >
                  <FiUser className="w-4 h-4 text-black" />
                  <span>Profile</span>
                </button>
                <button
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
                >
                  <FiSettings className="w-4 h-4 text-black" />
                  <span>Settings</span>
                </button>
                <hr className="border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 text-red-600 dark:text-red-400"
                >
                  <FiLogOut className="w-4 h-4 text-black" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FiSearch className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search conversations or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
            className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 left-0 pl-3 flex items-center"
            >
              <FiX className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
          
          {showSearch && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <SearchUsers
                query={searchQuery}
                onUserSelect={(selectedUser) => {
                  setCurrentChat(selectedUser);
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                onClose={() => setShowSearch(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading conversations...</p>
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            currentChat={currentChat}
            setCurrentChat={setCurrentChat}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
};

export default Sidebar;

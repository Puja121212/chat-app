import { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiFile, FiFilter, FiX, FiUser } from 'react-icons/fi';

const SearchMessages = ({ messages, currentChat, onMessageClick, onProfileView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    fileType: 'all', // all, image, document, audio, video
    sender: 'all' // all, me, other
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    performSearch();
  }, [searchTerm, filters, messages]);

  const performSearch = () => {
    let filteredMessages = [...messages];

    // Filter by keyword
    if (searchTerm.trim()) {
      filteredMessages = filteredMessages.filter(msg =>
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredMessages = filteredMessages.filter(msg =>
        new Date(msg.timestamp) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filteredMessages = filteredMessages.filter(msg =>
        new Date(msg.timestamp) <= toDate
      );
    }

    // Filter by file type
    if (filters.fileType !== 'all') {
      filteredMessages = filteredMessages.filter(msg => {
        const content = msg.content.toLowerCase();
        switch (filters.fileType) {
          case 'image':
            return content.includes('🖼️') || content.includes('image:');
          case 'document':
            return content.includes('📄') || content.includes('document:');
          case 'audio':
            return content.includes('🎵') || content.includes('audio:');
          case 'video':
            return content.includes('🎬') || content.includes('video:');
          default:
            return true;
        }
      });
    }

    // Filter by sender
    if (filters.sender !== 'all') {
      const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;
      filteredMessages = filteredMessages.filter(msg => {
        if (filters.sender === 'me') {
          return msg.senderId === currentUserId;
        } else {
          return msg.senderId !== currentUserId;
        }
      });
    }

    setSearchResults(filteredMessages);
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      fileType: 'all',
      sender: 'all'
    });
    setSearchTerm('');
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const highlightSearchTerm = (text) => {
    if (!searchTerm.trim()) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : 
        part
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Messages</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <FiFilter className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FiSearch className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 left-0 pl-3 flex items-center"
            >
              <FiX className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FiCalendar className="inline w-3 h-3 mr-1 text-black" />
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FiCalendar className="inline w-3 h-3 mr-1 text-black" />
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FiFile className="inline w-3 h-3 mr-1 text-black" />
                File Type
              </label>
              <select
                value={filters.fileType}
                onChange={(e) => setFilters({...filters, fileType: e.target.value})}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
              >
                <option value="all">All Files</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
                <option value="audio">Audio</option>
                <option value="video">Videos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sender
              </label>
              <select
                value={filters.sender}
                onChange={(e) => setFilters({...filters, sender: e.target.value})}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
              >
                <option value="all">All Senders</option>
                <option value="me">From Me</option>
                <option value="other">From Others</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="w-full px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {searchResults.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filters.dateFrom || filters.dateTo || filters.fileType !== 'all' || filters.sender !== 'all' 
                ? 'No messages found matching your criteria' 
                : 'Enter a search term to find messages'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Found {searchResults.length} message{searchResults.length !== 1 ? 's' : ''}
            </p>
            {searchResults.map((message) => (
              <div
                key={message._id}
                onClick={() => onMessageClick && onMessageClick(message)}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onProfileView && onProfileView(message.senderId);
                      }}
                      className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 transition"
                    >
                      <FiUser className="w-3 h-3 text-black" />
                    </button>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {message.senderId === JSON.parse(localStorage.getItem('user'))?._id ? 'You' : currentChat?.username || 'Unknown'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatMessageDate(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {highlightSearchTerm(message.content)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchMessages;

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useChat } from '../context/ChatContext';

const SearchUsers = ({ query, onUserSelect, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { searchUsers } = useChat();

  useEffect(() => {
    const searchForUsers = async () => {
      if (query.length < 2) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchUsers(query);
        setUsers(results);
      } catch (error) {
        console.error('Search error:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchForUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query, searchUsers]);

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Search Results</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition"
        >
          <FiX className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="p-2">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Searching...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-500 text-sm">
              {query.length < 2 ? 'Type at least 2 characters to search' : 'No users found'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {users.map((user) => (
              <div
                key={user._id}
                onClick={() => onUserSelect(user)}
                className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">
                      {user.username}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {user.isOnline ? (
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    ) : (
                      <span className="text-xs text-gray-400">Offline</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchUsers;

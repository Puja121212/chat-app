import { FiMessageCircle } from 'react-icons/fi';

const ConversationList = ({ 
  conversations, 
  currentChat, 
  setCurrentChat, 
  searchQuery 
}) => {
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return conv.partner?.username?.toLowerCase().includes(query) ||
           conv.lastMessage?.content?.toLowerCase().includes(query);
  });

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    let date;
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp.toISOString) {
      date = new Date(timestamp.toISOString());
    } else {
      date = new Date(timestamp);
    }
    
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateMessage = (message) => {
    if (!message) return '';
    return message.length > 50 ? message.substring(0, 50) + '...' : message;
  };

  if (filteredConversations.length === 0) {
    return (
      <div className="p-4 text-center">
        <FiMessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">
          {searchQuery ? 'No conversations found' : 'No conversations yet'}
        </p>
        <p className="text-gray-400 text-sm mt-1">
          {searchQuery ? 'Try a different search term' : 'Start a new conversation'}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {filteredConversations.map((conversation) => {
        const isActive = currentChat?._id === conversation.partner?._id;
        const unreadCount = conversation.unreadCount || 0;

        return (
          <div
            key={conversation.partner?._id}
            onClick={() => setCurrentChat(conversation.partner)}
            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {conversation.partner?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                {conversation.partner?.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-800 truncate">
                    {conversation.partner?.username}
                  </h4>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatMessageTime(conversation.lastMessage?.timestamp)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage?.senderId === conversation.partner?._id && (
                      <span className="font-medium">Them: </span>
                    )}
                    {truncateMessage(conversation.lastMessage?.content)}
                  </p>
                  
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;

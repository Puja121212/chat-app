import { useState } from 'react';
import { FiMapPin, FiMoreVertical, FiMic, FiPlay, FiSmile } from 'react-icons/fi';
import { toApiUrl, toAssetUrl } from '../config/env';

const MessageBubble = ({ message, isOwn }) => {
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [localReactions, setLocalReactions] = useState(message.reactions || []);
  
  const emojis = ['❤️', '👍', '😂', '😮', '👎', '🔥', '👏', '🎉'];
  
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
    
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatMessageDate = (timestamp) => {
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
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const handlePinMessage = () => {
    console.log('Pin message:', message._id);
    setShowMessageOptions(false);
  };

  const handleUnpinMessage = () => {
    console.log('Unpin message:', message._id);
    setShowMessageOptions(false);
  };

  const playVoiceMessage = () => {
    if (message.attachment && message.attachment.audio) {
      const audio = new Audio(toAssetUrl(message.attachment.audio));
      audio.play().catch(error => {
        console.error('Error playing voice message:', error);
      });
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReaction = async (emoji) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(toApiUrl('/api/reactions/add'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messageId: message._id,
          emoji: emoji
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLocalReactions(data.reactions);
        
        // Emit socket event for real-time update
        // Note: Socket integration would be handled by parent component
        // For now, just update local state
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
    setShowReactions(false);
  };

  const getReactionSummary = () => {
    const emojiCounts = {};
    localReactions.forEach(reaction => {
      emojiCounts[reaction.emoji] = (emojiCounts[reaction.emoji] || 0) + 1;
    });
    return Object.entries(emojiCounts).map(([emoji, count]) => ({ emoji, count }));
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Date separator */}
        {message.showDate && (
          <div className="text-center mb-4">
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {formatMessageDate(message.timestamp)}
            </span>
          </div>
        )}

        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`px-4 py-2 rounded-2xl relative group ${
              isOwn
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-100 text-gray-900 rounded-bl-none'
            }`}
          >
            {message.pinned && (
              <div className="absolute top-1 right-1">
                <FiMapPin className="w-3 h-3 text-yellow-500" />
              </div>
            )}
            {/* Reply indicator */}
            {message.replyTo && (
              <div className={`text-xs mb-1 p-2 rounded ${
                isOwn ? 'bg-blue-700' : 'bg-gray-200'
              }`}>
                <span className="opacity-75">Replying to a message</span>
              </div>
            )}
            {/* Message content */}
            {message.messageType === 'voice' && message.attachment ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={playVoiceMessage}
                  className={`p-3 rounded-full transition ${
                    isOwn 
                      ? 'bg-white bg-opacity-20 hover:bg-opacity-30' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  <FiPlay className={`w-4 h-4 ${isOwn ? 'text-white' : 'text-white'}`} />
                </button>
                <div className="flex flex-col">
                  <div className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-600'}`}>
                    Voice Message
                  </div>
                  <div className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                    {formatDuration(message.attachment.duration)}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm break-words">
                {message.content}
              </p>
            )}

            {/* Message metadata */}
            <div className={`flex items-center justify-between mt-1 space-x-2 ${
              isOwn ? 'text-blue-100' : 'text-gray-500'
            }`}>
              <span className="text-xs">
                {formatMessageTime(message.timestamp)}
              </span>
              
              <div className="flex items-center space-x-1">
                {/* Message status indicators */}
                {isOwn && (
                  <>
                    {!message.delivered && !message.isRead && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 12.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" />
                      </svg>
                    )}
                    
                    {message.delivered && !message.isRead && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                    
                    {message.isRead && (
                      <div className="flex">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                        <svg className="w-3 h-3 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    )}
                  </>
                )}

                {/* Group chat read receipts */}
                {!isOwn && message.readBy && message.readBy.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs opacity-75">
                      {message.readBy.length > 1 ? `${message.readBy.length} read` : 'Read'}
                    </span>
                    {message.readBy.slice(0, 3).map((reader, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center"
                        title={reader.username}
                      >
                        {reader.username.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {message.readBy.length > 3 && (
                      <div className="w-4 h-4 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center">
                        +{message.readBy.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Edited indicator */}
                {message.isEdited && (
                  <span className="text-xs">(edited)</span>
                )}

                {/* Reactions display */}
                {localReactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {getReactionSummary().map(({ emoji, count }) => (
                      <div
                        key={emoji}
                        className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${
                          isOwn 
                            ? 'bg-white bg-opacity-20 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        <span>{emoji}</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message options and reactions */}
                <div className="flex items-center space-x-1">
                  {/* Reaction button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowReactions(!showReactions)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition opacity-0 group-hover:opacity-100"
                      title="Add reaction"
                    >
                      <FiSmile className="w-3 h-3 text-black" />
                    </button>
                    
                    {/* Emoji picker */}
                    {showReactions && (
                      <div className={`absolute bottom-8 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex space-x-1 z-10 ${
                        isOwn ? 'right-0' : 'left-0'
                      }`}>
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition text-lg"
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Message options button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMessageOptions(!showMessageOptions)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition opacity-0 group-hover:opacity-100"
                    >
                      <FiMoreVertical className="w-3 h-3 text-black" />
                    </button>
                  
                    {/* Options dropdown */}
                    {showMessageOptions && (
                      <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={handlePinMessage}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <FiMapPin className="w-3 h-3 text-black" />
                          <span>Pin</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

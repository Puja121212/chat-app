import { useState, useEffect } from 'react';
import { FiZap, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';

const AISuggestions = ({ 
  currentMessage, 
  chatHistory, 
  onSuggestionClick, 
  onAutoComplete,
  context = 'Casual conversation' 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCompletions, setShowCompletions] = useState(false);

  // Get smart reply suggestions
  const getSmartReplies = async () => {
    if (!currentMessage || currentMessage.trim().length < 2) return;

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:4001/api/ai/smart-replies', {
        currentMessage,
        chatHistory,
        context
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSuggestions(response.data.suggestions || []);
      setShowSuggestions(true);
      setShowCompletions(false);
    } catch (error) {
      console.error('AI suggestions error:', error);
      // Fallback suggestions
      setSuggestions([
        "That's interesting!",
        "Tell me more about that.",
        "I see what you mean.",
        "Thanks for sharing!"
      ]);
      setShowSuggestions(true);
    } finally {
      setLoading(false);
    }
  };

  // Get auto-completions
  const getAutoCompletions = async () => {
    if (!currentMessage || currentMessage.trim().length < 3) return;

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:4001/api/ai/auto-complete', {
        partialMessage: currentMessage,
        context
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setCompletions(response.data.completions || []);
      setShowCompletions(true);
      setShowSuggestions(false);
    } catch (error) {
      console.error('AI completions error:', error);
      // Fallback completions
      setCompletions([
        currentMessage + "...",
        currentMessage + "!",
        currentMessage + "?"
      ]);
      setShowCompletions(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Handle completion click
  const handleCompletionClick = (completion) => {
    if (onAutoComplete) {
      onAutoComplete(completion);
    }
    setShowCompletions(false);
    setCompletions([]);
  };

  // Clear suggestions when message changes significantly
  useEffect(() => {
    if (!currentMessage || currentMessage.trim().length < 2) {
      setShowSuggestions(false);
      setShowCompletions(false);
      setSuggestions([]);
      setCompletions([]);
    }
  }, [currentMessage]);

  return (
    <div className="relative">
      {/* AI Assistant Button */}
      <div className="flex items-center space-x-2 mb-2">
        <button
          onClick={getSmartReplies}
          disabled={loading || !currentMessage || currentMessage.trim().length < 2}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Get AI suggestions"
        >
          <FiZap className="w-3 h-3" />
          <span>AI Suggestions</span>
        </button>

        <button
          onClick={getAutoCompletions}
          disabled={loading || !currentMessage || currentMessage.trim().length < 3}
          className="flex items-center space-x-1 px-3 py-1 bg-purple-500 text-white text-sm rounded-full hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Auto-complete message"
        >
          <FiRefreshCw className="w-3 h-3" />
          <span>Complete</span>
        </button>

        {loading && (
          <span className="text-xs text-gray-500">AI thinking...</span>
        )}
      </div>

      {/* Smart Reply Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Smart Replies:</div>
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auto-completions */}
      {showCompletions && completions.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Complete your message:</div>
            <div className="space-y-1">
              {completions.map((completion, index) => (
                <button
                  key={index}
                  onClick={() => handleCompletionClick(completion)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition"
                >
                  {completion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISuggestions;

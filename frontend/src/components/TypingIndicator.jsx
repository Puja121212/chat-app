const TypingIndicator = ({ username }) => {
  return (
    <div className="flex items-start space-x-2 mb-4">
      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-2xl rounded-bl-none">
        <span className="text-sm text-gray-600">{username} is typing</span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;

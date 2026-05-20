import { useState, useRef, useEffect } from 'react';
import { FiArrowLeft, FiSend, FiPaperclip, FiMoreVertical, FiSmile, FiImage, FiCamera, FiMapPin, FiUser, FiFile, FiMic, FiBarChart2, FiCpu, FiSearch, FiVideo, FiPhone, FiX, FiPlay, FiMoon, FiSun } from 'react-icons/fi';
import Picker from 'emoji-picker-react';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import AISuggestions from './AISuggestions';
import SearchMessages from './SearchMessages';
import VideoCall from './VideoCall';

const ChatArea = ({ currentChat, user, onBack }) => {
  const [message, setMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [chatBackground, setChatBackground] = useState('default');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [customBackgroundImage, setCustomBackgroundImage] = useState(null);
  const [backgroundOpacity, setBackgroundOpacity] = useState(100);
  const [backgroundBlur, setBackgroundBlur] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { messages, sendMessage, sendTyping, typingUsers, clearChat, blockUser, onlineUsers, dispatch } = useChat();
  const { socket } = useSocket();
  const { user: currentUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getBackgroundClass = (background) => {
    switch(background) {
      // Solid Colors
      case 'light-blue':
        return 'bg-blue-50';
      case 'light-green':
        return 'bg-green-50';
      case 'light-purple':
        return 'bg-purple-50';
      case 'light-pink':
        return 'bg-pink-50';
      case 'light-yellow':
        return 'bg-yellow-50';
      case 'light-indigo':
        return 'bg-indigo-50';
      case 'light-red':
        return 'bg-red-50';
      case 'light-teal':
        return 'bg-teal-50';
      
      // Gradients
      case 'gradient-blue':
        return 'bg-gradient-to-br from-blue-100 to-blue-200';
      case 'gradient-purple':
        return 'bg-gradient-to-br from-purple-100 to-pink-100';
      case 'gradient-green':
        return 'bg-gradient-to-br from-green-100 to-blue-100';
      case 'gradient-sunset':
        return 'bg-gradient-to-br from-orange-100 to-pink-200';
      case 'gradient-ocean':
        return 'bg-gradient-to-br from-blue-200 to-teal-300';
      case 'gradient-forest':
        return 'bg-gradient-to-br from-green-200 to-emerald-300';
      case 'gradient-lavender':
        return 'bg-gradient-to-br from-purple-200 to-indigo-300';
      case 'gradient-rose':
        return 'bg-gradient-to-br from-rose-100 to-pink-200';
      
      // Dark Themes
      case 'dark':
        return 'bg-gray-800';
      case 'dark-blue':
        return 'bg-gradient-to-br from-gray-800 to-blue-900';
      case 'dark-purple':
        return 'bg-gradient-to-br from-gray-800 to-purple-900';
      case 'dark-green':
        return 'bg-gradient-to-br from-gray-800 to-green-900';
      
      // Patterns (using CSS patterns)
      case 'dots':
        return 'bg-gray-50';
      case 'grid':
        return 'bg-gray-50';
      case 'waves':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100';
        
      // Custom Image
      case 'custom':
        return 'bg-gray-50';
        
      default:
        return 'bg-gray-50';
    }
  };

  const getBackgroundStyle = (background) => {
    switch(background) {
      case 'dots':
        return {
          backgroundImage: `radial-gradient(circle, #d1d5db 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          backgroundColor: '#f9fafb'
        };
      case 'grid':
        return {
          backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                           linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          backgroundColor: '#f9fafb'
        };
      case 'waves':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063A49.161 49.161 0 0021 20h6.225z' fill='%23933'/%3E%3C/svg%3E")`,
          backgroundColor: '#dbeafe'
        };
      case 'custom':
        if (customBackgroundImage) {
          return {
            backgroundImage: `url(${customBackgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          };
        }
        return {};
      default:
        return {};
    }
  };

  const startRecording = async () => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording. Please use a modern browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        alert('Recording failed. Please try again.');
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (error.name === 'NotAllowedError') {
        alert('Microphone access denied. Please allow microphone access in your browser settings to record voice messages.');
      } else if (error.name === 'NotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.');
      } else {
        alert('Failed to access microphone. Please check your browser settings and try again.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const playVoiceMessage = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play().catch(error => {
        console.error('Error playing voice message:', error);
        alert('Failed to play voice message. Please try again.');
      });
    }
  };

  const sendVoiceMessage = async () => {
    if (audioBlob && currentChat) {
      try {
        console.log('Sending voice message to:', currentChat._id);
        console.log('Audio blob size:', audioBlob.size);
        console.log('Recording duration:', recordingTime);
        
        // Compress audio blob if it's too large
        let compressedBlob = audioBlob;
        if (audioBlob.size > 5 * 1024 * 1024) { // 5MB limit
          console.log('Compressing audio blob from', audioBlob.size);
          // Create a new blob with lower quality
          compressedBlob = audioBlob.slice(0, Math.min(audioBlob.size, 2 * 1024 * 1024), 'audio/webm');
          console.log('Compressed to', compressedBlob.size);
        }
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('audio', compressedBlob, `voice_${Date.now()}.webm`);
        formData.append('receiverId', currentChat._id);
        formData.append('messageType', 'voice');
        formData.append('duration', recordingTime.toString());
        
        console.log('Sending FormData with audio file');
        
        // Send as FormData instead of base64
        const response = await fetch('http://localhost:4001/api/chat/send-voice', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Voice message sent successfully:', result);
        
        // Add message to local state using socket event
        if (result.message) {
          // Use socket to emit the voice message
          if (socket) {
            socket.emit('send_message', {
              receiverId: currentChat._id,
              message: '', // Voice message has no text content
              messageType: 'voice',
              attachment: result.message.attachment,
              messageId: result.message._id
            });
          }
        }
        
        setAudioBlob(null);
        setRecordingTime(0);
        
      } catch (error) {
        console.error('Failed to send voice message:', error);
        alert('Failed to send voice message: ' + (error.message || 'Unknown error'));
      }
    } else {
      console.log('No audio blob or current chat available');
      if (!audioBlob) {
        alert('No voice recording found. Please record a voice message first.');
      }
      if (!currentChat) {
        alert('No active chat found. Please select a user to chat with.');
      }
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackgroundImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomBackgroundImage(reader.result);
        setChatBackground('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCustomBackground = () => {
    setCustomBackgroundImage(null);
    setChatBackground('default');
  };

  const startVideoCall = () => {
    setShowVideoCall(true);
  };

  const endVideoCall = () => {
    setShowVideoCall(false);
  };

  const acceptCall = () => {
    setShowVideoCall(true);
    setIncomingCall(null);
  };

  const rejectCall = () => {
    setIncomingCall(null);
    socket?.emit('call-rejected', {
      chatId: currentChat?._id,
      callerId: incomingCall?.callerId
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() && currentChat) {
      try {
        await sendMessage(currentChat._id, message.trim());
        setMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  // Mark messages as read when user is viewing the chat
  const markMessagesAsRead = async () => {
    if (!currentChat || !socket) return;
    
    const unreadMessages = messages.filter(
      msg => msg.senderId !== currentUser?._id && !msg.isRead
    );
    
    if (unreadMessages.length > 0) {
      // Mark individual messages as read
      unreadMessages.forEach(msg => {
        socket.emit('mark_message_read', {
          messageId: msg._id,
          chatId: currentChat._id,
          readerId: currentUser?._id
        });
      });
      
      // Mark entire chat as read
      socket.emit('mark_chat_read', {
        chatId: currentChat._id,
        userId: currentUser?._id
      });
    }
  };

  // Auto mark messages as read when they appear
  useEffect(() => {
    if (currentChat && messages.length > 0) {
      const timer = setTimeout(() => {
        markMessagesAsRead();
      }, 1000); // Wait 1 second before marking as read
      
      return () => clearTimeout(timer);
    }
  }, [messages, currentChat]);

  const handleTyping = (isTyping) => {
    if (currentChat && socket) {
      if (isTyping) {
        socket.emit('start_typing', { receiverId: currentChat._id });
      } else {
        socket.emit('stop_typing', { receiverId: currentChat._id });
      }
    }
  };

  const handleAISuggestion = (suggestion) => {
    setMessage(suggestion);
  };

  const onEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    setMessage(prevMessage => prevMessage + emoji);
    setShowEmojiPicker(false);
  };

  const handleAttachment = (type) => {
    setShowAttachmentMenu(false);
    
    // Create hidden file input for file selection
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    
    switch(type) {
      case 'gallery':
        fileInput.accept = 'image/*';
        fileInput.multiple = true;
        fileInput.onchange = (e) => handleFileSelect(e.target.files, 'image');
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
        break;
        
      case 'camera':
        fileInput.accept = 'image/*';
        fileInput.capture = 'environment';
        fileInput.onchange = (e) => handleFileSelect(e.target.files, 'camera');
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
        break;
        
      case 'location':
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const locationMessage = `📍 Location: ${position.coords.latitude}, ${position.coords.longitude}`;
              setMessage(prevMessage => prevMessage + (prevMessage ? ' ' : '') + locationMessage);
            },
            (error) => {
              console.error('Location error:', error);
              alert('Unable to get location. Please enable location services.');
            }
          );
        } else {
          alert('Geolocation is not supported by your browser');
        }
        break;
        
      case 'contact':
        // For demo, add a contact sharing message
        const contactMessage = '👤 Contact shared';
        setMessage(prevMessage => prevMessage + (prevMessage ? ' ' : '') + contactMessage);
        break;
        
      case 'document':
        fileInput.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
        fileInput.multiple = true;
        fileInput.onchange = (e) => handleFileSelect(e.target.files, 'document');
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
        break;
        
      case 'audio':
        fileInput.accept = 'audio/*';
        fileInput.multiple = true;
        fileInput.onchange = (e) => handleFileSelect(e.target.files, 'audio');
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
        break;
        
      case 'poll':
        const pollQuestion = prompt('Enter your poll question:');
        if (pollQuestion) {
          const pollMessage = `📊 Poll: ${pollQuestion}`;
          setMessage(prevMessage => prevMessage + (prevMessage ? ' ' : '') + pollMessage);
        }
        break;
        
      case 'ai-images':
        const aiPrompt = prompt('Describe the image you want to generate:');
        if (aiPrompt) {
          const aiMessage = `🎨 AI Image: ${aiPrompt}`;
          setMessage(prevMessage => prevMessage + (prevMessage ? ' ' : '') + aiMessage);
        }
        break;
        
      default:
        break;
    }
  };

  const handleFileSelect = (files, type) => {
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        let fileMessage = '';
        
        switch(type) {
          case 'image':
          case 'camera':
            fileMessage = `🖼️ Image: ${file.name}`;
            break;
          case 'document':
            fileMessage = `📄 Document: ${file.name}`;
            break;
          case 'audio':
            fileMessage = `🎵 Audio: ${file.name}`;
            break;
          default:
            fileMessage = `📎 File: ${file.name}`;
        }
        
        setMessage(prevMessage => prevMessage + (prevMessage ? ' ' : '') + fileMessage);
      });
    }
  };

  const handleAutoComplete = (completion) => {
    setMessage(completion);
  };

  const handleMessageClick = (message) => {
    // Scroll to the specific message
    const messageElement = document.getElementById(`message-${message._id}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('bg-yellow-100', 'dark:bg-yellow-900');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-100', 'dark:bg-yellow-900');
      }, 2000);
    }
    setShowSearch(false);
  };

  const handleProfileView = (userId) => {
    console.log('View profile for user:', userId);
    // Here you can implement profile viewing functionality
    // For now, just show an alert
    alert(`Viewing profile for user ID: ${userId}`);
  };

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (newMessage) => {
        dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
        dispatch({ type: 'UPDATE_CONVERSATION_IF_CURRENT', payload: newMessage });
      });

      socket.on('user_typing', (data) => {
        dispatch({ type: 'ADD_TYPING_USER', payload: data });

        // Remove typing indicator after 3 seconds
        setTimeout(() => {
          dispatch({ type: 'REMOVE_TYPING_USER', payload: data.userId });
        }, 3000);
      });

      socket.on('online_users_list', (users) => {
        dispatch({ type: 'SET_ONLINE_USERS', payload: users });
      });

      // Read receipt events
      socket.on('message_read_receipt', (data) => {
        dispatch({ 
          type: 'UPDATE_MESSAGE_STATUS', 
          payload: { messageId: data.messageId, status: 'isRead', readBy: data.readBy } 
        });
      });

      socket.on('message_delivered_receipt', (data) => {
        dispatch({ 
          type: 'UPDATE_MESSAGE_STATUS', 
          payload: { messageId: data.messageId, status: 'delivered' } 
        });
      });

      socket.on('chat_read_receipt', (data) => {
        // Update all messages in chat as read
        dispatch({ type: 'MARK_CHAT_MESSAGES_READ', payload: data });
      });

      return () => {
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('online_users_list');
        socket.off('message_read_receipt');
        socket.off('message_delivered_receipt');
        socket.off('chat_read_receipt');
      };
    }
  }, [socket]);

  const handleClearChat = async () => {
    if (!currentChat) return;
    
    if (window.confirm(`Are you sure you want to clear chat with ${currentChat.username}? This action cannot be undone.`)) {
      try {
        await clearChat(currentChat._id);
        setShowOptions(false);
        alert('Chat cleared successfully');
      } catch (error) {
        alert('Failed to clear chat');
      }
    }
  };

  const handleBlockUser = async () => {
    if (!currentChat) return;
    
    if (window.confirm(`Are you sure you want to block ${currentChat.username}? You won't receive messages from them.`)) {
      try {
        await blockUser(currentChat._id);
        setShowOptions(false);
        alert('User blocked successfully');
      } catch (error) {
        alert('Failed to block user');
      }
    }
  };

  const isTypingFromCurrentChat = typingUsers.some(
    typing => typing.userId === currentChat?._id && typing.isTyping
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <FiArrowLeft className="w-5 h-5 text-black" />
          </button>
          
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {currentChat?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentChat?.username}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {onlineUsers.some(user => user._id === currentChat?._id) ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={startVideoCall}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            title="Start video call"
          >
            <FiVideo className="w-5 h-5 text-black" />
          </button>
          
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            title="Search messages"
          >
            <FiSearch className="w-5 h-5 text-black" />
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            title="Toggle theme"
          >
            {isDarkMode ? (
              <FiSun className="w-5 h-5 text-yellow-500" />
            ) : (
              <FiMoon className="w-5 h-5 text-gray-700" />
            )}
          </button>
          
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <FiMoreVertical className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      {showSearch && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSearch(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              >
                <FiArrowLeft className="w-5 h-5 text-black" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Messages</h3>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <SearchMessages
              messages={messages}
              currentChat={currentChat}
              onMessageClick={handleMessageClick}
              onProfileView={handleProfileView}
            />
          </div>
        </div>
      )}
      
      {/* Options Overlay */}
      {showOptions && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Options</h3>
            <button
              onClick={() => setShowOptions(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <FiArrowLeft className="w-5 h-5 text-black" />
            </button>
          </div>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm">
              Search Messages
            </button>
            <button 
              onClick={handleClearChat}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm"
            >
              Clear Chat
            </button>
            <button 
              onClick={handleBlockUser}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-red-600"
            >
              Block User
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Chat Background</h4>
              <div className="space-y-4">
                {/* Solid Colors */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Solid Colors</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setChatBackground('default')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'default' ? 'border-blue-500' : 'border-gray-300'} bg-white`}
                      title="Default"
                    >
                      <div className="w-full h-4 bg-white rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('light-blue')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'light-blue' ? 'border-blue-500' : 'border-gray-300'} bg-blue-100`}
                      title="Light Blue"
                    >
                      <div className="w-full h-4 bg-blue-100 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('light-green')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'light-green' ? 'border-blue-500' : 'border-gray-300'} bg-green-100`}
                      title="Light Green"
                    >
                      <div className="w-full h-4 bg-green-100 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('light-purple')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'light-purple' ? 'border-blue-500' : 'border-gray-300'} bg-purple-100`}
                      title="Light Purple"
                    >
                      <div className="w-full h-4 bg-purple-100 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('light-pink')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'light-pink' ? 'border-blue-500' : 'border-gray-300'} bg-pink-100`}
                      title="Light Pink"
                    >
                      <div className="w-full h-4 bg-pink-100 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('light-yellow')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'light-yellow' ? 'border-blue-500' : 'border-gray-300'} bg-yellow-100`}
                      title="Light Yellow"
                    >
                      <div className="w-full h-4 bg-yellow-100 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('light-indigo')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'light-indigo' ? 'border-blue-500' : 'border-gray-300'} bg-indigo-100`}
                      title="Light Indigo"
                    >
                      <div className="w-full h-4 bg-indigo-100 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('light-teal')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'light-teal' ? 'border-blue-500' : 'border-gray-300'} bg-teal-100`}
                      title="Light Teal"
                    >
                      <div className="w-full h-4 bg-teal-100 rounded"></div>
                    </button>
                  </div>
                </div>

                {/* Gradients */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Gradients</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setChatBackground('gradient-blue')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'gradient-blue' ? 'border-blue-500' : 'border-gray-300'} bg-gradient-to-r from-blue-400 to-blue-600`}
                      title="Blue Gradient"
                    >
                      <div className="w-full h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('gradient-purple')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'gradient-purple' ? 'border-blue-500' : 'border-gray-300'} bg-gradient-to-r from-purple-400 to-pink-400`}
                      title="Purple Gradient"
                    >
                      <div className="w-full h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('gradient-green')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'gradient-green' ? 'border-blue-500' : 'border-gray-300'} bg-gradient-to-r from-green-400 to-blue-400`}
                      title="Green Gradient"
                    >
                      <div className="w-full h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('gradient-sunset')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'gradient-sunset' ? 'border-blue-500' : 'border-gray-300'} bg-gradient-to-r from-orange-400 to-pink-400`}
                      title="Sunset Gradient"
                    >
                      <div className="w-full h-4 bg-gradient-to-r from-orange-400 to-pink-400 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('gradient-ocean')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'gradient-ocean' ? 'border-blue-500' : 'border-gray-300'} bg-gradient-to-r from-blue-400 to-teal-400`}
                      title="Ocean Gradient"
                    >
                      <div className="w-full h-4 bg-gradient-to-r from-blue-400 to-teal-400 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('gradient-forest')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'gradient-forest' ? 'border-blue-500' : 'border-gray-300'} bg-gradient-to-r from-green-400 to-emerald-400`}
                      title="Forest Gradient"
                    >
                      <div className="w-full h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('gradient-lavender')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'gradient-lavender' ? 'border-blue-500' : 'border-gray-300'} bg-gradient-to-r from-purple-400 to-indigo-400`}
                      title="Lavender Gradient"
                    >
                      <div className="w-full h-4 bg-gradient-to-r from-purple-400 to-indigo-400 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('gradient-rose')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'gradient-rose' ? 'border-blue-500' : 'border-gray-300'} bg-gradient-to-r from-rose-400 to-pink-400`}
                      title="Rose Gradient"
                    >
                      <div className="w-full h-4 bg-gradient-to-r from-rose-400 to-pink-400 rounded"></div>
                    </button>
                  </div>
                </div>

                {/* Dark Themes */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Dark Themes</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setChatBackground('dark')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'dark' ? 'border-blue-500' : 'border-gray-300'} bg-gray-800`}
                      title="Dark"
                    >
                      <div className="w-full h-4 bg-gray-800 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('dark-blue')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'dark-blue' ? 'border-blue-500' : 'border-gray-300'} bg-gradient-to-r from-gray-800 to-blue-900`}
                      title="Dark Blue"
                    >
                      <div className="w-full h-4 bg-gradient-to-r from-gray-800 to-blue-900 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('dark-purple')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'dark-purple' ? 'border-blue-500' : 'border-gray-300'} bg-gradient-to-r from-gray-800 to-purple-900`}
                      title="Dark Purple"
                    >
                      <div className="w-full h-4 bg-gradient-to-r from-gray-800 to-purple-900 rounded"></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('dark-green')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'dark-green' ? 'border-blue-500' : 'border-gray-300'} bg-gradient-to-r from-gray-800 to-green-900`}
                      title="Dark Green"
                    >
                      <div className="w-full h-4 bg-gradient-to-r from-gray-800 to-green-900 rounded"></div>
                    </button>
                  </div>
                </div>

                {/* Patterns */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Patterns</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setChatBackground('dots')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'dots' ? 'border-blue-500' : 'border-gray-300'} bg-white`}
                      title="Dots Pattern"
                      style={{
                        backgroundImage: `radial-gradient(circle, #d1d5db 1px, transparent 1px)`,
                        backgroundSize: '8px 8px'
                      }}
                    >
                      <div className="w-full h-4 rounded" style={{
                        backgroundImage: `radial-gradient(circle, #d1d5db 1px, transparent 1px)`,
                        backgroundSize: '8px 8px'
                      }}></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('grid')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'grid' ? 'border-blue-500' : 'border-gray-300'} bg-white`}
                      title="Grid Pattern"
                      style={{
                        backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                                         linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`,
                        backgroundSize: '8px 8px'
                      }}
                    >
                      <div className="w-full h-4 rounded" style={{
                        backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                                         linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`,
                        backgroundSize: '8px 8px'
                      }}></div>
                    </button>
                    <button
                      onClick={() => setChatBackground('waves')}
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'waves' ? 'border-blue-500' : 'border-gray-300'} bg-blue-100`}
                      title="Waves Pattern"
                    >
                      <div className="w-full h-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded"></div>
                    </button>
                  </div>
                </div>

                {/* Custom Image Upload */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Image</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundImageUpload}
                      className="hidden"
                      id="custom-background-upload"
                    />
                    <label
                      htmlFor="custom-background-upload"
                      className={`p-3 rounded-lg border-2 ${chatBackground === 'custom' ? 'border-blue-500' : 'border-gray-300'} bg-white cursor-pointer hover:bg-gray-50 transition`}
                    >
                      <div className="w-full h-4 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-600">📷 Upload</span>
                      </div>
                    </label>
                    {customBackgroundImage && (
                      <button
                        onClick={removeCustomBackground}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        title="Remove custom background"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Background Controls */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Controls</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-gray-600">Opacity:</label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={backgroundOpacity}
                        onChange={(e) => setBackgroundOpacity(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-600">{backgroundOpacity}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-gray-600">Blur:</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={backgroundBlur}
                        onChange={(e) => setBackgroundBlur(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-600">{backgroundBlur}px</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Messages Area */}
      <div 
        className={`flex-1 overflow-y-auto p-4 space-y-4 ${getBackgroundClass(chatBackground)}`}
        style={{
          ...getBackgroundStyle(chatBackground),
          opacity: backgroundOpacity / 100,
          filter: backgroundBlur > 0 ? `blur(${backgroundBlur}px)` : 'none'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                Start a conversation
              </h3>
              <p className="text-gray-500 text-sm">
                Send a message to {currentChat?.username}
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div key={msg._id || index} id={`message-${msg._id}`}>
                <MessageBubble
                  message={msg}
                  isOwn={msg.senderId === user?._id}
                />
              </div>
            ))}
            
            {isTypingFromCurrentChat && (
              <TypingIndicator username={currentChat?.username} />
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {/* AI Suggestions */}
        <AISuggestions
          currentMessage={message}
          chatHistory={messages}
          onSuggestionClick={handleAISuggestion}
          onAutoComplete={handleAutoComplete}
          context={currentChat ? `Chat with ${currentChat.username}` : 'Casual conversation'}
        />
        
        <div className="relative">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  console.log('Attachment icon clicked');
                  setShowAttachmentMenu(!showAttachmentMenu);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <FiPaperclip className="w-5 h-5 text-black" />
              </button>
              
              {/* Attachment Menu */}
              {showAttachmentMenu && (
                <div className="absolute bottom-12 left-0 bg-gray-900 dark:bg-gray-800 border border-gray-700 dark:border-gray-600 rounded-lg shadow-lg z-50 p-2 min-w-[200px]">
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleAttachment('gallery')}
                      className="flex flex-col items-center justify-center p-3 hover:bg-gray-700 rounded transition w-16 h-16"
                      title="Gallery"
                    >
                      <FiImage className="w-6 h-6 text-black mb-1" />
                      <span className="text-xs text-black">Gallery</span>
                    </button>
                    <button
                      onClick={() => handleAttachment('camera')}
                      className="flex flex-col items-center justify-center p-3 hover:bg-gray-700 rounded transition w-16 h-16"
                      title="Camera"
                    >
                      <FiCamera className="w-6 h-6 text-black mb-1" />
                      <span className="text-xs text-black">Camera</span>
                    </button>
                    <button
                      onClick={() => handleAttachment('location')}
                      className="flex flex-col items-center justify-center p-3 hover:bg-gray-700 rounded transition w-16 h-16"
                      title="Location"
                    >
                      <FiMapPin className="w-6 h-6 text-black mb-1" />
                      <span className="text-xs text-black">Location</span>
                    </button>
                    <button
                      onClick={() => handleAttachment('contact')}
                      className="flex flex-col items-center justify-center p-3 hover:bg-gray-700 rounded transition w-16 h-16"
                      title="Contact"
                    >
                      <FiUser className="w-6 h-6 text-black mb-1" />
                      <span className="text-xs text-black">Contact</span>
                    </button>
                    <button
                      onClick={() => handleAttachment('document')}
                      className="flex flex-col items-center justify-center p-3 hover:bg-gray-700 rounded transition w-16 h-16"
                      title="Document"
                    >
                      <FiFile className="w-6 h-6 text-black mb-1" />
                      <span className="text-xs text-black">Document</span>
                    </button>
                    <button
                      onClick={() => handleAttachment('audio')}
                      className="flex flex-col items-center justify-center p-3 hover:bg-gray-700 rounded transition w-16 h-16"
                      title="Audio"
                    >
                      <FiMic className="w-6 h-6 text-black mb-1" />
                      <span className="text-xs text-black">Audio</span>
                    </button>
                    <button
                      onClick={() => handleAttachment('poll')}
                      className="flex flex-col items-center justify-center p-3 hover:bg-gray-700 rounded transition w-16 h-16"
                      title="Poll"
                    >
                      <FiBarChart2 className="w-6 h-6 text-black mb-1" />
                      <span className="text-xs text-black">Poll</span>
                    </button>
                    <button
                      onClick={() => handleAttachment('ai-images')}
                      className="flex flex-col items-center justify-center p-3 hover:bg-gray-700 rounded transition w-16 h-16"
                      title="AI Images"
                    >
                      <FiCpu className="w-6 h-6 text-black mb-1" />
                      <span className="text-xs text-black">AI</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 relative">
              {audioBlob ? (
                <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-full">
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <FiMic className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">{formatRecordingTime(recordingTime)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={playVoiceMessage}
                    className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition"
                    title="Play voice message"
                  >
                    <FiPlay className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={sendVoiceMessage}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                  >
                    <FiSend className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAudioBlob(null);
                      setRecordingTime(0);
                    }}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : isRecording ? (
                <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-full">
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <FiMic className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">{formatRecordingTime(recordingTime)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping(e.target.value.length > 0);
                  }}
                  onBlur={() => handleTyping(false)}
                  placeholder="Type a message..."
                  className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
            
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <FiSmile className="w-5 h-5 text-black" />
            </button>
            
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Hold to record voice message"
            >
              <FiMic className="w-5 h-5 text-black" />
            </button>
            
            <button
              type="submit"
              disabled={!message.trim()}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </form>
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-0 z-50">
              <Picker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
      </div>

      {/* Video Call Component */}
      {showVideoCall && (
        <VideoCall
          currentChat={currentChat}
          onEndCall={endVideoCall}
          socket={socket}
        />
      )}

      {/* Incoming Call UI */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <FiVideo className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Incoming Call
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {incomingCall.callerName} is calling you...
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={rejectCall}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition flex items-center justify-center space-x-2"
                >
                  <FiPhoneOff className="w-5 h-5" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={acceptCall}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition flex items-center justify-center space-x-2"
                >
                  <FiPhone className="w-5 h-5" />
                  <span>Accept</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;

import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from './SocketContext';
import { toApiUrl } from '../config/env';

const ChatContext = createContext();

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return {
        ...state,
        conversations: action.payload,
        loading: false
      };
    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations]
      };
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.partner._id === action.payload.partnerId
            ? { ...conv, lastMessage: action.payload.message, unreadCount: action.payload.unreadCount }
            : conv
        )
      };
    case 'SET_CURRENT_CHAT':
      return {
        ...state,
        currentChat: action.payload,
        messages: [],
        loading: false
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
        loading: false
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'SET_ONLINE_USERS':
      return {
        ...state,
        onlineUsers: action.payload
      };
    case 'SET_TYPING_USERS':
      return {
        ...state,
        typingUsers: action.payload
      };
    case 'ADD_TYPING_USER':
      return {
        ...state,
        typingUsers: state.typingUsers.filter(u => u.userId !== action.payload.userId).concat(action.payload)
      };
    case 'REMOVE_TYPING_USER':
      return {
        ...state,
        typingUsers: state.typingUsers.filter(u => u.userId !== action.payload)
      };
    case 'UPDATE_CONVERSATION_IF_CURRENT':
      const message = action.payload;
      if (state.currentChat && 
          (message.senderId === state.currentChat._id || message.receiverId === state.currentChat._id)) {
        return {
          ...state,
          conversations: state.conversations.map(conv => {
            const partnerId = message.senderId === state.currentChat._id ? message.receiverId : message.senderId;
            if (conv.partner?._id === partnerId) {
              return {
                ...conv,
                lastMessage: message,
                updatedAt: new Date()
              };
            }
            return conv;
          })
        };
      }
      return state;
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'UPDATE_MESSAGE_STATUS':
      return {
        ...state,
        messages: state.messages.map(msg => 
          msg._id === action.payload.messageId 
            ? { 
                ...msg, 
                [action.payload.status]: true,
                ...(action.payload.readBy && { readBy: action.payload.readBy })
              }
            : msg
        )
      };
    case 'MARK_CHAT_MESSAGES_READ':
      return {
        ...state,
        messages: state.messages.map(msg => 
          msg.senderId !== action.payload.userId 
            ? { ...msg, isRead: true, readBy: [...(msg.readBy || []), action.payload.reader] }
            : msg
        )
      };
    default:
      return state;
  }
};

const initialState = {
  conversations: [],
  currentChat: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  loading: false,
  error: null
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message) => {
        dispatch({ type: 'ADD_MESSAGE', payload: message });
        
        // Update conversation if it's the current chat
        dispatch({ type: 'UPDATE_CONVERSATION_IF_CURRENT', payload: message });
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

      return () => {
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('online_users_list');
      };
    }
  }, [socket]);

  const getConversations = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get(toApiUrl('/api/chat/conversations'));
      dispatch({ type: 'SET_CONVERSATIONS', payload: response.data.conversations });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load conversations';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []);

  const getChatHistory = async (userId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get(toApiUrl(`/api/chat/history/${userId}`));
      dispatch({ type: 'SET_MESSAGES', payload: response.data.messages });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load chat history';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const sendMessage = async (receiverId, content, options = {}) => {
    try {
      const { messageType = 'text', attachment } = options;
      
      const response = await axios.post(toApiUrl('/api/chat/send'), {
        receiverId,
        content,
        messageType,
        attachment
      });

      const message = response.data.message;
      dispatch({ type: 'ADD_MESSAGE', payload: message });

      // Send via socket for real-time delivery
      if (socket) {
        socket.emit('send_message', {
          receiverId,
          message: content,
          messageType,
          attachment,
          messageId: message._id
        });
      }

      return message;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send message';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const searchUsers = async (query) => {
    try {
      const response = await axios.get(toApiUrl(`/api/chat/search?query=${query}`));
      return response.data.users;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to search users';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const getOnlineUsers = async () => {
    try {
      const response = await axios.get(toApiUrl('/api/chat/online-users'));
      dispatch({ type: 'SET_ONLINE_USERS', payload: response.data.users });
      return response.data.users;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to get online users';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const setCurrentChat = (user) => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: user });
    if (user) {
      getChatHistory(user._id);
    }
  };

  const sendTyping = (receiverId, isTyping) => {
    if (socket) {
      socket.emit('typing', { receiverId, isTyping });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const clearChat = async (userId) => {
    try {
      const response = await axios.delete(toApiUrl(`/api/chat/clear/${userId}`));
      if (response.data.success) {
        // Clear messages from current chat if it's the same user
        dispatch({ type: 'SET_MESSAGES', payload: [] });
        // Update conversations list
        getConversations();
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to clear chat';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const blockUser = async (userId) => {
    try {
      const response = await axios.post(toApiUrl(`/api/chat/block/${userId}`));
      if (response.data.success) {
        // Update conversations list to remove blocked user
        getConversations();
        // Clear current chat if it's the blocked user
        if (state.currentChat && state.currentChat._id === userId) {
          dispatch({ type: 'SET_CURRENT_CHAT', payload: null });
        }
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to block user';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const unblockUser = async (userId) => {
    try {
      const response = await axios.delete(toApiUrl(`/api/chat/unblock/${userId}`));
      if (response.data.success) {
        // Update conversations list
        getConversations();
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to unblock user';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const getBlockedUsers = async () => {
    try {
      const response = await axios.get(toApiUrl('/api/chat/blocked-users'));
      return response.data.blockedUsers;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to get blocked users';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const value = {
    ...state,
    getConversations,
    getChatHistory,
    sendMessage,
    searchUsers,
    getOnlineUsers,
    setCurrentChat,
    sendTyping,
    clearError,
    clearChat,
    blockUser,
    unblockUser,
    getBlockedUsers
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

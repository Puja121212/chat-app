import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io('http://localhost:4001', {
        auth: {
          token: token
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        setSocket(newSocket);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from socket server:', reason);
        setSocket(null);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        if (error.message === 'Authentication error') {
          console.error('Authentication failed - please login again');
        }
      });

      newSocket.on('user_status_changed', (data) => {
        console.log('User status changed:', data);
        // Update online users list
        setOnlineUsers(prev => {
          const updated = prev.filter(u => u._id !== data.userId);
          if (data.isOnline) {
            updated.push({
              _id: data.userId,
              isOnline: true,
              lastSeen: data.lastSeen
            });
          }
          return updated;
        });
      });

      newSocket.on('online_users_list', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('receive_message', (message) => {
        console.log('Received message:', message);
        // This will be handled by ChatContext
      });

      newSocket.on('user_typing', (data) => {
        console.log('User typing:', data);
        // This will be handled by ChatContext
      });

      newSocket.on('message_seen', (data) => {
        console.log('Message seen:', data);
        // This will be handled by ChatContext
      });

      return () => {
        newSocket.removeAllListeners();
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setOnlineUsers([]);
    }
  }, [isAuthenticated, token]);

  const sendMessage = (data) => {
    if (socket) {
      socket.emit('send_message', data);
    }
  };

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join_room', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit('leave_room', roomId);
    }
  };

  const sendTyping = (data) => {
    if (socket) {
      socket.emit('typing', data);
    }
  };

  const markMessageSeen = (data) => {
    if (socket) {
      socket.emit('mark_message_seen', data);
    }
  };

  const getOnlineUsers = () => {
    if (socket) {
      socket.emit('get_online_users');
    }
  };

  const value = {
    socket,
    onlineUsers,
    sendMessage,
    joinRoom,
    leaveRoom,
    sendTyping,
    markMessageSeen,
    getOnlineUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

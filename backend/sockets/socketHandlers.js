const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('Authentication error'));
    }

    socket.user = user.toJSON();
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
};

// Handle socket connections
const handleConnection = (io) => {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected: ${socket.id}`);

    // Update user online status
    const updateUserOnlineStatus = async (isOnline) => {
      try {
        const user = await User.findById(socket.user._id);
        if (user) {
          user.isOnline = isOnline;
          user.lastSeen = new Date();
          await user.save();
          
          // Broadcast user status change to all connected clients
          socket.broadcast.emit('user_status_changed', {
            userId: socket.user._id,
            isOnline: isOnline,
            lastSeen: user.lastSeen
          });
        }
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    };

    // Set user online when connected
    updateUserOnlineStatus(true);

    // Handle joining a room (private chat)
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.user.username} joined room: ${roomId}`);
    });

    // Handle leaving a room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.user.username} left room: ${roomId}`);
    });

    // Handle sending messages
    socket.on('send_message', (data) => {
      const { roomId, message, receiverId } = data;
      
      // Save message to database (will be implemented in next step)
      const messageData = {
        id: Date.now().toString(),
        senderId: socket.user._id,
        senderName: socket.user.username,
        message: message,
        timestamp: new Date(),
        roomId: roomId,
        receiverId: receiverId
      };

      // Send message to the room
      if (roomId) {
        io.to(roomId).emit('receive_message', messageData);
      } else if (receiverId) {
        // Send to specific user (private message)
        const recipientSocket = Array.from(io.sockets.sockets.values())
          .find(s => s.user && s.user._id === receiverId);
        
        if (recipientSocket) {
          recipientSocket.emit('receive_message', messageData);
        }
        
        // Also send to sender
        socket.emit('receive_message', messageData);
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { roomId, receiverId, isTyping } = data;
      
      const typingData = {
        userId: socket.user._id,
        username: socket.user.username,
        isTyping: isTyping
      };

      if (roomId) {
        socket.to(roomId).emit('user_typing', typingData);
      } else if (receiverId) {
        const recipientSocket = Array.from(io.sockets.sockets.values())
          .find(s => s.user && s.user._id === receiverId);
        
        if (recipientSocket) {
          recipientSocket.emit('user_typing', typingData);
        }
      }
    });

    // Handle message seen status
    socket.on('mark_message_seen', (data) => {
      const { messageId, senderId } = data;
      
      const seenData = {
        messageId: messageId,
        seenBy: socket.user._id,
        seenAt: new Date()
      };

      // Notify the sender that message was seen
      const senderSocket = Array.from(io.sockets.sockets.values())
        .find(s => s.user && s.user._id === senderId);
      
      if (senderSocket) {
        senderSocket.emit('message_seen', seenData);
      }
    });

    // Handle getting online users
    socket.on('get_online_users', () => {
      const onlineUsers = Array.from(io.sockets.sockets.values())
        .filter(s => s.user && s.user.isOnline)
        .map(s => ({
          _id: s.user._id,
          username: s.user.username,
          avatar: s.user.avatar,
          isOnline: true
        }));
      
      socket.emit('online_users_list', onlineUsers);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected: ${socket.id}`);
      updateUserOnlineStatus(false);
    });
  });
};

module.exports = {
  handleConnection,
  authenticateSocket
};

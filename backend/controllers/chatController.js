const Message = require('../models/Message');
const User = require('../models/User');

// Get chat history between two users
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    const { limit = 50 } = req.query;

    const messages = await Message.findBetweenUsers(currentUserId, userId, parseInt(limit));
    
    // Mark messages as read
    await Message.markAllAsRead(userId, currentUserId);

    res.json({
      messages: messages.reverse(), // Show oldest first
      success: true
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text', replyTo, attachment } = req.body;
    const senderId = req.user._id;

    console.log('Received message request:', {
      receiverId,
      messageType,
      hasAttachment: !!attachment,
      attachmentType: attachment?.type,
      senderId
    });

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      console.log('Receiver not found:', receiverId);
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Handle voice messages
    let messageContent = content;
    let messageAttachment = null;

    if (messageType === 'voice' && attachment) {
      console.log('Processing voice message:', {
        audioLength: attachment.audio?.length,
        duration: attachment.duration
      });
      
      messageContent = ''; // Voice messages don't have text content
      messageAttachment = {
        type: 'voice',
        audio: attachment.audio,
        duration: attachment.duration || 0
      };
    }

    // Create message
    const message = new Message({
      senderId,
      receiverId,
      content: messageContent,
      messageType,
      replyTo,
      attachment: messageAttachment
    });

    console.log('Saving message:', {
      senderId,
      receiverId,
      messageType,
      hasAttachment: !!messageAttachment,
      contentLength: messageContent?.length || 0
    });

    await message.save();
    console.log('Message saved successfully:', message._id);

    // Populate sender info for response
    await message.populate('senderId', 'username avatar');

    console.log('Sending response with message:', message._id);
    res.status(201).json({
      message: message,
      success: true
    });
  } catch (error) {
    console.error('Send message error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Server error: ' + error.message,
      error: error.message
    });
  }
};

// Get all conversations for the current user
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all messages where user is either sender or receiver
    const messages = await Message.find({
      $and: [
        { deleted: false },
        {
          $or: [
            { senderId: currentUserId },
            { receiverId: currentUserId }
          ]
        }
      ]
    })
    .populate('senderId', 'username avatar isOnline')
    .populate('receiverId', 'username avatar isOnline')
    .sort({ timestamp: -1 });

    // Group by conversation partner
    const conversations = new Map();
    
    messages.forEach(message => {
      const partnerId = message.senderId._id.toString() === currentUserId.toString() 
        ? message.receiverId._id.toString() 
        : message.senderId._id.toString();
      
      const partner = message.senderId._id.toString() === currentUserId.toString() 
        ? message.receiverId 
        : message.senderId;

      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partner: partner,
          lastMessage: message,
          unreadCount: 0,
          messages: []
        });
      }
      
      conversations.get(partnerId).messages.push(message);
      
      // Update last message if this one is more recent
      if (new Date(message.timestamp) > new Date(conversations.get(partnerId).lastMessage.timestamp)) {
        conversations.get(partnerId).lastMessage = message;
      }
      
      // Count unread messages
      if (message.receiverId._id.toString() === currentUserId.toString() && !message.isRead) {
        conversations.get(partnerId).unreadCount++;
      }
    });

    // Convert to array and sort by most recent message
    const conversationList = Array.from(conversations.values())
      .sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));

    res.json({
      conversations: conversationList,
      success: true
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get online users
const getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find({ isOnline: true });
    
    res.json({
      users: users,
      success: true
    });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user._id;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters' });
    }

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    });

    res.json({
      users,
      success: true
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }

    await message.markAsRead();

    res.json({
      message: 'Message marked as read',
      success: true
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await message.delete();

    res.json({
      message: 'Message deleted',
      success: true
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadCount = await Message.getUnreadCount(userId);

    res.json({
      unreadCount,
      success: true
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear chat history between two users
const clearChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Delete all messages between the two users
    await Message.deleteMany({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ]
    });

    res.json({
      message: 'Chat history cleared',
      success: true
    });
  } catch (error) {
    console.error('Clear chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Block user
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Check if user exists
    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already blocked
    const currentUser = await User.findById(currentUserId);
    if (currentUser.blockedUsers.includes(userId)) {
      return res.status(400).json({ message: 'User already blocked' });
    }

    // Add to blocked users
    currentUser.blockedUsers.push(userId);
    await currentUser.save();

    res.json({
      message: 'User blocked',
      success: true
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unblock user
const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Remove from blocked users
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { blockedUsers: userId }
    });

    res.json({
      message: 'User unblocked',
      success: true
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get blocked users
const getBlockedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const user = await User.findById(currentUserId).populate('blockedUsers', 'username avatar isOnline lastSeen');
    
    res.json({
      blockedUsers: user.blockedUsers,
      success: true
    });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getChatHistory,
  sendMessage,
  getConversations,
  getOnlineUsers,
  searchUsers,
  markMessageAsRead,
  deleteMessage,
  getUnreadCount,
  clearChat,
  blockUser,
  unblockUser,
  getBlockedUsers
};

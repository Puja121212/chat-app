const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');
const {
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
} = require('../controllers/chatController');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/voice');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `voice-${uniqueSuffix}.webm`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Handle voice message upload
router.post('/send-voice', auth, upload.single('audio'), async (req, res) => {
  try {
    const { receiverId, messageType, duration } = req.body;
    const senderId = req.user._id;
    const audioFile = req.file;

    console.log('Voice upload request:', {
      receiverId,
      messageType,
      duration,
      senderId,
      audioFile: audioFile ? audioFile.filename : null,
      fileSize: audioFile ? audioFile.size : null
    });

    if (!audioFile) {
      return res.status(400).json({ message: 'No audio file provided' });
    }

    // Get User model for validation
    const User = require('../models/User');
    
    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      console.log('Receiver not found:', receiverId);
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Get Message model
    const Message = require('../models/Message');

    // Create message with audio file reference
    const message = new Message({
      senderId,
      receiverId,
      content: '', // Voice messages don't have text content
      messageType: 'voice',
      attachment: {
        type: 'voice',
        audio: `/uploads/voice/${audioFile.filename}`, // Store file path instead of base64
        duration: parseInt(duration) || 0,
        filename: audioFile.filename,
        filesize: audioFile.size
      }
    });

    console.log('Saving voice message:', {
      senderId,
      receiverId,
      messageType,
      audioPath: message.attachment.audio,
      fileSize: message.attachment.filesize
    });

    await message.save();
    console.log('Voice message saved successfully:', message._id);

    // Populate sender info for response
    await message.populate('senderId', 'username avatar');

    console.log('Sending response with voice message:', message._id);
    res.status(201).json({
      message: message,
      success: true
    });

  } catch (error) {
    console.error('Voice upload error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/voice', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      message: 'Server error: ' + error.message,
      error: error.message
    });
  }
});

// Get all conversations for current user
router.get('/conversations', auth, getConversations);

// Get chat history with specific user
router.get('/history/:userId', auth, getChatHistory);

// Send message to user
router.post('/send', auth, sendMessage);

// Get online users
router.get('/online-users', auth, getOnlineUsers);

// Search users
router.get('/search', auth, searchUsers);

// Mark message as read
router.patch('/read/:messageId', auth, markMessageAsRead);

// Delete message
router.delete('/:messageId', auth, deleteMessage);

// Get unread message count
router.get('/unread-count', auth, getUnreadCount);

// Clear chat history
router.delete('/clear/:userId', auth, clearChat);

// Block user
router.post('/block/:userId', auth, blockUser);

// Unblock user
router.delete('/unblock/:userId', auth, unblockUser);

// Get blocked users
router.get('/blocked-users', auth, getBlockedUsers);

module.exports = router;

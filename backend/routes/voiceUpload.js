const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chat-app/voice',
    resource_type: 'video',
    allowed_formats: ['webm', 'ogg', 'mp4', 'm4a', 'mp3', 'wav'],
    public_id: (req) => `voice_${req.user._id}_${Date.now()}`
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm') {
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

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      console.log('Receiver not found:', receiverId);
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Create message with audio file reference
    const message = new Message({
      senderId,
      receiverId,
      content: '', // Voice messages don't have text content
      messageType: 'voice',
      attachment: {
        type: 'voice',
        audio: audioFile.path,
        duration: Number.parseInt(duration, 10) || 0,
        filename: audioFile.originalname,
        filesize: audioFile.size || 0
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

    if (req.file?.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'video' });
      } catch (cleanupError) {
        console.error('Voice upload cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      message: 'Server error: ' + error.message,
      error: error.message
    });
  }
});

module.exports = router;

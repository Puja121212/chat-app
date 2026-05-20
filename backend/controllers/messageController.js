const Message = require('../models/Message');

// Edit message
const editMessage = async (req, res) => {
  try {
    const { messageId, content } = req.body;
    const userId = req.user._id;

    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    // Check if message is too old to edit (5 minutes)
    const now = new Date();
    const messageTime = new Date(message.createdAt);
    const timeDiff = now - messageTime;
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (timeDiff > fiveMinutes) {
      return res.status(403).json({ message: 'You can only edit messages within 5 minutes of sending' });
    }

    // Update message
    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();
    await message.populate('senderId', 'username avatar');

    res.status(200).json({
      message: 'Message updated successfully',
      message: message
    });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Delete message
    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  editMessage,
  deleteMessage
};

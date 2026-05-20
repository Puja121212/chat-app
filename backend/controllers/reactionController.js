const Message = require('../models/Message');
const User = require('../models/User');

// Add reaction to message
const addReaction = async (req, res) => {
  try {
    const { messageId, emoji } = req.body;
    const userId = req.user._id;

    // Validate message exists
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      reaction => reaction.userId.toString() === userId && reaction.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction if already exists
      message.reactions = message.reactions.filter(
        reaction => !(reaction.userId.toString() === userId && reaction.emoji === emoji)
      );
    } else {
      // Remove any existing reaction from this user
      message.reactions = message.reactions.filter(
        reaction => reaction.userId.toString() !== userId
      );
      
      // Add new reaction
      message.reactions.push({
        userId: userId,
        emoji: emoji,
        createdAt: new Date()
      });
    }

    await message.save();
    await message.populate('reactions.userId', 'username avatar');

    res.status(200).json({
      message: 'Reaction updated successfully',
      reactions: message.reactions
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get reactions for message
const getReactions = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId).populate('reactions.userId', 'username avatar');
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json({
      reactions: message.reactions
    });

  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addReaction,
  getReactions
};

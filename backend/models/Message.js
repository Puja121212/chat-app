const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  content: {
    type: String,
    required: function() {
      return this.messageType === 'text';
    },
    maxlength: 1000,
    default: function() {
      return this.messageType === 'voice' ? '' : undefined;
    }
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'voice'],
    default: 'text'
  },
  attachment: {
    type: {
      type: String,
      enum: ['voice', 'image', 'file'],
      required: function() {
        return this.messageType !== 'text';
      }
    },
    audio: String,
    duration: Number,
    url: String,
    filename: String,
    filesize: Number
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  delivered: {
    type: Boolean,
    default: true
  },
  deliveredAt: {
    type: Date,
    default: Date.now
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String
  }]
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });
messageSchema.index({ roomId: 1, timestamp: -1 });
messageSchema.index({ receiverId: 1, isRead: 1 });

// Static methods
messageSchema.statics.findBetweenUsers = async function(userId1, userId2, limit = 50) {
  return await this.find({
    $and: [
      { deleted: false },
      {
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ]
      }
    ]
  })
  .populate('senderId', 'username avatar')
  .populate('receiverId', 'username avatar')
  .sort({ timestamp: -1 })
  .limit(limit);
};

messageSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    receiverId: userId,
    isRead: false,
    deleted: false
  });
};

messageSchema.statics.markAllAsRead = async function(senderId, receiverId) {
  return await this.updateMany(
    {
      senderId: senderId,
      receiverId: receiverId,
      isRead: false,
      deleted: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );
};

// Instance methods
messageSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

messageSchema.methods.edit = async function(newContent) {
  this.content = newContent;
  this.edited = true;
  this.editedAt = new Date();
  return await this.save();
};

messageSchema.methods.delete = async function() {
  this.deleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

messageSchema.methods.addReaction = async function(userId, emoji) {
  const existingReaction = this.reactions.find(r => r.userId.toString() === userId.toString());
  if (existingReaction) {
    existingReaction.emoji = emoji;
  } else {
    this.reactions.push({ userId, emoji });
  }
  return await this.save();
};

messageSchema.methods.removeReaction = async function(userId) {
  this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  return await this.save();
};

module.exports = mongoose.model('Message', messageSchema);

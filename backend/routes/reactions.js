const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addReaction, getReactions } = require('../controllers/reactionController');

// Add reaction to message
router.post('/add', auth, addReaction);

// Get reactions for message
router.get('/:messageId', auth, getReactions);

module.exports = router;

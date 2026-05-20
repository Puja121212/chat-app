const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { editMessage, deleteMessage } = require('../controllers/messageController');

// Edit message
router.put('/edit', auth, editMessage);

// Delete message
router.delete('/:messageId', auth, deleteMessage);

module.exports = router;

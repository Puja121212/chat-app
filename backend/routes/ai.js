const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSmartReplies, autoCompleteMessage, getContextualResponse } = require('../controllers/aiController');

// Get smart reply suggestions
router.post('/smart-replies', auth, getSmartReplies);

// Auto-complete message
router.post('/auto-complete', auth, autoCompleteMessage);

// Get contextual response
router.post('/contextual-response', auth, getContextualResponse);

module.exports = router;

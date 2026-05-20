const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadProfileImage, removeProfileImage, upload } = require('../controllers/uploadController');

// Upload profile image
router.post('/profile-image', auth, upload.single('image'), uploadProfileImage);

// Remove profile image
router.delete('/profile-image', auth, removeProfileImage);

module.exports = router;

const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

// POST /api/upload - Upload new video
router.post('/', uploadMiddleware.single('file'), uploadController.uploadVideo);

module.exports = router;

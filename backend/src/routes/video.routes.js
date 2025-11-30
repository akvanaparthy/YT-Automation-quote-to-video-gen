const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// GET /api/videos - List available source videos
router.get('/', videoController.listVideos);

// POST /api/generate - Generate video with quote
router.post('/generate', videoController.generateVideo);

// GET /api/download/:videoId - Download generated video
router.get('/download/:videoId', videoController.downloadVideo);

// DELETE /api/videos/:filename - Delete source video
router.delete('/:filename', videoController.deleteVideo);

module.exports = router;

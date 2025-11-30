const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { validateGenerateRequest } = require('../middleware/validation');

// GET /api/videos - List available source videos
router.get('/videos', videoController.listVideos);

// POST /api/videos/generate - Generate video with quote
router.post('/videos/generate', validateGenerateRequest, videoController.generateVideo);

// GET /api/videos/download/:videoId - Download generated video
router.get('/videos/download/:videoId', videoController.downloadVideo);

// DELETE /api/videos/:filename - Delete source video
router.delete('/videos/:filename', videoController.deleteVideo);

module.exports = router;

const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { validateGenerateRequest } = require('../middleware/validation');

// GET /api/videos - List available source videos
router.get('/videos', videoController.listVideos);

// GET /api/fonts - List available fonts
router.get('/fonts', videoController.getAvailableFonts);

// GET /api/animations - List available animations
router.get('/animations', videoController.getAvailableAnimations);

// GET /api/history - Get generation history
router.get('/history', videoController.getHistory);

// DELETE /api/history - Clear generation history
router.delete('/history', videoController.clearHistory);

// POST /api/videos/generate - Generate video with quote
router.post('/videos/generate', validateGenerateRequest, videoController.generateVideo);

// GET /api/videos/download/:videoId - Download generated video
router.get('/videos/download/:videoId', videoController.downloadVideo);

// DELETE /api/videos/:filename - Delete source video
router.delete('/videos/:filename', videoController.deleteVideo);

module.exports = router;

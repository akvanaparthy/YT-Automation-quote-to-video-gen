/**
 * Video Controller
 * Handles video generation, listing, downloading, and deletion
 */

const videoProcessor = require('../services/videoProcessor');
const fileManager = require('../utils/fileManager');
const randomSelector = require('../utils/randomSelector');

// List all available source videos
exports.listVideos = async (req, res, next) => {
  try {
    const videos = await fileManager.listVideos();
    res.json({
      success: true,
      videos: videos
    });
  } catch (err) {
    next(err);
  }
};

// Generate video with quote overlay
exports.generateVideo = async (req, res, next) => {
  try {
    const { quote, style } = req.body;

    // Validation will be added in middleware

    // Select random video
    const selectedVideo = await randomSelector.selectRandomVideo();
    if (!selectedVideo) {
      return res.status(400).json({
        success: false,
        error: 'No videos available'
      });
    }

    // Process video with quote overlay
    const outputPath = await videoProcessor.processVideo(selectedVideo, quote, style);

    res.json({
      success: true,
      videoId: `gen_${Date.now()}`,
      downloadUrl: `/api/download/gen_${Date.now()}.mp4`,
      message: 'Video generated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Download generated video
exports.downloadVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    // Download logic to be implemented
    res.json({ message: 'Download endpoint placeholder' });
  } catch (err) {
    next(err);
  }
};

// Delete source video
exports.deleteVideo = async (req, res, next) => {
  try {
    const { filename } = req.params;
    await fileManager.deleteVideo(filename);
    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

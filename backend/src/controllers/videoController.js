/**
 * Video Controller
 * Handles video generation, listing, downloading, and deletion
 */

const videoProcessor = require('../services/videoProcessor');
const fileManager = require('../utils/fileManager');
const randomSelector = require('../utils/randomSelector');
const textOverlay = require('../services/textOverlay');

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
    const { quote, style, maxDuration, addMusic } = req.body;

    // Validation will be added in middleware

    // Select random video
    const selectedVideo = await randomSelector.selectRandomVideo();
    if (!selectedVideo) {
      return res.status(400).json({
        success: false,
        error: 'No videos available'
      });
    }

    // Select random music if requested
    let selectedMusic = null;
    if (addMusic !== false) {  // Default to true if not specified
      selectedMusic = await randomSelector.selectRandomMusic();
      if (!selectedMusic) {
        console.log('No music files available, continuing without music');
      }
    }

    // Process video with quote overlay, music, and duration
    const outputPath = await videoProcessor.processVideo(
      selectedVideo, 
      quote, 
      style,
      selectedMusic,
      maxDuration
    );
    
    // Extract filename from path
    const path = require('path');
    const filename = path.basename(outputPath);

    res.json({
      success: true,
      videoId: filename,
      downloadUrl: `/api/videos/download/${filename}`,
      message: 'Video generated successfully',
      hasMusic: !!selectedMusic,
      duration: maxDuration || 'original'
    });
  } catch (err) {
    next(err);
  }
};

// Download generated video
exports.downloadVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const path = require('path');
    const fs = require('fs');
    
    // Construct full path to generated video
    const videoPath = path.join(process.cwd(), 'storage', 'output', videoId);
    
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${videoId}"`);
    
    // Stream the video file
    const fileStream = fs.createReadStream(videoPath);
    fileStream.pipe(res);
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

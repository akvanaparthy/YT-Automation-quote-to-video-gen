/**
 * Video Controller
 * Handles video generation, listing, downloading, and deletion
 */

const videoProcessor = require('../services/videoProcessor');
const fileManager = require('../utils/fileManager');
const randomSelector = require('../utils/randomSelector');
const textOverlay = require('../services/textOverlay');
const historyManager = require('../utils/historyManager');
const fs = require('fs').promises;

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
    const { quote, style = {}, maxDuration, addMusic = true, autoDelete = true } = req.body;

    // Apply defaults to style
    const config = require('../config/config');
    const finalStyle = {
      fontFamily: style.fontFamily || config.DEFAULT_FONT,
      fontSize: style.fontSize || config.DEFAULT_FONT_SIZE,
      fontColor: style.fontColor || config.DEFAULT_FONT_COLOR,
      position: style.position || config.DEFAULT_POSITION,
      backgroundColor: style.backgroundColor || null,
      animation: style.animation || 'none'
    };

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
    if (addMusic === true) {
      selectedMusic = await randomSelector.selectRandomMusic();
      if (!selectedMusic) {
        console.log('No music files available, continuing without music');
      }
    }

    // Process video with quote overlay, music, and duration
    const outputPath = await videoProcessor.processVideo(
      selectedVideo, 
      quote, 
      finalStyle,
      selectedMusic,
      maxDuration
    );
    
    // Extract filename from path
    const path = require('path');
    const filename = path.basename(outputPath);

    // Get video info for duration
    const videoInfo = await videoProcessor.getVideoInfo(outputPath);
    const finalDuration = Math.round(videoInfo.duration);

    // Add to history
    await historyManager.addHistoryEntry({
      videoId: filename,
      videoUsed: path.basename(selectedVideo.path),
      musicUsed: selectedMusic ? path.basename(selectedMusic.path) : null,
      duration: finalDuration,
      autoDelete: autoDelete
    });

    // Schedule deletion if autoDelete is true
    if (autoDelete === true) {
      const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      setTimeout(async () => {
        try {
          await fs.unlink(outputPath);
          console.log(`Auto-deleted video: ${filename}`);
        } catch (err) {
          console.error(`Failed to auto-delete video ${filename}:`, err);
        }
      }, ONE_DAY);
    }

    res.json({
      success: true,
      videoId: filename,
      downloadUrl: `/api/videos/download/${filename}`,
      message: 'Video generated successfully',
      hasMusic: !!selectedMusic,
      duration: finalDuration,
      autoDelete: autoDelete,
      expiresIn: autoDelete ? '24 hours' : 'never'
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

// Get available fonts
exports.getAvailableFonts = async (req, res, next) => {
  try {
    const fonts = textOverlay.getAvailableFonts();
    res.json({
      success: true,
      fonts: fonts
    });
  } catch (err) {
    next(err);
  }
};

// Get available animations
exports.getAvailableAnimations = async (req, res, next) => {
  try {
    const animations = textOverlay.getAvailableAnimations();
    res.json({
      success: true,
      animations: animations
    });
  } catch (err) {
    next(err);
  }
};

// Get generation history
exports.getHistory = async (req, res, next) => {
  try {
    const history = await historyManager.getHistory();
    res.json({
      success: true,
      history: history,
      total: history.length
    });
  } catch (err) {
    next(err);
  }
};

// Clear generation history
exports.clearHistory = async (req, res, next) => {
  try {
    await historyManager.clearHistory();
    res.json({
      success: true,
      message: 'History cleared successfully'
    });
  } catch (err) {
    next(err);
  }
};

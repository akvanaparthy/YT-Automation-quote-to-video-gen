/**
 * File Manager
 * Handles file operations (list, delete, validate)
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

// List all video files in storage
exports.listVideos = async () => {
  try {
    const files = await fs.readdir(config.VIDEO_STORAGE_PATH);
    const videos = [];

    for (const file of files) {
      const ext = path.extname(file);
      if (config.ALLOWED_FORMATS.includes(ext.toLowerCase())) {
        videos.push({
          id: file,
          filename: file,
          size: '0MB', // To be implemented with actual file size
          duration: '0s', // To be implemented with FFmpeg probe
          resolution: '1080x1920'
        });
      }
    }

    return videos;
  } catch (err) {
    throw new Error(`Failed to list videos: ${err.message}`);
  }
};

// Delete a video file
exports.deleteVideo = async (filename) => {
  try {
    const filepath = path.join(config.VIDEO_STORAGE_PATH, filename);
    await fs.unlink(filepath);
  } catch (err) {
    throw new Error(`Failed to delete video: ${err.message}`);
  }
};

// Validate file format
exports.isValidFormat = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return config.ALLOWED_FORMATS.includes(ext);
};

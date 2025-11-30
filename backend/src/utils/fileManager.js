/**
 * File Manager
 * Handles file operations (list, delete, validate)
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const config = require('../config/config');

// Ensure directories exist
const ensureDirs = () => {
  const dirs = [config.VIDEO_STORAGE_PATH, config.OUTPUT_PATH];
  dirs.forEach(dir => {
    if (!fsSync.existsSync(dir)) {
      fsSync.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureDirs();

// List all video files in storage
exports.listVideos = async () => {
  try {
    const files = await fs.readdir(config.VIDEO_STORAGE_PATH);
    const videos = [];

    for (const file of files) {
      if (file === '.gitkeep') continue;

      const ext = path.extname(file);
      if (config.ALLOWED_FORMATS.includes(ext.toLowerCase())) {
        const filepath = path.join(config.VIDEO_STORAGE_PATH, file);
        const stats = await fs.stat(filepath);
        const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);

        videos.push({
          id: file,
          filename: file,
          size: `${sizeInMB}MB`,
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
    // Safety check - ensure file is in the correct directory
    const resolvedPath = path.resolve(filepath);
    const resolvedDir = path.resolve(config.VIDEO_STORAGE_PATH);

    if (!resolvedPath.startsWith(resolvedDir)) {
      throw new Error('Invalid file path');
    }

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

// Get file path safely
exports.getFilePath = (filename) => {
  const filepath = path.join(config.VIDEO_STORAGE_PATH, filename);
  const resolvedPath = path.resolve(filepath);
  const resolvedDir = path.resolve(config.VIDEO_STORAGE_PATH);

  if (!resolvedPath.startsWith(resolvedDir)) {
    throw new Error('Invalid file path');
  }

  return filepath;
};

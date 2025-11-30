/**
 * Random Selector
 * Selects a random video from the storage
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

// Select a random video from storage
exports.selectRandomVideo = async () => {
  try {
    const files = await fs.readdir(config.VIDEO_STORAGE_PATH);
    const videoFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return config.ALLOWED_FORMATS.includes(ext);
    });

    if (videoFiles.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * videoFiles.length);
    const selectedFile = videoFiles[randomIndex];

    return {
      filename: selectedFile,
      path: path.join(config.VIDEO_STORAGE_PATH, selectedFile)
    };
  } catch (err) {
    throw new Error(`Failed to select random video: ${err.message}`);
  }
};

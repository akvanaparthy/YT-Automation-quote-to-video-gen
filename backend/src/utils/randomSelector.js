/**
 * Random Selector
 * Selects a random video and music from the storage
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

// Select a random music from storage
exports.selectRandomMusic = async () => {
  try {
    const musicPath = path.join(process.cwd(), 'src', 'assets', 'music');
    const allowedAudioFormats = ['.mp3', '.wav', '.aac', '.m4a'];
    
    // Check if music directory exists
    try {
      await fs.access(musicPath);
    } catch (err) {
      return null; // No music directory, skip music
    }

    const files = await fs.readdir(musicPath);
    const musicFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return allowedAudioFormats.includes(ext) && !file.startsWith('.');
    });

    if (musicFiles.length === 0) {
      return null; // No music files available
    }

    const randomIndex = Math.floor(Math.random() * musicFiles.length);
    const selectedFile = musicFiles[randomIndex];

    return {
      filename: selectedFile,
      path: path.join(musicPath, selectedFile)
    };
  } catch (err) {
    console.warn(`Failed to select random music: ${err.message}`);
    return null; // Return null if music selection fails
  }
};

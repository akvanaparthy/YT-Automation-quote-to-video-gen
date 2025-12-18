/**
 * Cloudinary Sync Service
 * Downloads videos and music from Cloudinary to local storage on server startup
 */

const fs = require('fs').promises;
const path = require('path');
const cloudinaryService = require('./cloudinaryService');
const config = require('../config/config');

/**
 * Ensure directory exists, create if it doesn't
 */
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Download all videos from Cloudinary to local storage
 */
async function syncVideos() {
  console.log('Syncing videos from Cloudinary...');
  
  try {
    await ensureDirectoryExists(config.VIDEO_STORAGE_PATH);
    
    const videos = await cloudinaryService.listVideos('videos');
    
    if (videos.length === 0) {
      console.log('No videos found in Cloudinary');
      return;
    }

    console.log(`Found ${videos.length} videos in Cloudinary`);
    
    for (const video of videos) {
      const filename = `${path.basename(video.public_id)}.${video.format}`;
      const localPath = path.join(config.VIDEO_STORAGE_PATH, filename);
      
      // Check if file already exists locally
      try {
        await fs.access(localPath);
        console.log(`  Video already exists: ${filename}`);
        continue;
      } catch {
        // File doesn't exist, download it
        console.log(`  Downloading: ${filename}...`);
        await cloudinaryService.downloadFile(video.url, localPath);
        console.log(`  ✓ Downloaded ${filename}`);
      }
    }
    
    console.log('✓ Videos sync completed\n');
  } catch (error) {
    console.error('Error syncing videos:', error.message);
    throw error;
  }
}

/**
 * Download all music from Cloudinary to local storage
 */
async function syncMusic() {
  console.log('Syncing music from Cloudinary...');
  
  try {
    await ensureDirectoryExists(config.MUSIC_STORAGE_PATH);
    
    const musicFiles = await cloudinaryService.listVideos('music');
    
    if (musicFiles.length === 0) {
      console.log('No music found in Cloudinary');
      return;
    }

    console.log(`Found ${musicFiles.length} music files in Cloudinary`);
    
    for (const music of musicFiles) {
      const filename = `${path.basename(music.public_id)}.${music.format}`;
      const localPath = path.join(config.MUSIC_STORAGE_PATH, filename);
      
      // Check if file already exists locally
      try {
        await fs.access(localPath);
        console.log(`  Music already exists: ${filename}`);
        continue;
      } catch {
        // File doesn't exist, download it
        console.log(`  Downloading: ${filename}...`);
        await cloudinaryService.downloadFile(music.url, localPath);
        console.log(`  ✓ Downloaded ${filename}`);
      }
    }
    
    console.log('✓ Music sync completed\n');
  } catch (error) {
    console.error('Error syncing music:', error.message);
    throw error;
  }
}

/**
 * Initialize sync - download all assets from Cloudinary
 */
async function initializeSync() {
  console.log('\n=== Starting Cloudinary Sync ===\n');
  
  try {
    // Ensure output directory exists as well
    await ensureDirectoryExists(config.OUTPUT_PATH);
    
    // Sync videos and music in parallel
    await Promise.all([
      syncVideos(),
      syncMusic()
    ]);
    
    console.log('=== Cloudinary Sync Completed ===\n');
  } catch (error) {
    console.error('Failed to sync from Cloudinary:', error.message);
    throw error;
  }
}

module.exports = {
  initializeSync,
  syncVideos,
  syncMusic
};

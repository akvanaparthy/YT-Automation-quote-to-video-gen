/**
 * Google Drive Sync Service
 * Syncs music and video files between Google Drive and local storage
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const https = require('https');
const config = require('../config/config');

// Storage paths
const VIDEOS_PATH = path.join(__dirname, '../../storage/videos');
const MUSIC_PATH = path.join(__dirname, '../../storage/music');

// Google Drive folder IDs (extract from share links)
let DRIVE_CONFIG = {
  videosFolder: null,
  musicFolder: null
};

/**
 * Extract folder ID from Google Drive share link
 */
function extractFolderId(shareLink) {
  const match = shareLink.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Set Drive configuration from share link
 */
function setDriveLink(shareLink) {
  // For now, we'll need separate folder IDs for videos and music
  // This function can be enhanced to parse a parent folder and detect subfolders
  console.log('Drive link set:', shareLink);
  
  // Extract folder ID from the link
  const folderId = extractFolderId(shareLink);
  if (!folderId) {
    throw new Error('Invalid Google Drive share link');
  }
  
  return folderId;
}

/**
 * List files in Google Drive folder by scraping public folder page
 * Works without API key for publicly shared folders
 */
async function listDriveFiles(folderId) {
  try {
    // Debug: Check if API key exists
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
    console.log(`API Key status: ${apiKey ? 'Present (length: ' + apiKey.length + ')' : 'Missing'}`);
    
    // Try API first if key is available
    if (apiKey && apiKey.trim()) {
      const apiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType,size)&key=${apiKey}`;
      console.log(`Querying Drive API...`);
      
      return new Promise((resolve, reject) => {
        https.get(apiUrl, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              if (response.error) {
                console.error('API Error:', response.error.message);
                resolve([]);
                return;
              }
              
              const files = (response.files || []).filter(file => 
                !file.mimeType.includes('folder')
              );
              console.log(`✓ API returned ${files.length} files`);
              resolve(files);
            } catch (err) {
              console.error('Error parsing API response:', err.message);
              resolve([]);
            }
          });
        }).on('error', (err) => {
          console.error('Error calling Drive API:', err.message);
          resolve([]);
        });
      });
    }
    
    // Without API key, user must manually list files
    console.log(`\nNo API key configured. Please manually add file IDs to sync.`);
    console.log(`Or get an API key from: https://console.cloud.google.com/apis/credentials`);
    return [];
    
  } catch (err) {
    console.error('Error listing Drive files:', err);
    return [];
  }
}

/**
 * Download file from Google Drive
 */
async function downloadDriveFile(fileId, fileName, destPath) {
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const filePath = path.join(destPath, fileName);
  
  return new Promise((resolve, reject) => {
    https.get(downloadUrl, (res) => {
      // Handle redirects for large files
      if (res.statusCode === 302 || res.statusCode === 301) {
        https.get(res.headers.location, (redirectRes) => {
          const writeStream = fsSync.createWriteStream(filePath);
          redirectRes.pipe(writeStream);
          
          writeStream.on('finish', () => {
            writeStream.close();
            resolve(filePath);
          });
          
          writeStream.on('error', reject);
        }).on('error', reject);
      } else {
        const writeStream = fsSync.createWriteStream(filePath);
        res.pipe(writeStream);
        
        writeStream.on('finish', () => {
          writeStream.close();
          resolve(filePath);
        });
        
        writeStream.on('error', reject);
      }
    }).on('error', reject);
  });
}

/**
 * Get local files in a directory
 */
async function getLocalFiles(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    return files.filter(file => {
      const filePath = path.join(dirPath, file);
      const stat = fsSync.statSync(filePath);
      return stat.isFile() && !file.startsWith('.') && file !== 'README.md';
    });
  } catch (err) {
    console.error(`Error reading local files from ${dirPath}:`, err);
    return [];
  }
}

/**
 * Sync a specific folder (videos or music)
 */
async function syncFolder(folderId, localPath, folderType) {
  const syncStats = {
    downloaded: [],
    deleted: [],
    skipped: [],
    errors: []
  };
  
  try {
    console.log(`\n--- Syncing ${folderType} ---`);
    
    // Get Drive files
    const driveFiles = await listDriveFiles(folderId);
    const driveFileNames = driveFiles.map(f => f.name);
    console.log(`Found ${driveFiles.length} files in Drive ${folderType} folder`);
    
    // Get local files
    const localFiles = await getLocalFiles(localPath);
    console.log(`Found ${localFiles.length} files in local ${folderType} folder`);
    
    // Download missing files from Drive
    for (const driveFile of driveFiles) {
      if (!localFiles.includes(driveFile.name)) {
        try {
          console.log(`Downloading: ${driveFile.name}...`);
          await downloadDriveFile(driveFile.id, driveFile.name, localPath);
          syncStats.downloaded.push(driveFile.name);
          console.log(`✓ Downloaded: ${driveFile.name}`);
        } catch (err) {
          console.error(`✗ Failed to download ${driveFile.name}:`, err.message);
          syncStats.errors.push({ file: driveFile.name, error: err.message });
        }
      } else {
        syncStats.skipped.push(driveFile.name);
      }
    }
    
    // Delete local files not in Drive
    for (const localFile of localFiles) {
      if (!driveFileNames.includes(localFile)) {
        try {
          const filePath = path.join(localPath, localFile);
          await fs.unlink(filePath);
          syncStats.deleted.push(localFile);
          console.log(`✓ Deleted: ${localFile}`);
        } catch (err) {
          console.error(`✗ Failed to delete ${localFile}:`, err.message);
          syncStats.errors.push({ file: localFile, error: err.message });
        }
      }
    }
    
    console.log(`\n${folderType} sync complete:`);
    console.log(`  Downloaded: ${syncStats.downloaded.length}`);
    console.log(`  Deleted: ${syncStats.deleted.length}`);
    console.log(`  Skipped (already synced): ${syncStats.skipped.length}`);
    console.log(`  Errors: ${syncStats.errors.length}`);
    
  } catch (err) {
    console.error(`Error syncing ${folderType}:`, err);
    syncStats.errors.push({ file: 'general', error: err.message });
  }
  
  return syncStats;
}

/**
 * Perform full sync of both videos and music
 */
async function performSync(videosFolder, musicFolder) {
  const startTime = Date.now();
  console.log('\n========================================');
  console.log('Starting Google Drive Sync...');
  console.log('========================================');
  
  const results = {
    videos: { downloaded: [], deleted: [], skipped: [], errors: [] },
    music: { downloaded: [], deleted: [], skipped: [], errors: [] },
    duration: 0,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Sync videos
    if (videosFolder) {
      results.videos = await syncFolder(videosFolder, VIDEOS_PATH, 'videos');
    } else {
      console.log('Videos folder not configured, skipping...');
    }
    
    // Sync music
    if (musicFolder) {
      results.music = await syncFolder(musicFolder, MUSIC_PATH, 'music');
    } else {
      console.log('Music folder not configured, skipping...');
    }
    
    results.duration = Math.round((Date.now() - startTime) / 1000);
    
    console.log('\n========================================');
    console.log(`Sync completed in ${results.duration}s`);
    console.log('========================================\n');
    
  } catch (err) {
    console.error('Sync failed:', err);
    results.error = err.message;
  }
  
  return results;
}

/**
 * Configure Drive folders from environment variables
 */
function configureDriveFolders() {
  const videosLink = process.env.DRIVE_VIDEOS_FOLDER;
  const musicLink = process.env.DRIVE_MUSIC_FOLDER;
  
  if (videosLink) {
    DRIVE_CONFIG.videosFolder = extractFolderId(videosLink);
    console.log('Videos Drive folder configured:', DRIVE_CONFIG.videosFolder);
  }
  
  if (musicLink) {
    DRIVE_CONFIG.musicFolder = extractFolderId(musicLink);
    console.log('Music Drive folder configured:', DRIVE_CONFIG.musicFolder);
  }
  
  return DRIVE_CONFIG;
}

/**
 * Initialize sync service on startup
 */
async function initializeSync() {
  console.log('\n=== Initializing Drive Sync Service ===');
  
  // Configure from environment
  configureDriveFolders();
  
  // Perform initial sync if configured
  if (DRIVE_CONFIG.videosFolder || DRIVE_CONFIG.musicFolder) {
    if (process.env.AUTO_SYNC_ON_START !== 'false') {
      console.log('Auto-sync enabled, starting initial sync...');
      await performSync(DRIVE_CONFIG.videosFolder, DRIVE_CONFIG.musicFolder);
    } else {
      console.log('Auto-sync disabled, skipping initial sync');
    }
  } else {
    console.log('Drive folders not configured, sync disabled');
    console.log('Set DRIVE_VIDEOS_FOLDER and DRIVE_MUSIC_FOLDER in .env to enable');
  }
  
  console.log('=== Drive Sync Service Ready ===\n');
}

module.exports = {
  performSync,
  configureDriveFolders,
  initializeSync,
  getDriveConfig: () => DRIVE_CONFIG,
  setDriveLink
};

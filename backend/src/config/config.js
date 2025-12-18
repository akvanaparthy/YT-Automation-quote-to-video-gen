module.exports = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || 'yt-automation-qtov',
  
  // Sync Settings
  SYNC_FILE_COUNT: process.env.SYNC_FILE_COUNT || 'all', // 'all' or number (e.g., '1', '2')
  
  // Video Quality (0-100, higher = better quality but slower rendering)
  VIDEO_QUALITY: parseInt(process.env.VIDEO_QUALITY) || 95, // Default to 95 for high clarity

  // Paths
  VIDEO_STORAGE_PATH: './storage/videos',
  MUSIC_STORAGE_PATH: './storage/music',
  OUTPUT_PATH: './storage/output',
  FONTS_PATH: './src/assets/fonts',
  HISTORY_PATH: './storage/history.json',

  // File Limits
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_FORMATS: ['.mp4', '.mov'],

  // Text Defaults
  DEFAULT_FONT: 'Arial',
  DEFAULT_FONT_SIZE: 60,
  DEFAULT_FONT_COLOR: '#FFFFFF',
  DEFAULT_POSITION: 'center',

  // Cleanup
  OUTPUT_CLEANUP_ENABLED: true,
  OUTPUT_CLEANUP_TIME: 3600000, // 1 hour in ms

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
};

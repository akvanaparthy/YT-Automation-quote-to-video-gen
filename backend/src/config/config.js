module.exports = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Paths
  VIDEO_STORAGE_PATH: './storage/videos',
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

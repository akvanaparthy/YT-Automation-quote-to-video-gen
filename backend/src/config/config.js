module.exports = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Paths
  VIDEO_STORAGE_PATH: './storage/videos',
  OUTPUT_PATH: './storage/output',
  FONTS_PATH: './src/assets/fonts',

  // File Limits
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_FORMATS: ['.mp4', '.mov'],

  // Text Defaults
  DEFAULT_FONT: 'Arial',
  DEFAULT_FONT_SIZE: 60,
  DEFAULT_FONT_COLOR: '#FFFFFF',
  DEFAULT_POSITION: 'center',

  // FFmpeg
  FFMPEG_PRESET: 'medium', // ultrafast, superfast, veryfast, faster, fast, medium, slow
  VIDEO_BITRATE: '5000k',
  VIDEO_RESOLUTION: '1080x1920',

  // Cleanup
  OUTPUT_CLEANUP_ENABLED: true,
  OUTPUT_CLEANUP_TIME: 3600000, // 1 hour in ms

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
};

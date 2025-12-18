/**
 * Upload Middleware
 * Multer configuration for file uploads to Cloudinary
 */

const multer = require('multer');
const path = require('path');

// Use memory storage for uploading to Cloudinary
const storage = multer.memoryStorage();

// File filter - allow both video and audio files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedFormats = [
    '.mp4', '.mov', '.avi', '.mkv', '.webm', // Videos
    '.mp3', '.wav', '.m4a', '.aac', '.ogg'   // Audio
  ];

  if (!allowedFormats.includes(ext)) {
    return cb(new Error(`File format not allowed. Allowed formats: ${allowedFormats.join(', ')}`));
  }

  cb(null, true);
};

module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

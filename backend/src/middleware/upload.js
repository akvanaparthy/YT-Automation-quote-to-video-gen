/**
 * Upload Middleware
 * Multer configuration for file uploads
 */

const multer = require('multer');
const path = require('path');
const config = require('../config/config');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.VIDEO_STORAGE_PATH);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!config.ALLOWED_FORMATS.includes(ext)) {
    cb(new Error(`File format not allowed. Allowed formats: ${config.ALLOWED_FORMATS.join(', ')}`), false);
  } else if (file.size > config.MAX_VIDEO_SIZE) {
    cb(new Error(`File size exceeds limit of ${config.MAX_VIDEO_SIZE / 1024 / 1024}MB`), false);
  } else {
    cb(null, true);
  }
};

module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.MAX_VIDEO_SIZE
  }
});

/**
 * Upload Controller
 * Handles video file uploads
 */

const fileManager = require('../utils/fileManager');

// Upload video file
exports.uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    // File validation to be implemented
    const filename = req.file.filename;

    res.json({
      success: true,
      filename: filename,
      message: 'Video uploaded successfully'
    });
  } catch (err) {
    next(err);
  }
};

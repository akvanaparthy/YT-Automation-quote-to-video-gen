/**
 * Upload Controller
 * Handles file uploads to Cloudinary
 */

const cloudinaryService = require('../services/cloudinaryService');
const path = require('path');

// Upload video file
exports.uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const fileBuffer = req.file.buffer;
    const filename = req.file.originalname;
    const ext = path.extname(filename).toLowerCase();
    
    // Determine if it's audio or video
    const audioFormats = ['.mp3', '.wav', '.m4a', '.aac', '.ogg'];
    const isAudio = audioFormats.includes(ext);
    
    // Upload to Cloudinary
    let result;
    if (isAudio) {
      result = await cloudinaryService.uploadAudio(fileBuffer, filename);
    } else {
      result = await cloudinaryService.uploadVideo(fileBuffer, 'videos', filename);
    }

    res.json({
      success: true,
      filename: filename,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
      duration: result.duration,
      message: `${isAudio ? 'Music' : 'Video'} uploaded successfully to Cloudinary`
    });
  } catch (err) {
    next(err);
  }
};

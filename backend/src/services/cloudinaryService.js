/**
 * Cloudinary Service
 * Handles all Cloudinary operations: upload, list, delete, download
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const BASE_FOLDER = process.env.CLOUDINARY_FOLDER || 'yt-automation-qtov';

/**
 * Upload a video file to Cloudinary
 * @param {Buffer|string} fileSource - File buffer or path
 * @param {string} subfolder - 'videos', 'music', or 'output'
 * @param {string} filename - Original filename (optional)
 * @returns {Promise<Object>} Cloudinary upload response
 */
exports.uploadVideo = async (fileSource, subfolder = 'videos', filename = null) => {
  try {
    const folder = `${BASE_FOLDER}/${subfolder}`;
    
    const uploadOptions = {
      resource_type: 'video',
      folder: folder,
      use_filename: !!filename,
      unique_filename: true,
      overwrite: false
    };

    if (filename) {
      const nameWithoutExt = path.basename(filename, path.extname(filename));
      uploadOptions.public_id = nameWithoutExt;
    }

    let result;
    if (Buffer.isBuffer(fileSource)) {
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(fileSource);
      });
    } else {
      result = await cloudinary.uploader.upload(fileSource, uploadOptions);
    }

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
      duration: result.duration,
      width: result.width,
      height: result.height,
      created_at: result.created_at
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Upload an audio file to Cloudinary
 * @param {Buffer|string} fileSource - File buffer or path
 * @param {string} filename - Original filename (optional)
 * @returns {Promise<Object>} Cloudinary upload response
 */
exports.uploadAudio = async (fileSource, filename = null) => {
  try {
    const folder = `${BASE_FOLDER}/music`;
    
    const uploadOptions = {
      resource_type: 'video', // Audio files use 'video' resource type
      folder: folder,
      use_filename: !!filename,
      unique_filename: true,
      overwrite: false
    };

    if (filename) {
      const nameWithoutExt = path.basename(filename, path.extname(filename));
      uploadOptions.public_id = nameWithoutExt;
    }

    let result;
    if (Buffer.isBuffer(fileSource)) {
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(fileSource);
      });
    } else {
      result = await cloudinary.uploader.upload(fileSource, uploadOptions);
    }

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      format: result.format,
      bytes: result.bytes,
      duration: result.duration,
      created_at: result.created_at
    };
  } catch (error) {
    throw new Error(`Cloudinary audio upload failed: ${error.message}`);
  }
};

/**
 * List all videos in a Cloudinary folder
 * @param {string} subfolder - 'videos', 'music', or 'output'
 * @param {number} maxResults - Maximum number of results (default: 500)
 * @returns {Promise<Array>} Array of video resources
 */
exports.listVideos = async (subfolder = 'videos', maxResults = 500) => {
  try {
    const folder = `${BASE_FOLDER}/${subfolder}`;
    
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'video',
      prefix: folder,
      max_results: maxResults
    });

    return result.resources.map(resource => ({
      public_id: resource.public_id,
      filename: path.basename(resource.public_id),
      secure_url: resource.secure_url,
      url: resource.url,
      format: resource.format,
      bytes: resource.bytes,
      duration: resource.duration,
      width: resource.width,
      height: resource.height,
      created_at: resource.created_at
    }));
  } catch (error) {
    throw new Error(`Failed to list Cloudinary videos: ${error.message}`);
  }
};

/**
 * Delete a video from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<Object>} Deletion result
 */
exports.deleteVideo = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video',
      invalidate: true
    });
    
    return result;
  } catch (error) {
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

/**
 * Download a file from URL to local path
 * @param {string} url - File URL
 * @param {string} destPath - Destination file path
 * @returns {Promise<void>}
 */
exports.downloadFile = (url, destPath) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    
    protocol.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
};

/**
 * Get Cloudinary delivery URL for a resource
 * @param {string} publicId - Cloudinary public_id
 * @param {Object} options - Transformation options
 * @returns {string} Delivery URL
 */
exports.getDeliveryUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    secure: true,
    ...options
  });
};

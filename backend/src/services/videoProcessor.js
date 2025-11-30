/**
 * Video Processor
 * Handles FFmpeg video processing with text overlay
 */

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const config = require('../config/config');
const textOverlay = require('./textOverlay');

// Process video with text overlay
exports.processVideo = async (video, quote, style) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Prepare output filename
      const timestamp = Date.now();
      const outputFilename = `generated_${timestamp}.mp4`;
      const outputPath = path.join(config.OUTPUT_PATH, outputFilename);

      // Merge default style with provided style
      const finalStyle = {
        fontFamily: style?.fontFamily || config.DEFAULT_FONT,
        fontSize: style?.fontSize || config.DEFAULT_FONT_SIZE,
        fontColor: style?.fontColor || config.DEFAULT_FONT_COLOR,
        position: style?.position || config.DEFAULT_POSITION,
        backgroundColor: style?.backgroundColor || null,
        animation: style?.animation || 'none'
      };

      // Generate FFmpeg filter string
      const filterString = textOverlay.generateFilterString(quote, finalStyle);

      // FFmpeg command
      ffmpeg(video.path)
        .output(outputPath)
        .videoFilter(filterString)
        .audioCodec('aac')
        .videoCodec('libx264')
        .preset(config.FFMPEG_PRESET)
        .on('progress', (progress) => {
          console.log(`Processing video: ${Math.round(progress.percent)}% done`);
        })
        .on('end', () => {
          console.log(`Video processed successfully: ${outputPath}`);
          resolve(outputPath);

          // Schedule cleanup if enabled
          if (config.OUTPUT_CLEANUP_ENABLED) {
            setTimeout(() => {
              fs.unlink(outputPath).catch(err => console.error('Cleanup error:', err));
            }, config.OUTPUT_CLEANUP_TIME);
          }
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(new Error(`Video processing failed: ${err.message}`));
        })
        .run();
    } catch (err) {
      reject(err);
    }
  });
};

// Get video information
exports.getVideoInfo = (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          duration: metadata.format.duration,
          resolution: `${metadata.streams[0].width}x${metadata.streams[0].height}`,
          codec: metadata.streams[0].codec_name
        });
      }
    });
  });
};

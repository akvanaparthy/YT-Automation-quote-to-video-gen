/**
 * Video Processor
 * Handles FFmpeg video processing with text overlay, music, and duration control
 */

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const config = require('../config/config');
const textOverlay = require('./textOverlay');

// Ensure output directory exists
if (!fsSync.existsSync(config.OUTPUT_PATH)) {
  fsSync.mkdirSync(config.OUTPUT_PATH, { recursive: true });
}

// Process video with text overlay, music, and duration control
exports.processVideo = async (video, quote, style, musicFile = null, maxDuration = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get video information first
      const videoInfo = await exports.getVideoInfo(video.path);
      const videoDuration = videoInfo.duration;
      
      // Determine final duration
      const finalDuration = maxDuration && maxDuration < videoDuration ? maxDuration : videoDuration;
      
      // Prepare output filename
      const timestamp = Date.now();
      const outputFilename = `generated_${timestamp}.mp4`;
      const outputPath = path.join(config.OUTPUT_PATH, outputFilename);

      // Generate FFmpeg filter string with video duration for animations
      // Style already has defaults applied from controller
      const filterString = textOverlay.generateFilterString(quote, style, finalDuration);

      console.log('Starting video processing...');
      console.log('Input video:', video.path);
      console.log('Video duration:', videoDuration, 'seconds');
      console.log('Final duration:', finalDuration, 'seconds');
      if (musicFile) {
        console.log('Background music:', musicFile.path);
      }
      console.log('Output path:', outputPath);
      console.log('Filter string:', filterString);

      // Create FFmpeg command
      const command = ffmpeg(video.path);

      // Add music input if provided
      if (musicFile) {
        command.input(musicFile.path);
      }

      // Set duration limit
      command.duration(finalDuration);

      // Configure filters
      if (musicFile) {
        // Use complex filter for both video text overlay and audio mixing
        if (videoInfo.hasAudio) {
          // Video has audio - mix it with background music
          command.complexFilter([
            // Apply text overlay to video
            `[0:v]${filterString}[v]`,
            // Scale down music volume
            '[1:a]volume=0.3[music]',
            // Mix both audio streams
            '[0:a][music]amix=inputs=2:duration=shortest[a]'
          ]);
          command.outputOptions('-map', '[v]', '-map', '[a]');
        } else {
          // Video has no audio - just use background music
          command.complexFilter([
            // Apply text overlay to video
            `[0:v]${filterString}[v]`,
            // Use music as audio track
            '[1:a]volume=0.3[a]'
          ]);
          command.outputOptions('-map', '[v]', '-map', '[a]');
        }
      } else {
        // Just apply video filter for text overlay
        command.videoFilter(filterString);
      }

      command
        .audioCodec('aac')
        .videoCodec('libx264')
        .outputOptions([
          '-crf 23',  // Quality setting
          '-movflags +faststart',  // Enable streaming
          '-shortest'  // Stop at shortest stream
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('stderr', (stderrLine) => {
          console.log('FFmpeg stderr:', stderrLine);
        })
        .on('progress', (progress) => {
          console.log(`Processing: ${Math.round(progress.percent || 0)}% done`);
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
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
        resolve({
          duration: metadata.format.duration,
          resolution: `${videoStream.width}x${videoStream.height}`,
          codec: videoStream.codec_name,
          hasAudio: !!audioStream
        });
      }
    });
  });
};

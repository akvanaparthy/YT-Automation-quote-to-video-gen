/**
 * Remotion Video Processor
 * Uses Remotion programmatic API for clean text rendering without FFmpeg glyph issues
 */

const path = require('path');
const fs = require('fs').promises;
const config = require('../config/config');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');

// Remotion project directory
const remotionDir = path.join(__dirname, '../../remotion');

// Ensure output directory exists
const fsSync = require('fs');
if (!fsSync.existsSync(config.OUTPUT_PATH)) {
  fsSync.mkdirSync(config.OUTPUT_PATH, { recursive: true });
}

exports.processVideo = async (video, quote, subtitle, style, subtitleStyle, musicFile = null, maxDuration = null) => {
  try {
    // Prepare output filename
    const timestamp = Date.now();
    const outputFilename = `generated_${timestamp}.mp4`;
    const outputPath = path.join(config.OUTPUT_PATH, outputFilename);

    console.log('Starting Remotion video processing...');
    console.log('Input video:', video.path);
    console.log('Quote:', quote);
    if (subtitle) console.log('Subtitle:', subtitle);
    console.log('Output path:', outputPath);

    // Create public directory in remotion if it doesn't exist
    const publicDir = path.join(remotionDir, 'public');
    if (!fsSync.existsSync(publicDir)) {
      fsSync.mkdirSync(publicDir, { recursive: true });
    }

    // Copy video and music to remotion public directory
    const videoDestName = `video_${timestamp}.mp4`;
    const videoDestPath = path.join(publicDir, videoDestName);
    await fs.copyFile(video.path, videoDestPath);

    let musicDestName = null;
    if (musicFile) {
      musicDestName = `music_${timestamp}.mp3`;
      const musicDestPath = path.join(publicDir, musicDestName);
      await fs.copyFile(musicFile.path, musicDestPath);
    }

    // Get video duration
    const videoInfo = await getVideoInfo(video.path);
    const finalDuration = maxDuration && maxDuration < videoInfo.duration 
      ? maxDuration 
      : videoInfo.duration;

    const durationInFrames = Math.floor(finalDuration * 30); // 30 fps

    // Prepare input props with simple filenames (staticFile will look in public/)
    const inputProps = {
      quote,
      subtitle,
      videoSrc: videoDestName,
      musicSrc: musicDestName,
      style,
      subtitleStyle
    };
    
    console.log('Bundling Remotion project...');
    
    // Bundle the Remotion project
    const bundleLocation = await bundle({
      entryPoint: path.join(remotionDir, 'src/index.ts'),
      onProgress: ({ progress }) => {
        if (progress % 20 === 0) {
          console.log(`Bundling: ${(progress * 100).toFixed(0)}%`);
        }
      },
    });

    console.log('Bundle created at:', bundleLocation);
    console.log('Selecting composition...');

    // Select the composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'QuoteVideo',
      inputProps,
    });

    console.log('Composition selected:', composition.id);
    console.log('Rendering video...');

    // Render the video
    await renderMedia({
      composition: {
        ...composition,
        durationInFrames,
      },
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: path.resolve(outputPath),
      inputProps,
      concurrency: 4, // Parallel rendering
      frameRange: [0, durationInFrames - 1], // 0-indexed, so last frame is durationInFrames - 1
      everyNthFrame: 1,
      numberOfGifLoops: null,
      onProgress: ({ progress, renderedFrames, encodedFrames }) => {
        if (renderedFrames % 30 === 0) {
          console.log(`Rendering: ${(progress * 100).toFixed(1)}% (${renderedFrames}/${durationInFrames} frames)`);
        }
      },
    });

    console.log(`Video processed successfully: ${outputPath}`);

    // Clean up temporary files from public directory
    try {
      await fs.unlink(videoDestPath);
      if (musicDestName) {
        await fs.unlink(path.join(publicDir, musicDestName));
      }
    } catch (cleanupErr) {
      console.error('Cleanup error:', cleanupErr);
    }

    // Schedule cleanup if enabled
    if (config.OUTPUT_CLEANUP_ENABLED) {
      setTimeout(() => {
        fs.unlink(outputPath).catch(err => console.error('Cleanup error:', err));
      }, config.OUTPUT_CLEANUP_TIME);
    }

    return outputPath;

  } catch (err) {
    console.error('Remotion processing error:', err);
    throw err;
  }
};

// Get video information (reuse from existing videoProcessor)
const ffmpeg = require('fluent-ffmpeg');

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

const getVideoInfo = exports.getVideoInfo;

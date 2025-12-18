/**
 * Remotion Video Processor
 * Uses Remotion programmatic API for clean text rendering without FFmpeg glyph issues
 */

const path = require('path');
const fs = require('fs').promises;
const config = require('../config/config');
const cloudinaryService = require('./cloudinaryService');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');

// Remotion project directory
const remotionDir = path.join(__dirname, '../../remotion');

// Cache for bundled Remotion project (reused across all renders)
let cachedBundleLocation = null;

/**
 * Get or create the Remotion bundle (cached for performance)
 */
async function getBundleLocation() {
  if (!cachedBundleLocation) {
    console.log('Creating Remotion bundle (first time only)...');
    
    // Ensure public directory exists before bundling
    const publicDir = path.join(remotionDir, 'public');
    const fsSync = require('fs');
    if (!fsSync.existsSync(publicDir)) {
      fsSync.mkdirSync(publicDir, { recursive: true });
    }
    
    cachedBundleLocation = await bundle({
      entryPoint: path.join(remotionDir, 'src/index.ts'),
      // Configure webpack to copy public directory to bundle location
      webpackOverride: (config) => {
        return {
          ...config,
          resolve: {
            ...config.resolve,
            alias: {
              ...config.resolve?.alias,
              '@public': publicDir
            }
          }
        };
      },
      onProgress: ({ progress }) => {
        if (progress % 20 === 0) {
          console.log(`Bundling: ${(progress * 100).toFixed(0)}%`);
        }
      },
    });
    console.log('✓ Bundle cached at:', cachedBundleLocation);
  }
  return cachedBundleLocation;
}

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
    // (Required: Remotion's bundle server can only access files in public/)
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
    
    // Get cached bundle (or create if first time)
    const bundleLocation = await getBundleLocation();
    console.log('Selecting composition...');

    // Select the composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'QuoteVideo',
      inputProps,
    });

    console.log('Composition selected:', composition.id);
    console.log('Rendering video...');

    // Determine optimal concurrency (increased from 2 to 6 for better performance)
    const os = require('os');
    const cpuCount = os.cpus().length;
    const optimalConcurrency = Math.min(cpuCount, 6);

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
      concurrency: optimalConcurrency,
      jpegQuality: config.VIDEO_QUALITY, // Renamed from 'quality' (default: 95 for high clarity)
      pixelFormat: 'yuv420p', // Better compatibility
      frameRange: [0, durationInFrames - 1],
      everyNthFrame: 1,
      numberOfGifLoops: null,
      onProgress: ({ progress, renderedFrames, encodedFrames }) => {
        // Log every 10% progress to reduce noise
        const progressPercent = Math.floor(progress * 100);
        if (progressPercent % 10 === 0 && renderedFrames > 0) {
          console.log(`Rendering: ${progressPercent}% (${renderedFrames}/${durationInFrames} frames)`);
        }
      },
    });

    console.log(`Video processed successfully: ${outputPath}`);

    // Upload to Cloudinary
    console.log('Uploading to Cloudinary...');
    const cloudinaryResult = await cloudinaryService.uploadVideo(
      outputPath,
      'output',
      outputFilename
    );
    console.log(`✓ Uploaded to Cloudinary: ${cloudinaryResult.secure_url}`);

    // Clean up temporary files from public directory after a delay
    // (Give the bundle server time to finish serving if needed)
    setTimeout(async () => {
      try {
        await fs.unlink(videoDestPath);
        if (musicDestName) {
          await fs.unlink(path.join(publicDir, musicDestName));
        }
        console.log('✓ Cleaned up public directory files');
      } catch (cleanupErr) {
        // Ignore cleanup errors (file might not exist)
      }
    }, 5000); // Delay 5 seconds

    // Clean up local output file after upload
    try {
      await fs.unlink(outputPath);
      console.log('✓ Cleaned up local file');
    } catch (cleanupErr) {
      console.error('Local cleanup error:', cleanupErr);
    }

    // Return Cloudinary result
    return {
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
      filename: outputFilename,
      duration: finalDuration,
      format: cloudinaryResult.format,
      bytes: cloudinaryResult.bytes
    };

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

import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(6); // Optimized for better performance
// Quality is set dynamically in videoProcessorRemotion.js based on VIDEO_QUALITY env var
Config.setChromiumDisableWebSecurity(true);
Config.setChromiumHeadlessMode(true);
Config.setPixelFormat('yuv420p'); // Better compatibility

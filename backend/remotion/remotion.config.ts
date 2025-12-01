import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(4); // Increased for faster rendering
Config.setQuality(80); // Reduce quality slightly for speed
Config.setChromiumDisableWebSecurity(true);
Config.setChromiumHeadlessMode(true);

/**
 * Sync Controller
 * Handles Drive sync API endpoints
 */

const driveSyncService = require('../services/driveSyncService');

// Trigger manual sync
exports.triggerSync = async (req, res, next) => {
  try {
    const config = driveSyncService.getDriveConfig();
    
    if (!config.videosFolder && !config.musicFolder) {
      return res.status(400).json({
        success: false,
        error: 'Drive sync not configured. Please set DRIVE_VIDEOS_FOLDER and DRIVE_MUSIC_FOLDER in environment variables.'
      });
    }
    
    const results = await driveSyncService.performSync(
      config.videosFolder,
      config.musicFolder
    );
    
    res.json({
      success: true,
      message: 'Sync completed',
      results
    });
  } catch (err) {
    next(err);
  }
};

// Get sync status and configuration
exports.getSyncStatus = async (req, res, next) => {
  try {
    const config = driveSyncService.getDriveConfig();
    
    res.json({
      success: true,
      configured: !!(config.videosFolder || config.musicFolder),
      videosFolder: !!config.videosFolder,
      musicFolder: !!config.musicFolder
    });
  } catch (err) {
    next(err);
  }
};

// Update Drive configuration (optional, for dynamic config)
exports.updateDriveConfig = async (req, res, next) => {
  try {
    const { videosLink, musicLink } = req.body;
    
    // This would require updating .env or using a database
    // For now, return error indicating restart needed
    res.status(501).json({
      success: false,
      error: 'Dynamic configuration not yet implemented. Please update .env and restart the server.'
    });
  } catch (err) {
    next(err);
  }
};

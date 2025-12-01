/**
 * Sync Routes
 * API routes for Drive sync operations
 */

const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');

// POST /api/sync - Trigger manual sync
router.post('/sync', syncController.triggerSync);

// GET /api/sync/status - Get sync configuration status
router.get('/sync/status', syncController.getSyncStatus);

// PUT /api/sync/config - Update Drive configuration (future feature)
router.put('/sync/config', syncController.updateDriveConfig);

module.exports = router;

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const config = require('./src/config/config');
const driveSyncService = require('./src/services/driveSyncService');

const app = express();

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api', require('./src/routes/video.routes'));
app.use('/api', require('./src/routes/upload.routes'));
app.use('/api', require('./src/routes/sync.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

const PORT = config.PORT;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  
  // Initialize Drive sync
  await driveSyncService.initializeSync();
});

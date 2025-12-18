const express = require('express');
const cors = require('cors');
require('dotenv').config();

const config = require('./src/config/config');
const cloudinarySyncService = require('./src/services/cloudinarySyncService');

// Validate required environment variables
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Error: Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease set these in your .env file or environment.');
  process.exit(1);
}

console.log('✓ Environment variables validated');

const app = express();

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Comprehensive health check
app.get('/api/health', async (req, res) => {
  const cloudinary = require('cloudinary').v2;
  const os = require('os');
  
  const checks = {
    server: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      free: Math.round(os.freemem() / 1024 / 1024)
    },
    cloudinary: false
  };

  // Check Cloudinary connection
  try {
    await cloudinary.api.ping();
    checks.cloudinary = true;
  } catch (err) {
    checks.cloudinaryError = err.message;
  }

  const healthy = checks.server && checks.cloudinary;
  
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    checks
  });
});

// Routes
app.use('/api', require('./src/routes/video.routes'));
app.use('/api', require('./src/routes/upload.routes'));

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
  
  // Initialize Cloudinary sync
  await cloudinarySyncService.initializeSync();
});

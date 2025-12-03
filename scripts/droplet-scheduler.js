/**
 * DigitalOcean Droplet Scheduler
 * Automatically starts/stops your droplet at scheduled times
 * Saves 75% on hosting costs by running only when needed
 * 
 * Setup:
 * 1. Get API token: https://cloud.digitalocean.com/account/api/tokens
 * 2. Install: npm install node-cron axios
 * 3. Set environment variables
 * 4. Run: node droplet-scheduler.js
 */

const cron = require('node-cron');
const axios = require('axios');

// Configuration
const config = {
  apiToken: process.env.DO_API_TOKEN, // DigitalOcean API token
  dropletId: process.env.DO_DROPLET_ID, // Your droplet ID
  timezone: 'Asia/Kolkata' // Adjust to your timezone
};

const api = axios.create({
  baseURL: 'https://api.digitalocean.com/v2',
  headers: {
    'Authorization': `Bearer ${config.apiToken}`,
    'Content-Type': 'application/json'
  }
});

// Start droplet
async function startDroplet() {
  try {
    console.log(`[${new Date().toISOString()}] Starting droplet ${config.dropletId}...`);
    await api.post(`/droplets/${config.dropletId}/actions`, {
      type: 'power_on'
    });
    console.log('✓ Droplet started successfully');
    
    // Wait for droplet to be ready
    await waitForDroplet('active', 120);
    console.log('✓ Droplet is ready');
  } catch (error) {
    console.error('✗ Failed to start droplet:', error.response?.data || error.message);
  }
}

// Stop droplet
async function stopDroplet() {
  try {
    console.log(`[${new Date().toISOString()}] Stopping droplet ${config.dropletId}...`);
    await api.post(`/droplets/${config.dropletId}/actions`, {
      type: 'power_off'
    });
    console.log('✓ Droplet stopped successfully');
  } catch (error) {
    console.error('✗ Failed to stop droplet:', error.response?.data || error.message);
  }
}

// Check droplet status
async function getDropletStatus() {
  try {
    const response = await api.get(`/droplets/${config.dropletId}`);
    return response.data.droplet.status;
  } catch (error) {
    console.error('✗ Failed to get droplet status:', error.response?.data || error.message);
    return null;
  }
}

// Wait for droplet to reach desired status
async function waitForDroplet(desiredStatus, timeoutSeconds = 60) {
  const startTime = Date.now();
  while (true) {
    const status = await getDropletStatus();
    if (status === desiredStatus) {
      return true;
    }
    
    if ((Date.now() - startTime) / 1000 > timeoutSeconds) {
      throw new Error(`Timeout waiting for droplet to reach ${desiredStatus} status`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
  }
}

// Schedule: Morning (7 AM - 9 AM)
cron.schedule('0 7 * * *', () => {
  console.log('\n=== Morning session starting ===');
  startDroplet();
}, {
  timezone: config.timezone
});

cron.schedule('0 9 * * *', () => {
  console.log('\n=== Morning session ending ===');
  stopDroplet();
}, {
  timezone: config.timezone
});

// Schedule: Afternoon (1 PM - 3 PM)
cron.schedule('0 13 * * *', () => {
  console.log('\n=== Afternoon session starting ===');
  startDroplet();
}, {
  timezone: config.timezone
});

cron.schedule('0 15 * * *', () => {
  console.log('\n=== Afternoon session ending ===');
  stopDroplet();
}, {
  timezone: config.timezone
});

// Schedule: Evening (7 PM - 9 PM)
cron.schedule('0 19 * * *', () => {
  console.log('\n=== Evening session starting ===');
  startDroplet();
}, {
  timezone: config.timezone
});

cron.schedule('0 21 * * *', () => {
  console.log('\n=== Evening session ending ===');
  stopDroplet();
}, {
  timezone: config.timezone
});

// Initial status check
(async () => {
  console.log('🚀 Droplet Scheduler Started');
  console.log('Schedule:');
  console.log('  Morning:   7:00 AM - 9:00 AM');
  console.log('  Afternoon: 1:00 PM - 3:00 PM');
  console.log('  Evening:   7:00 PM - 9:00 PM');
  console.log(`Timezone: ${config.timezone}\n`);
  
  const status = await getDropletStatus();
  console.log(`Current droplet status: ${status}\n`);
})();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nScheduler stopping...');
  process.exit(0);
});

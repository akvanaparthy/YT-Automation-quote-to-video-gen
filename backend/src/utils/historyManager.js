/**
 * History Manager
 * Manages video generation history
 */

const fs = require('fs').promises;
const path = require('path');

const HISTORY_FILE = path.join(process.cwd(), 'storage', 'history.json');

// Initialize history file if it doesn't exist
const initHistoryFile = async () => {
  try {
    await fs.access(HISTORY_FILE);
  } catch (err) {
    // File doesn't exist, create it
    await fs.writeFile(HISTORY_FILE, JSON.stringify({ history: [] }, null, 2));
  }
};

// Add entry to history
exports.addHistoryEntry = async (entry) => {
  await initHistoryFile();
  
  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf8');
    const historyData = JSON.parse(data);
    
    historyData.history.push({
      id: entry.videoId,
      videoUsed: entry.videoUsed,
      musicUsed: entry.musicUsed || 'None',
      dateTime: new Date().toISOString(),
      duration: entry.duration,
      autoDelete: entry.autoDelete
    });
    
    await fs.writeFile(HISTORY_FILE, JSON.stringify(historyData, null, 2));
    return true;
  } catch (err) {
    console.error('Error adding history entry:', err);
    throw err;
  }
};

// Get all history
exports.getHistory = async () => {
  await initHistoryFile();
  
  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf8');
    const historyData = JSON.parse(data);
    return historyData.history;
  } catch (err) {
    console.error('Error reading history:', err);
    return [];
  }
};

// Clear history
exports.clearHistory = async () => {
  try {
    await fs.writeFile(HISTORY_FILE, JSON.stringify({ history: [] }, null, 2));
    return true;
  } catch (err) {
    console.error('Error clearing history:', err);
    throw err;
  }
};

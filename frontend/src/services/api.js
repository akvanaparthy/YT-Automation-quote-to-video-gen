/**
 * API Service
 * Handles all API calls to the backend
 */

import axios from 'axios';

// Determine API base URL based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000 // 30 second timeout
});

// List available videos
export const listVideos = async () => {
  const response = await apiClient.get('/videos');
  return response.data;
};

// Get available fonts
export const getAvailableFonts = async () => {
  const response = await apiClient.get('/fonts');
  return response.data;
};

// Get available animations
export const getAvailableAnimations = async () => {
  const response = await apiClient.get('/animations');
  return response.data;
};

// Get generation history
export const getHistory = async () => {
  const response = await apiClient.get('/history');
  return response.data;
};

// Clear generation history
export const clearHistory = async () => {
  const response = await apiClient.delete('/history');
  return response.data;
};

// Generate video with quote
export const generateVideo = async (quote, style, options = {}) => {
  const response = await apiClient.post('/videos/generate', {
    quote,
    style,
    maxDuration: options.maxDuration,
    addMusic: options.addMusic !== false,
    autoDelete: options.autoDelete !== false
  });
  return response.data;
};

// Upload video
export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Delete video
export const deleteVideo = async (filename) => {
  const response = await apiClient.delete(`/videos/${filename}`);
  return response.data;
};

// Download video
export const downloadVideo = (videoId) => {
  return `${API_BASE_URL}/videos/download/${videoId}`;
};

export default apiClient;

/**
 * API Service
 * Handles all API calls to the backend
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000 // 30 second timeout
});

// List available videos
export const listVideos = async () => {
  const response = await apiClient.get('/videos');
  return response.data;
};

// Generate video with quote
export const generateVideo = async (quote, style) => {
  const response = await apiClient.post('/videos/generate', {
    quote,
    style
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

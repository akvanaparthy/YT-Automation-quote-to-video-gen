/**
 * Video Selector Component
 * Displays available videos from storage
 */

import { useState, useEffect } from 'react';
import { listVideos } from '../services/api';

export default function VideoSelector() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listVideos();
      setVideos(result.videos || []);
    } catch (err) {
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="video-selector">
      <h3>Available Videos</h3>
      <p className="subtitle">A random video will be selected when you generate</p>

      {loading && <p className="info">Loading videos...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && videos.length === 0 && (
        <p className="info">No videos available</p>
      )}

      {!loading && videos.length > 0 && (
        <div className="video-list">
          {videos.map((video) => (
            <div key={video.id || video.filename} className="video-item">
              <div className="video-info">
                <span className="video-name">{video.filename || video}</span>
                {video.size && <span className="video-size">{video.size}</span>}
              </div>
            </div>
          ))}
          <p className="video-count">{videos.length} video{videos.length !== 1 ? 's' : ''} available</p>
        </div>
      )}
    </div>
  );
}

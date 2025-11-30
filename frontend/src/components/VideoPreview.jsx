/**
 * Video Preview Component
 * Shows generated video and download option
 */

import { downloadVideo } from '../services/api';
import { useState, useEffect, useRef } from 'react';

export default function VideoPreview({ video }) {
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && video) {
      // Force reload the video when video prop changes
      videoRef.current.load();
    }
  }, [video]);

  if (!video) return null;

  // Construct full URL for video source
  const videoUrl = video.downloadUrl.startsWith('http') 
    ? video.downloadUrl 
    : `${window.location.origin}${video.downloadUrl}`;

  const handleError = (e) => {
    console.error('Video load error:', e);
    setError('Failed to load video. Try downloading instead.');
  };

  return (
    <div className="video-preview">
      <h3>Generated Video</h3>
      {error && <p style={{color: 'red', fontSize: '0.9em'}}>{error}</p>}
      <div className="video-container">
        <video 
          ref={videoRef}
          controls 
          width="100%" 
          preload="metadata"
          onError={handleError}
          onLoadedMetadata={() => setError(null)}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <a href={videoUrl} download className="download-btn">
        Download Video
      </a>
      {video.expiresIn && (
        <p style={{marginTop: '10px', fontSize: '0.9em', color: '#666'}}>
          Expires in: {video.expiresIn}
        </p>
      )}
    </div>
  );
}

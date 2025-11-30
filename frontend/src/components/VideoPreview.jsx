/**
 * Video Preview Component
 * Shows generated video and download option
 */

import { downloadVideo } from '../services/api';

export default function VideoPreview({ video }) {
  if (!video) return null;

  return (
    <div className="video-preview">
      <h3>Generated Video</h3>
      <div className="video-container">
        <video controls width="100%">
          <source src={video.downloadUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <a href={video.downloadUrl} download className="download-btn">
        Download Video
      </a>
    </div>
  );
}

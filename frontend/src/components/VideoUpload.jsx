/**
 * Video Upload Component
 * Allows users to upload new video files
 */

import { useState } from 'react';
import { uploadVideo } from '../services/api';

export default function VideoUpload({ onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const result = await uploadVideo(file);
      if (result.success) {
        setError(null);
        onUploadSuccess?.(result);
        e.target.value = ''; // Reset input
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError(err.message || 'Upload error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="video-upload">
      <h3>Upload Video</h3>
      <input
        type="file"
        accept=".mp4,.mov"
        onChange={handleFileChange}
        disabled={loading}
      />
      {loading && <p>Uploading...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

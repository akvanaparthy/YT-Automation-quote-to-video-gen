/**
 * Sync Panel Component
 * Manual trigger for Drive sync with progress feedback
 */

import { useState } from 'react';
import { triggerSync, getSyncStatus } from '../services/api';

export default function SyncPanel() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [error, setError] = useState(null);
  const [configured, setConfigured] = useState(true);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSyncResult(null);

    try {
      const result = await triggerSync();
      
      if (result.success) {
        setSyncResult(result.results);
      } else {
        setError(result.error || 'Sync failed');
        if (result.error?.includes('not configured')) {
          setConfigured(false);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to sync with Drive');
    } finally {
      setSyncing(false);
    }
  };

  const checkStatus = async () => {
    try {
      const status = await getSyncStatus();
      setConfigured(status.configured);
    } catch (err) {
      console.error('Failed to check sync status:', err);
    }
  };

  // Check status on mount
  useState(() => {
    checkStatus();
  }, []);

  return (
    <div className="sync-panel">
      <div className="sync-header">
        <h3>Google Drive Sync</h3>
        {!configured && (
          <span className="status-badge not-configured">Not Configured</span>
        )}
        {configured && (
          <span className="status-badge configured">Configured</span>
        )}
      </div>

      {!configured && (
        <div className="sync-notice">
          <p>Drive sync is not configured. Please set DRIVE_VIDEOS_FOLDER and DRIVE_MUSIC_FOLDER in the backend .env file.</p>
        </div>
      )}

      {configured && (
        <>
          <p className="sync-description">
            Sync videos and music files with Google Drive. Downloads missing files and removes files not in Drive.
          </p>

          <button 
            onClick={handleSync} 
            disabled={syncing}
            className="sync-button"
          >
            {syncing ? (
              <>
                <span className="spinner"></span>
                Syncing...
              </>
            ) : (
              <>
                <span className="sync-icon">🔄</span>
                Sync with Drive
              </>
            )}
          </button>

          {error && (
            <div className="sync-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {syncResult && (
            <div className="sync-results">
              <h4>Sync Complete ✓</h4>
              <p className="sync-duration">Completed in {syncResult.duration}s</p>
              
              <div className="sync-stats">
                <div className="stat-section">
                  <h5>Videos</h5>
                  <ul>
                    <li>Downloaded: <strong>{syncResult.videos.downloaded.length}</strong></li>
                    <li>Deleted: <strong>{syncResult.videos.deleted.length}</strong></li>
                    <li>Skipped: <strong>{syncResult.videos.skipped.length}</strong></li>
                    {syncResult.videos.errors.length > 0 && (
                      <li className="errors">Errors: <strong>{syncResult.videos.errors.length}</strong></li>
                    )}
                  </ul>
                  
                  {syncResult.videos.downloaded.length > 0 && (
                    <details>
                      <summary>Downloaded files</summary>
                      <ul className="file-list">
                        {syncResult.videos.downloaded.map((file, idx) => (
                          <li key={idx}>{file}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                  
                  {syncResult.videos.deleted.length > 0 && (
                    <details>
                      <summary>Deleted files</summary>
                      <ul className="file-list">
                        {syncResult.videos.deleted.map((file, idx) => (
                          <li key={idx}>{file}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>

                <div className="stat-section">
                  <h5>Music</h5>
                  <ul>
                    <li>Downloaded: <strong>{syncResult.music.downloaded.length}</strong></li>
                    <li>Deleted: <strong>{syncResult.music.deleted.length}</strong></li>
                    <li>Skipped: <strong>{syncResult.music.skipped.length}</strong></li>
                    {syncResult.music.errors.length > 0 && (
                      <li className="errors">Errors: <strong>{syncResult.music.errors.length}</strong></li>
                    )}
                  </ul>
                  
                  {syncResult.music.downloaded.length > 0 && (
                    <details>
                      <summary>Downloaded files</summary>
                      <ul className="file-list">
                        {syncResult.music.downloaded.map((file, idx) => (
                          <li key={idx}>{file}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                  
                  {syncResult.music.deleted.length > 0 && (
                    <details>
                      <summary>Deleted files</summary>
                      <ul className="file-list">
                        {syncResult.music.deleted.map((file, idx) => (
                          <li key={idx}>{file}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .sync-panel {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .sync-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .sync-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .status-badge {
          font-size: 12px;
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 600;
        }

        .status-badge.configured {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.not-configured {
          background: #fff3cd;
          color: #856404;
        }

        .sync-notice {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 15px;
        }

        .sync-notice p {
          margin: 0;
          font-size: 14px;
          color: #856404;
        }

        .sync-description {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .sync-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.3s;
        }

        .sync-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .sync-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .sync-icon {
          font-size: 20px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .sync-error {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 12px;
          border-radius: 4px;
          margin-top: 15px;
        }

        .sync-results {
          background: white;
          border: 1px solid #28a745;
          border-radius: 6px;
          padding: 20px;
          margin-top: 20px;
        }

        .sync-results h4 {
          color: #28a745;
          margin: 0 0 10px 0;
        }

        .sync-duration {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .sync-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .stat-section h5 {
          margin: 0 0 10px 0;
          color: #495057;
          font-size: 16px;
        }

        .stat-section ul {
          list-style: none;
          padding: 0;
          margin: 0 0 10px 0;
        }

        .stat-section li {
          padding: 4px 0;
          font-size: 14px;
        }

        .stat-section li.errors {
          color: #dc3545;
        }

        details {
          margin-top: 10px;
          font-size: 14px;
        }

        summary {
          cursor: pointer;
          color: #007bff;
          font-weight: 500;
          padding: 4px 0;
        }

        summary:hover {
          text-decoration: underline;
        }

        .file-list {
          list-style: disc;
          padding-left: 20px;
          margin: 8px 0;
          max-height: 150px;
          overflow-y: auto;
        }

        .file-list li {
          padding: 2px 0;
          color: #495057;
        }
      `}</style>
    </div>
  );
}

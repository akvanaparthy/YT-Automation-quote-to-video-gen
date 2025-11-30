/**
 * App Component
 * Root component that ties together all functionality
 */

import { useState, useEffect } from 'react';
import QuoteInput from './components/QuoteInput';
import StyleCustomizer from './components/StyleCustomizer';
import VideoSelector from './components/VideoUpload';
import VideoPreview from './components/VideoPreview';
import { generateVideo, getHistory } from './services/api';
import './App.css';

function App() {
  const [style, setStyle] = useState({
    fontFamily: 'Arial',
    fontSize: 60,
    fontColor: '#FFFFFF',
    position: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    animation: 'none'
  });
  const [options, setOptions] = useState({
    addMusic: true,
    autoDelete: true,
    maxDuration: null
  });
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Load history on mount
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const result = await getHistory();
      if (result.success) {
        setHistory(result.history);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const handleQuoteSubmit = async (quote) => {
    try {
      setError(null);
      const result = await generateVideo(quote, style, options);
      if (result.success) {
        setGeneratedVideo(result);
        // Reload history
        loadHistory();
      } else {
        setError(result.error || 'Failed to generate video');
      }
    } catch (err) {
      setError(err.message || 'Error generating video');
    }
  };

  const handleStyleChange = (newStyle, newOptions) => {
    setStyle(newStyle);
    if (newOptions) setOptions(newOptions);
  };


  return (
    <div className="app">
      <header className="app-header">
        <h1>Quote to Video Generator</h1>
        <button onClick={() => setShowHistory(!showHistory)} className="history-toggle">
          {showHistory ? 'Hide' : 'Show'} History ({history.length})
        </button>
      </header>

      <main className="app-main">
        <div className="container">
          {error && <div className="error-banner">{error}</div>}

          {showHistory && (
            <div className="history-panel">
              <h3>Generation History</h3>
              {history.length === 0 ? (
                <p>No history yet</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Video Used</th>
                      <th>Music Used</th>
                      <th>Duration</th>
                      <th>Auto-Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice().reverse().map((entry, idx) => (
                      <tr key={idx}>
                        <td>{new Date(entry.dateTime).toLocaleString()}</td>
                        <td>{entry.videoUsed}</td>
                        <td>{entry.musicUsed}</td>
                        <td>{entry.duration}s</td>
                        <td>{entry.autoDelete ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <div className="content-grid">
            <div className="left-panel">
              <QuoteInput onSubmit={handleQuoteSubmit} />
              <StyleCustomizer onChange={handleStyleChange} />
            </div>

            <div className="right-panel">
              <VideoSelector />
              {generatedVideo && (
                <VideoPreview video={generatedVideo} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

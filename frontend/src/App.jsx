/**
 * App Component
 * Root component that ties together all functionality
 */

import { useState } from 'react';
import QuoteInput from './components/QuoteInput';
import StyleCustomizer from './components/StyleCustomizer';
import VideoSelector from './components/VideoUpload';
import VideoPreview from './components/VideoPreview';
import { generateVideo } from './services/api';
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
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [error, setError] = useState(null);

  const handleQuoteSubmit = async (quote) => {
    try {
      setError(null);
      const result = await generateVideo(quote, style);
      if (result.success) {
        setGeneratedVideo(result);
      } else {
        setError(result.error || 'Failed to generate video');
      }
    } catch (err) {
      setError(err.message || 'Error generating video');
    }
  };

  const handleStyleChange = (newStyle) => {
    setStyle(newStyle);
  };


  return (
    <div className="app">
      <header className="app-header">
        <h1>Quote to Video Generator</h1>
      </header>

      <main className="app-main">
        <div className="container">
          {error && <div className="error-banner">{error}</div>}

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

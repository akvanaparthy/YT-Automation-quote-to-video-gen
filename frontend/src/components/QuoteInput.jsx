/**
 * Quote Input Component
 * Form for user to input quote text
 */

import { useState } from 'react';

export default function QuoteInput({ onSubmit }) {
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quote.trim()) return;

    setLoading(true);
    try {
      await onSubmit(quote);
      setQuote('');
    } catch (err) {
      console.error('Error submitting quote:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quote-input">
      <h2>Quote to Video Generator</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Enter your quote here..."
          rows="4"
          maxLength="500"
          disabled={loading}
        />
        <div className="char-count">{quote.length}/500</div>
        <button type="submit" disabled={!quote.trim() || loading}>
          {loading ? 'Generating...' : 'Generate Video'}
        </button>
      </form>
    </div>
  );
}

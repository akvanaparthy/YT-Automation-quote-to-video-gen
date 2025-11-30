/**
 * Text Overlay Service
 * Generates FFmpeg filter strings for text overlays
 */

const path = require('path');

// Generate FFmpeg drawtext filter string
exports.generateFilterString = (quote, style) => {
  // Escape quotes for FFmpeg
  const escapedQuote = quote.replace(/'/g, "\\'").replace(/\n/g, '\\n');

  // Calculate Y position based on placement
  let yPosition = 'h/2 - text_h/2'; // center (default)
  if (style.position === 'top') {
    yPosition = '50'; // top with padding
  } else if (style.position === 'bottom') {
    yPosition = 'h - text_h - 50'; // bottom with padding
  }

  // Build drawtext filter
  let filterStr = `drawtext=text='${escapedQuote}'`;

  // Font settings
  if (style.fontFamily === 'Arial') {
    filterStr += `:fontfile=/Windows/Fonts/arial.ttf`;
  } else if (style.fontFamily === 'Times New Roman') {
    filterStr += `:fontfile=/Windows/Fonts/times.ttf`;
  } else {
    // Default to Arial if font not found
    filterStr += `:fontfile=/Windows/Fonts/arial.ttf`;
  }

  // Font size and color
  filterStr += `:fontsize=${style.fontSize}`;
  filterStr += `:fontcolor=${style.fontColor}`;

  // Position
  filterStr += `:x=(w-text_w)/2:y=${yPosition}`;

  // Text wrapping (word_wrap)
  filterStr += `:word_wrap=1`;
  filterStr += `:line_spacing=10`;

  // Background box for readability
  if (style.backgroundColor) {
    filterStr += `:box=1`;
    filterStr += `:boxcolor=${style.backgroundColor}`;
    filterStr += `:boxborderw=10`;
  }

  return filterStr;
};

// Parse hex color to FFmpeg format
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

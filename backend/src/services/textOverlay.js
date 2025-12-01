/**
 * Text Overlay Service
 * Generates FFmpeg filter strings for text overlays with animations
 */

const path = require('path');

// Available fonts with their paths
const FONT_MAP = {
  'Arial': 'DejaVuSans.ttf',
  'Arial Bold': 'DejaVuSans-Bold.ttf',
  'Times New Roman': 'DejaVuSerif.ttf',
  'Times Bold': 'DejaVuSerif-Bold.ttf',
  'Courier New': 'DejaVuSansMono.ttf',
  'Courier Bold': 'DejaVuSansMono-Bold.ttf',
  'Impact': 'DejaVuSans-Bold.ttf',  // Using Bold as Impact alternative
  'Comic Sans': 'DejaVuSans.ttf',    // Using Sans as Comic alternative
  'Helvetica': 'DejaVuSans.ttf',
  'Georgia': 'DejaVuSerif.ttf'
};

// Sanitize text to remove unsupported Unicode characters
const sanitizeText = (text) => {
  let sanitized = text
    // Replace smart/curly quotes with straight quotes
    .replace(/[\u2018\u2019]/g, "'")  // ' '
    .replace(/[\u201C\u201D]/g, '"')  // " "
    // Replace em-dash and en-dash with regular hyphen
    .replace(/[\u2013\u2014]/g, '-')  // – —
    // Replace ellipsis character with three dots
    .replace(/\u2026/g, '...')  // …
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Replace ALL types of spaces with regular ASCII space
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    // Remove emoji ranges and symbols (but keep basic ASCII and Latin-1)
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Alchemical Symbols
    .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Geometric Shapes Extended
    .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Supplemental Arrows-C
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    // Remove any character that's not basic printable ASCII (32-126) or common Latin-1 (160-255)
    // This is aggressive but ensures only supported characters remain
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
    // Clean up any double spaces
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log('Text after aggressive sanitization:', sanitized);
  console.log('Chars:', Array.from(sanitized).map(c => `${c}(${c.charCodeAt(0)})`).join(' '));
  
  return sanitized;
};

// Generate FFmpeg drawtext filter string with animations
exports.generateFilterString = (quote, style, videoDuration) => {
  console.log('=== TEXT OVERLAY DEBUG ===');
  console.log('Original quote:', quote);
  
  // Sanitize the quote text first
  const sanitizedQuote = sanitizeText(quote);
  console.log('Sanitized quote:', sanitizedQuote);
  
  // Split into words and create multiple drawtext filters
  // This avoids the newline/glyph issue entirely
  const words = sanitizedQuote.split(' ');
  const maxWordsPerLine = 4;  // Adjust based on font size
  const lines = [];
  
  for (let i = 0; i < words.length; i += maxWordsPerLine) {
    lines.push(words.slice(i, i + maxWordsPerLine).join(' '));
  }
  
  console.log('Split into lines:', lines);
  
  // Font settings
  const fontFile = FONT_MAP[style.fontFamily] || 'DejaVuSans.ttf';
  const fontPath = getFontPath(fontFile);
  
  // Calculate animation duration
  const animDuration = videoDuration ? videoDuration / 2 : 2;
  
  // Base Y position
  const { xPos, yPos, alpha } = getAnimationExpression(style.animation, style.position, animDuration);
  
  // Create multiple drawtext filters, one per line
  const lineHeight = style.fontSize + 10;
  const totalHeight = lines.length * lineHeight;
  const startY = style.position === 'top' ? 50 : 
                 style.position === 'bottom' ? `h-${totalHeight}-50` :
                 `(h-${totalHeight})/2`;
  
  const filters = lines.map((line, index) => {
    const escapedLine = line
      .replace(/\\/g, '\\\\\\\\')
      .replace(/'/g, "'\\\\''")
      .replace(/:/g, '\\:');
    
    let filterStr = `drawtext=text='${escapedLine}'`;
    filterStr += `:fontfile=${fontPath}`;
    filterStr += `:fontsize=${style.fontSize}`;
    filterStr += `:fontcolor=${style.fontColor}`;
    filterStr += `:line_spacing=10`;
    filterStr += `:borderw=3:bordercolor=black@0.8`;
    filterStr += `:x=(w-text_w)/2`;
    filterStr += `:y=${startY}+${index * lineHeight}`;
    
    if (alpha) {
      filterStr += `:alpha='${alpha}'`;
    }
    
    if (style.backgroundColor) {
      const boxColor = convertColorToFFmpegFormat(style.backgroundColor);
      filterStr += `:box=1:boxcolor=${boxColor}:boxborderw=10`;
    }
    
    filterStr += `:enable='between(t,0,${videoDuration || 999})'`;
    
    return filterStr;
  });
  
  console.log('Generated filters:', filters);
  
  // Return comma-separated filters
  return filters.join(',');
};

// Wrap text to specified character width, returning array of lines
const wrapTextToLines = (text, maxCharsPerLine) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    if (testLine.length > maxCharsPerLine && currentLine) {
      lines.push(currentLine.trim());  // Trim to remove trailing spaces
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine.trim());  // Trim to remove trailing spaces
  }

  console.log('Wrapped lines:', lines);
  console.log('Lines with char codes:', lines.map(line => 
    Array.from(line).map(c => `${c}(${c.charCodeAt(0)})`).join(' ')
  ));

  return lines;
};

// Get animation expressions for x, y, and alpha
const getAnimationExpression = (animation, position, duration) => {
  // Base positions
  const centerX = '(w-text_w)/2';
  const centerY = '(h-text_h)/2';
  const topY = '50';
  const bottomY = '(h-text_h-50)';

  // Determine base Y position
  let baseY = centerY;
  if (position === 'top') baseY = topY;
  if (position === 'bottom') baseY = bottomY;

  switch (animation) {
    case 'fade-in':
      return {
        xPos: centerX,
        yPos: baseY,
        alpha: `if(lt(t,${duration}),t/${duration},1)`
      };

    case 'fade-out':
      return {
        xPos: centerX,
        yPos: baseY,
        alpha: `if(lt(t,${duration}),1,(2-t/${duration}))`
      };

    case 'slide-in-left':
      return {
        xPos: `if(lt(t,${duration}),-text_w+((w+text_w)*t/${duration}),${centerX})`,
        yPos: baseY,
        alpha: null
      };

    case 'slide-in-right':
      return {
        xPos: `if(lt(t,${duration}),w-((w+text_w)*t/${duration}),${centerX})`,
        yPos: baseY,
        alpha: null
      };

    case 'slide-in-top':
      return {
        xPos: centerX,
        yPos: `if(lt(t,${duration}),-text_h+((h+text_h)*t/${duration}),${baseY})`,
        alpha: null
      };

    case 'slide-in-bottom':
      return {
        xPos: centerX,
        yPos: `if(lt(t,${duration}),h-((h+text_h)*t/${duration}),${baseY})`,
        alpha: null
      };

    case 'zoom-in':
      return {
        xPos: centerX,
        yPos: baseY,
        alpha: `if(lt(t,${duration}),t/${duration},1)`
      };

    case 'bounce-in':
      // Bouncing effect using sine wave
      return {
        xPos: centerX,
        yPos: `if(lt(t,${duration}),${baseY}-abs(sin(t*10))*50*(1-t/${duration}),${baseY})`,
        alpha: `if(lt(t,${duration}),t/${duration},1)`
      };

    case 'typewriter':
      // Shows characters progressively
      return {
        xPos: centerX,
        yPos: baseY,
        alpha: '1'
      };

    case 'pulse':
      // Pulsing scale effect (simulated with alpha)
      return {
        xPos: centerX,
        yPos: baseY,
        alpha: `0.5+0.5*sin(t*3)`
      };

    case 'shake':
      // Shaking effect
      return {
        xPos: `${centerX}+sin(t*20)*10`,
        yPos: `${baseY}+cos(t*20)*10`,
        alpha: null
      };

    case 'rotate-in':
      // FFmpeg doesn't support rotation in drawtext, so we fade instead
      return {
        xPos: centerX,
        yPos: baseY,
        alpha: `if(lt(t,${duration}),t/${duration},1)`
      };

    case 'none':
    default:
      return {
        xPos: centerX,
        yPos: baseY,
        alpha: null
      };
  }
};

// Get font path based on platform
const getFontPath = (fontFile) => {
  const customFontsPath = path.join(process.cwd(), 'storage', 'fonts', fontFile);
  const fs = require('fs');
  
  // Check if custom font exists in storage/fonts
  if (fs.existsSync(customFontsPath)) {
    return customFontsPath;
  }
  
  // Fall back to system fonts
  if (process.platform === 'win32') {
    return `C:\\Windows\\Fonts\\${fontFile}`;
  } else if (process.platform === 'darwin') {
    return `/Library/Fonts/${fontFile}`;
  } else {
    return `/usr/share/fonts/truetype/dejavu/${fontFile}`;
  }
};

// Convert various color formats to FFmpeg-compatible format
const convertColorToFFmpegFormat = (color) => {
  // If it's rgba() format, extract values and convert
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    const r = rgbaMatch[1];
    const g = rgbaMatch[2];
    const b = rgbaMatch[3];
    const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1.0;
    
    // FFmpeg format: 0xRRGGBBAA (hex format)
    const rHex = parseInt(r).toString(16).padStart(2, '0');
    const gHex = parseInt(g).toString(16).padStart(2, '0');
    const bHex = parseInt(b).toString(16).padStart(2, '0');
    const aHex = Math.round(a * 255).toString(16).padStart(2, '0');
    
    return `0x${rHex}${gHex}${bHex}${aHex}`;
  }
  
  // If it's already hex format, ensure it has alpha
  if (color.startsWith('#')) {
    const hex = color.substring(1);
    if (hex.length === 6) {
      return `0x${hex}FF`; // Add full opacity
    }
    if (hex.length === 8) {
      return `0x${hex}`;
    }
  }
  
  // Return as-is if format is unknown
  return color;
};

// Get list of available fonts
exports.getAvailableFonts = () => {
  return Object.keys(FONT_MAP);
};

// Get list of available animations
exports.getAvailableAnimations = () => {
  return [
    'none',
    'fade-in',
    'fade-out',
    'slide-in-left',
    'slide-in-right',
    'slide-in-top',
    'slide-in-bottom',
    'zoom-in',
    'bounce-in',
    'pulse',
    'shake',
    'typewriter',
    'rotate-in'
  ];
};

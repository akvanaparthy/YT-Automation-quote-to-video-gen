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

// Generate FFmpeg drawtext filter string with animations
exports.generateFilterString = (quote, style, videoDuration) => {
  // Escape quotes and special characters for FFmpeg
  const escapedQuote = quote
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n');

  // Calculate animation duration (half of video duration or 2 seconds if duration not provided)
  const animDuration = videoDuration ? videoDuration / 2 : 2;
  
  // Font settings
  const fontFile = FONT_MAP[style.fontFamily] || 'DejaVuSans.ttf';
  const fontPath = getFontPath(fontFile);

  // Build base drawtext filter
  let filterStr = `drawtext=text='${escapedQuote}'`;
  filterStr += `:fontfile=${fontPath}`;
  filterStr += `:fontsize=${style.fontSize}`;
  filterStr += `:fontcolor=${style.fontColor}`;

  // Apply animation
  const { xPos, yPos, alpha } = getAnimationExpression(style.animation, style.position, animDuration);
  
  filterStr += `:x=${xPos}`;
  filterStr += `:y=${yPos}`;
  
  if (alpha) {
    filterStr += `:alpha='${alpha}'`;
  }

  // Background box for readability
  if (style.backgroundColor) {
    const boxColor = convertColorToFFmpegFormat(style.backgroundColor);
    filterStr += `:box=1:boxcolor=${boxColor}:boxborderw=10`;
  }

  // Enable text
  filterStr += `:enable='between(t,0,${videoDuration || 999})'`;

  return filterStr;
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

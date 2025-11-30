/**
 * Validation Middleware
 * Validates request data
 */

// Validate quote generation request
exports.validateGenerateRequest = (req, res, next) => {
  const { quote, style, maxDuration, addMusic } = req.body;

  // Validate quote (MANDATORY)
  if (!quote) {
    return res.status(400).json({
      success: false,
      error: 'Quote is required'
    });
  }

  if (typeof quote !== 'string' || quote.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Quote must be a non-empty string'
    });
  }

  if (quote.length > 500) {
    return res.status(400).json({
      success: false,
      error: 'Quote must be less than 500 characters'
    });
  }

  // Validate style (optional, defaults applied in controller)
  if (style) {
    if (style.fontSize && (typeof style.fontSize !== 'number' || style.fontSize < 10 || style.fontSize > 200)) {
      return res.status(400).json({
        success: false,
        error: 'Font size must be between 10 and 200'
      });
    }

    if (style.position && !['top', 'center', 'bottom'].includes(style.position)) {
      return res.status(400).json({
        success: false,
        error: 'Position must be top, center, or bottom'
      });
    }

    const validAnimations = ['none', 'fade-in', 'fade-out', 'slide-in-left', 'slide-in-right', 'slide-in-top', 'slide-in-bottom', 'zoom-in', 'bounce-in', 'pulse', 'shake', 'typewriter', 'rotate-in'];
    if (style.animation && !validAnimations.includes(style.animation)) {
      return res.status(400).json({
        success: false,
        error: `Animation must be one of: ${validAnimations.join(', ')}`
      });
    }
  }

  // Validate maxDuration (optional)
  if (maxDuration !== undefined && maxDuration !== null) {
    if (typeof maxDuration !== 'number' || maxDuration <= 0 || maxDuration > 300) {
      return res.status(400).json({
        success: false,
        error: 'maxDuration must be a positive number between 1 and 300 seconds'
      });
    }
  }

  // Validate addMusic (optional, defaults to true)
  if (addMusic !== undefined && typeof addMusic !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'addMusic must be a boolean value'
    });
  }

  next();
};

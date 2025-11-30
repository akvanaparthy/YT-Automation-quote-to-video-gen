/**
 * Validation Middleware
 * Validates request data
 */

// Validate quote generation request
exports.validateGenerateRequest = (req, res, next) => {
  const { quote, style } = req.body;

  // Validate quote
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

  // Validate style (optional)
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

    if (style.animation && !['fade', 'slide', 'none'].includes(style.animation)) {
      return res.status(400).json({
        success: false,
        error: 'Animation must be fade, slide, or none'
      });
    }
  }

  next();
};

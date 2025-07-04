const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Check for rate limit error (from express-rate-limit)
  if (err.statusCode === 429) {
    return res.status(429).json({
      status: 'error',
      message: 'Too many requests, please try again later.'
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please log in again.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Your token has expired. Please log in again.'
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      status: 'error',
      message: messages.join(', ')
    });
  }

  // Handle Mongoose CastError (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: 'Resource not found or invalid ID format.'
    });
  }

  // Handle duplicate field error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status: 'error',
      message: `Duplicate field value entered: ${field}. Please use another value.`
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;

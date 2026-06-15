/**
   * Centralized global error handling middleware
   */
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Application Error:', err);

  const statusCode = err.status || 500;
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

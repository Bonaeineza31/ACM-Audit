const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message || 'Unknown Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

export default errorHandler;

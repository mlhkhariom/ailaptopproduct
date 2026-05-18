// ══════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER — catches all unhandled route errors
// No need for try-catch in every route
// ══════════════════════════════════════════════════════════

// Wrap async route handlers to catch errors automatically
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handling middleware (add LAST in Express app)
export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Don't leak stack traces in production
  const isDev = process.env.NODE_ENV !== 'production';

  // Known error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (err.status === 403) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (err.status === 404) {
    return res.status(404).json({ error: 'Not found' });
  }

  // Database errors
  if (err.code === '23505') { // unique violation
    return res.status(409).json({ error: 'Duplicate entry — already exists' });
  }
  if (err.code === '23503') { // foreign key violation
    return res.status(400).json({ error: 'Referenced record not found' });
  }

  // Default 500
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack?.split('\n').slice(0, 3) }),
  });
};

// 404 handler for unknown API routes
export const notFoundHandler = (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
  }
  // For non-API routes, let frontend handle (SPA)
  res.sendFile('index.html', { root: req.app.get('staticPath') || './dist' });
};

import express from 'express';

export function errorMiddleware(err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) {
  console.error('[server] Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    },
  });
}

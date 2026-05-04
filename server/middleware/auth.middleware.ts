import { Request, Response, NextFunction } from 'express';
import { verifyToken, signToken } from '../services/auth.service.js';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; role: string };
    }
  }
}

const REFRESH_THRESHOLD_HOURS = 4;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token expired or invalid' } });
  }

  req.user = { userId: payload.userId, role: payload.role };

  // Sliding refresh: if token expires within threshold, issue new one
  const now = Math.floor(Date.now() / 1000);
  const remainingHours = (payload.exp - now) / 3600;
  if (remainingHours < REFRESH_THRESHOLD_HOURS) {
    const newToken = signToken(payload.userId, payload.role);
    res.setHeader('X-AICS-New-Token', newToken);
  }

  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
    }
    next();
  };
}

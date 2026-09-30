import { auth as betterAuth } from '../auth.js';
import { fromNodeHeaders } from 'better-auth/node';

/**
 * Middleware to validate session using Better Auth
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const session = await betterAuth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Access denied. Invalid or expired session.' });
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (err) {
    console.error('Session verification error:', err);
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
};

export const verifyToken = authMiddleware;

/**
 * Middleware to ensure authenticated user has admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin privileges required.' });
  }
  next();
};

export default authMiddleware;

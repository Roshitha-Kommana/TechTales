import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; name: string };
    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (error) {
    // More detailed error message for debugging
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ error: 'Invalid token', details: error.message });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(403).json({ error: 'Token expired', details: 'Please login again' });
    } else {
      res.status(403).json({ error: 'Invalid or expired token', details: 'Authentication failed' });
    }
  }
};

export const generateToken = (userId: string, email: string, name: string): string => {
  return jwt.sign(
    { userId, email, name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export { JWT_SECRET };



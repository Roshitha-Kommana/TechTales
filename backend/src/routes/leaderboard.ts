import express from 'express';
import { getLeaderboardController } from '../controllers/leaderboardController';
import jwt from 'jsonwebtoken';
import { AuthRequest, JWT_SECRET } from '../middleware/auth';

const router = express.Router();

// Optional auth middleware for leaderboard (allows viewing without login, but highlights current user if logged in)
const optionalAuth = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    if (!JWT_SECRET) throw new Error('JWT_SECRET is missing');
    const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // Just ignore token errors for optional auth
    next();
  }
};

router.get('/', optionalAuth, getLeaderboardController);

export default router;

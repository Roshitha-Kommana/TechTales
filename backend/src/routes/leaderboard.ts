import { Router } from 'express';
import { getLeaderboardController, resetWeeklyLeaderboard } from '../controllers/leaderboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get leaderboard (requires authentication)
router.get('/', authenticateToken, getLeaderboardController);

// Reset weekly leaderboard (typically called by a scheduled job or admin)
// In production, this should be protected with admin authentication
router.post('/reset-weekly', resetWeeklyLeaderboard);

export default router;

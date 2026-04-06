import { Router } from 'express';
import {
  generateQuizController,
  submitQuizController,
  getQuizController,
  getQuizByStoryController,
  getQuizAnalyticsController,
  getComprehensiveAnalyticsController,
} from '../controllers/quizController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Analytics routes must come before /:quizId to avoid route conflicts
router.get('/analytics/comprehensive', authenticateToken, getComprehensiveAnalyticsController);
router.get('/analytics', authenticateToken, getQuizAnalyticsController);
router.get('/analytics/:studentId', authenticateToken, getQuizAnalyticsController);

// Story-specific routes
router.post('/story/:storyId/generate', authenticateToken, generateQuizController);
router.get('/story/:storyId', authenticateToken, getQuizByStoryController);

// Quiz-specific routes (must come after analytics)
router.get('/:quizId', authenticateToken, getQuizController);
router.post('/:quizId/submit', authenticateToken, submitQuizController);

export default router;


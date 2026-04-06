import { Router } from 'express';
import { generateFeedbackController } from '../controllers/feedbackController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/generate', authenticateToken, generateFeedbackController);

export default router;

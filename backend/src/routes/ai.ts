import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { chatWithAI } from '../controllers/aiController';

const router = Router();

router.post('/chat', authenticateToken, chatWithAI);

export default router;

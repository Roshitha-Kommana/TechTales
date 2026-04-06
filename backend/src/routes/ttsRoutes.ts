import express from 'express';
import { generateTTS } from '../controllers/ttsController';

const router = express.Router();

router.post('/speak', generateTTS);

export default router;

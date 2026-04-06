import { Router } from 'express';
import {
  createNoteController,
  getAllNotesController,
  getNoteController,
  updateNoteController,
  deleteNoteController,
} from '../controllers/noteController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, createNoteController);
router.get('/', authenticateToken, getAllNotesController);
router.get('/:id', authenticateToken, getNoteController);
router.put('/:id', authenticateToken, updateNoteController);
router.delete('/:id', authenticateToken, deleteNoteController);

export default router;

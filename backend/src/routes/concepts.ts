import { Router } from 'express';
import {
  getAllConceptsController,
  createConceptController,
} from '../controllers/conceptController';

const router = Router();

router.get('/', getAllConceptsController);
router.post('/', createConceptController);

export default router;



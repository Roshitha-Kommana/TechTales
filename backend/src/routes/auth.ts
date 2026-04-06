import { Router } from 'express';
import {
  signupController,
  loginController,
  getCurrentUserController,
  updateProfileController,
  changePasswordController,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`[Auth Route] ${req.method} ${req.path}`);
  next();
});

router.post('/signup', signupController);
router.post('/login', loginController);
router.get('/me', authenticateToken, getCurrentUserController);
router.put('/profile', authenticateToken, updateProfileController);
router.put('/password', authenticateToken, changePasswordController);

export default router;


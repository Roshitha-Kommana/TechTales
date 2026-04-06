import { Router, Request, Response, NextFunction } from 'express';
import {
  generateStoryController,
  getStoryController,
  generateImagesController,
  getAllStoriesController,
  saveStoryController,
  updateStoryPageController,
  updateStoryPageImageController,
  getShareableLinkController,
  deleteStoryController,
} from '../controllers/storyController';

import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Multer error handler
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    console.error('❌ Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large', message: 'File size must be less than 10MB' });
    }
    if (err.message && err.message.includes('Invalid file type')) {
      return res.status(400).json({ error: 'Invalid file type', message: err.message });
    }
    return res.status(400).json({ error: 'File upload error', message: err.message || 'Unknown error' });
  }
  next();
};

// Optional file upload middleware - handles both JSON and FormData
const optionalFileUpload = (req: Request, res: Response, next: NextFunction) => {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    // Use multer for multipart requests
    upload.single('sourceFile')(req, res, (err: any) => {
      if (err) {
        // Handle multer errors
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  } else {
    // Skip multer for JSON requests - body parser will handle it
    next();
  }
};

router.post('/generate', authenticateToken, optionalFileUpload, generateStoryController);
router.get('/', authenticateToken, getAllStoriesController);
router.get('/:id', authenticateToken, getStoryController);
router.post('/:id/images', authenticateToken, generateImagesController);
router.post('/:id/save', authenticateToken, saveStoryController);
router.put('/:id/pages/:pageNumber', authenticateToken, updateStoryPageController);
router.put('/:id/pages/:pageNumber/image', authenticateToken, upload.single('image'), updateStoryPageImageController);
router.get('/:id/share', authenticateToken, getShareableLinkController);
router.delete('/:id', authenticateToken, deleteStoryController);

export default router;



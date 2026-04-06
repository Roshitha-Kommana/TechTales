import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// File filter to accept only specific file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed MIME types
  const allowedMimes = [
    'application/pdf', // PDF
    'image/png', // PNG images
    'image/jpeg', // JPEG images
    'image/jpg', // JPG images
    'text/plain', // Text files
    'text/markdown', // Markdown files
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: PDF, PNG, JPG, JPEG, TXT, MD`));
  }
};

// Configure multer with file size limit (10MB)
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware for optional single file upload
// This will not error if no file is provided
export const uploadOptional = (req: Request, res: Response, next: NextFunction) => {
  upload.single('sourceFile')(req, res, (err: any) => {
    // If error is "no file" or "field missing", ignore it (file is optional)
    if (err && err.code === 'LIMIT_UNEXPECTED_FILE') {
      // Multiple files or unexpected field - this is fine for optional uploads
      return next();
    }
    if (err && err.message && err.message.includes('Unexpected field')) {
      // Unexpected field - ignore for optional uploads
      return next();
    }
    // Pass through other errors
    if (err) {
      return next(err);
    }
    next();
  });
};

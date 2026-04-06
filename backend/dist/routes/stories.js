"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storyController_1 = require("../controllers/storyController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Multer error handler
const handleMulterError = (err, req, res, next) => {
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
const optionalFileUpload = (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        // Use multer for multipart requests
        upload_1.upload.single('sourceFile')(req, res, (err) => {
            if (err) {
                // Handle multer errors
                return handleMulterError(err, req, res, next);
            }
            next();
        });
    }
    else {
        // Skip multer for JSON requests - body parser will handle it
        next();
    }
};
router.post('/generate', auth_1.authenticateToken, optionalFileUpload, storyController_1.generateStoryController);
router.get('/', auth_1.authenticateToken, storyController_1.getAllStoriesController);
router.get('/:id', auth_1.authenticateToken, storyController_1.getStoryController);
router.post('/:id/images', auth_1.authenticateToken, storyController_1.generateImagesController);
router.post('/:id/save', auth_1.authenticateToken, storyController_1.saveStoryController);
router.put('/:id/pages/:pageNumber', auth_1.authenticateToken, storyController_1.updateStoryPageController);
router.put('/:id/pages/:pageNumber/image', auth_1.authenticateToken, upload_1.upload.single('image'), storyController_1.updateStoryPageImageController);
router.get('/:id/share', auth_1.authenticateToken, storyController_1.getShareableLinkController);
router.delete('/:id', auth_1.authenticateToken, storyController_1.deleteStoryController);
exports.default = router;
//# sourceMappingURL=stories.js.map
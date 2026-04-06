"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadOptional = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// Configure multer to store files in memory
const storage = multer_1.default.memoryStorage();
// File filter to accept only specific file types
const fileFilter = (req, file, cb) => {
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
    }
    else {
        cb(new Error(`Invalid file type. Allowed types: PDF, PNG, JPG, JPEG, TXT, MD`));
    }
};
// Configure multer with file size limit (10MB)
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
// Middleware for optional single file upload
// This will not error if no file is provided
const uploadOptional = (req, res, next) => {
    exports.upload.single('sourceFile')(req, res, (err) => {
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
exports.uploadOptional = uploadOptional;
//# sourceMappingURL=upload.js.map
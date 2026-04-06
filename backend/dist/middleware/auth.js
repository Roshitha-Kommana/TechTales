"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.generateToken = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
exports.JWT_SECRET = JWT_SECRET;
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            name: decoded.name,
        };
        next();
    }
    catch (error) {
        // More detailed error message for debugging
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(403).json({ error: 'Invalid token', details: error.message });
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(403).json({ error: 'Token expired', details: 'Please login again' });
        }
        else {
            res.status(403).json({ error: 'Invalid or expired token', details: 'Authentication failed' });
        }
    }
};
exports.authenticateToken = authenticateToken;
const generateToken = (userId, email, name) => {
    return jsonwebtoken_1.default.sign({ userId, email, name }, JWT_SECRET, { expiresIn: '7d' });
};
exports.generateToken = generateToken;
//# sourceMappingURL=auth.js.map
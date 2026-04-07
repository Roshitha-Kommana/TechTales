"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const stories_1 = __importDefault(require("./routes/stories"));
const concepts_1 = __importDefault(require("./routes/concepts"));
const images_1 = __importDefault(require("./routes/images"));
const quizzes_1 = __importDefault(require("./routes/quizzes"));
const auth_1 = __importDefault(require("./routes/auth"));
const ai_1 = __importDefault(require("./routes/ai"));
const notes_1 = __importDefault(require("./routes/notes"));
const feedback_1 = __importDefault(require("./routes/feedback"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
const ttsRoutes_1 = __importDefault(require("./routes/ttsRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
/**
 * Configure CORS allowed origins
 * Development: Allow localhost ports 3000 and 3001
 * Production: Allow specific frontend URLs from environment variables
 */
const getAllowedOrigins = () => {
    const producationOrigins = [];
    // Production frontend URLs from environment variables
    if (process.env.FRONTEND_URL) {
        producationOrigins.push(process.env.FRONTEND_URL);
    }
    if (process.env.VERCEL_URL) {
        producationOrigins.push(`https://${process.env.VERCEL_URL}`);
    }
    // Development origins (always allowed for local development)
    const developmentOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
    ];
    if (NODE_ENV === 'production') {
        return producationOrigins.length > 0 ? producationOrigins : developmentOrigins;
    }
    // In development, allow both development and production origins
    return [...developmentOrigins, ...producationOrigins];
};
const allowedOrigins = getAllowedOrigins();
console.log(`🔒 CORS Configuration (${NODE_ENV}):`, allowedOrigins);
/**
 * CORS Middleware Configuration
 * - Allows specified origins only (no '*' in production)
 * - Enables credentials (cookies, authorization headers)
 * - Handles preflight requests (OPTIONS)
 * - Allows common headers and methods
 */
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.warn(`❌ CORS rejected request from origin: ${origin}`);
        return callback(new Error('CORS policy: Origin not allowed'));
    },
    credentials: true, // Important: Allows cookies and authorization headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // Preflight cache time (24 hours)
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Debug: Log all incoming requests
app.use((req, res, next) => {
    console.log(`[Server] ${req.method} ${req.path}`);
    next();
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Tech Tales API is running' });
});
// API Routes - Auth routes first
app.use('/api/auth', auth_1.default);
console.log('✅ Auth routes registered: /api/auth/login, /api/auth/signup, /api/auth/me');
app.use('/api/stories', stories_1.default);
app.use('/api/concepts', concepts_1.default);
app.use('/api/images', images_1.default);
app.use('/api/quizzes', quizzes_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/notes', notes_1.default);
app.use('/api/feedback', feedback_1.default);
app.use('/api/leaderboard', leaderboard_1.default);
app.use('/api/tts', ttsRoutes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Start server
const startServer = async () => {
    try {
        // Connect to database but don't wait
        (0, database_1.connectDatabase)().catch((error) => {
            console.error('⚠️  Database connection error (server will continue):', error.message);
        });
        // Wait a bit for DB connection attempt before starting HTTP server
        await new Promise(resolve => setTimeout(resolve, 500));
        // Start server
        return new Promise((resolve, reject) => {
            const server = app.listen(PORT, () => {
                console.log(`🚀 Server running on http://localhost:${PORT}`);
                console.log(`📚 API endpoints available at http://localhost:${PORT}/api`);
                console.log(`💡 Health check: http://localhost:${PORT}/health`);
                resolve();
            });
            server.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    console.error(`❌ Port ${PORT} is already in use`);
                }
                else {
                    console.error('Server error:', error);
                }
                reject(error);
            });
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map
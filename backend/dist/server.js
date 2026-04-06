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
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
// Middleware - Allow both port 3000 and 3001 for CORS
const allowedOrigins = [FRONTEND_URL, 'http://localhost:3001', 'http://localhost:3000'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
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
    res.json({ status: 'ok', message: 'StoryWizard API is running' });
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
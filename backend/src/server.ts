import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import storyRoutes from './routes/stories';
import conceptRoutes from './routes/concepts';
import imageRoutes from './routes/images';
import quizRoutes from './routes/quizzes';
import authRoutes from './routes/auth';
import aiRoutes from './routes/ai';
import noteRoutes from './routes/notes';
import feedbackRoutes from './routes/feedback';
import leaderboardRoutes from './routes/leaderboard';
import ttsRoutes from './routes/ttsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware - Allow both port 3000 and 3001 for CORS
const allowedOrigins = [FRONTEND_URL, 'http://localhost:3001', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes registered: /api/auth/login, /api/auth/signup, /api/auth/me');
app.use('/api/stories', storyRoutes);
app.use('/api/concepts', conceptRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/tts', ttsRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    connectDatabase().catch((error) => {
      console.error('⚠️  Database connection error (server will continue):', error.message);
    });

    // Wait a bit for DB connection attempt before starting HTTP server
    await new Promise(resolve => setTimeout(resolve, 500));

    // Start server
    return new Promise<void>((resolve, reject) => {
      const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📚 API endpoints available at http://localhost:${PORT}/api`);
        console.log(`💡 Health check: http://localhost:${PORT}/health`);
        resolve();
      });

      server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ Port ${PORT} is already in use`);
        } else {
          console.error('Server error:', error);
        }
        reject(error);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


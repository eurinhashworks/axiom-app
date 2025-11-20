import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ideasRoutes from './routes/ideas.routes.js';
import analysisRoutes from './routes/analysis.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// API Routes
app.use('/api/v1/ideas', ideasRoutes);
app.use('/api/v1/analysis', analysisRoutes);
app.use('/api/v1/projects', projectsRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server (only if not on Vercel)
// Vercel handles the server automatically, so we don't call listen() in production
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend API server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
} else {
  console.log('🚀 Backend API server ready for Vercel deployment');
}

export default app;


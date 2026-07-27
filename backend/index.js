import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

import assessmentRoutes from './routes/assessmentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

app.set('trust proxy', 1); // Fixes express-rate-limit error on cloud providers

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Ensure DB is connected before handling any API requests
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// API Routes
app.use('/api/assessments', assessmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root route for Render health checks
app.get('/', (req, res) => {
  res.json({ message: 'AC Mobility API is running' });
});

// Error Handling Middleware
app.use(errorHandler);

// Initialize DB and start server (Only if not running on Vercel Serverless)
if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
  const startServer = async () => {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  };
  startServer();
}

// Export for Vercel Serverless Functions
export default app;

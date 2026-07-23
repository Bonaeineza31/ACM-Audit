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
import initDb from './seeds/initDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
const allowedOrigins = ['http://localhost:5173', 'https://acm-audit.vercel.app'];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

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

// Initialize DB and start server
const startServer = async () => {
  await initDb();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();

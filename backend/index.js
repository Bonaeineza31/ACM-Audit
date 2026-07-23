const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const assessmentRoutes = require('./routes/assessmentRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');
const initDb = require('./seeds/initDb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/assessments', assessmentRoutes);
app.use('/api/auth', authRoutes);

// Serve static frontend files (if built)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all route for SPA to prevent 404 on reload
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
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

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const assessmentRoutes = require('./routes/assessmentRoutes');
const errorHandler = require('./middlewares/errorHandler');
const initDb = require('./seeds/initDb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/assessments', assessmentRoutes);

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

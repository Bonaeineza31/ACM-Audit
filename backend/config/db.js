const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'afc_assessment',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Test DB Connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL successfully'))
  .catch(err => console.error('Error connecting to PostgreSQL', err));

module.exports = pool;

import pool from './config/db.js';

async function updateDb() {
  try {
    await pool.query('ALTER TABLE magic_links ADD COLUMN used BOOLEAN DEFAULT FALSE;');
    console.log('Added used column to magic_links table');
  } catch (e) {
    console.log('Column might already exist:', e.message);
  } finally {
    pool.end();
  }
}

updateDb();

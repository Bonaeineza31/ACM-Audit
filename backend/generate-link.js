import crypto from 'crypto';
import pool from './config/db.js';

async function generateLink(email) {
  try {
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      console.log('User not found. Run seedUsers.js first.');
      process.exit(1);
    }
    
    const userId = userRes.rows[0].id;
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    await pool.query(
      "INSERT INTO magic_links (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '15 minutes')",
      [userId, tokenHash]
    );
    
    const magicLinkUrl = `http://localhost:5173/?token=${token}&email=${encodeURIComponent(email)}`;
    console.log('\n==== LOCAL DEV MAGIC LINK ====');
    console.log(`User: ${email}`);
    console.log(`Link: ${magicLinkUrl}`);
    console.log('==============================\n');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  const email = process.argv[2] || 'bonae@acgroup.rw';
  generateLink(email);
}

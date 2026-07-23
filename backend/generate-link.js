const crypto = require('crypto');
const pool = require('./config/db');

async function generate() {
  try {
    const user = await pool.query("SELECT id FROM users WHERE email='bonae@acgroup.rw'");
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    
    await pool.query("INSERT INTO magic_links (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')", [user.rows[0].id, hash]);
    
    console.log('\n======================================================');
    console.log('✅✅✅ MAGIC LINK SUCCESSFULLY GENERATED ✅✅✅');
    console.log('COPY THIS EXACT LINK AND PASTE IT INTO YOUR BROWSER:');
    console.log(`http://localhost:5173/?token=${token}&email=bonae@acgroup.rw`);
    console.log('======================================================\n');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

generate();

const pool = require('./config/db');

async function updateId() {
  try {
    await pool.query("UPDATE assessments SET assessment_id = 'ACM-AUDIT-0001' WHERE id = 1");
    console.log('Record updated successfully to ACM-AUDIT-0001');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

updateId();

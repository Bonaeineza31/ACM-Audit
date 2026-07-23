import pool from './config/db.js';

const emails = [
  'abedihyacinthe@gmail.com', 'mukunzi@acgroup.rw', 'alex.twahirwa@acgroup.rw', 'alice.ntirenganya@acgroup.rw',
  'ntirenganyaalice@gmail.com', 'aman.rurangwa@acgroup.rw', 'augustin.mugisha@acgroup.rw', 'benjamin.duhozanye@acgroup.rw',
  'benji.tuyishimire@acgroup.rw', 'berabemwiza@acgroup.rw', 'bethy@acgroup.rw', 'bosco@acgroup.rw',
  'bosco.tuyisenge@acgroup.rw', 'chancelline@acgroup.rw', 'claude.tuyizere@acgroup.rw', 'clement.murinzi@acgroup.rw',
  'darcy@acgroup.rw', 'delphines@acgroup.rw', 'denis@acgroup.rw', 'diane.ishimwe@acgroup.rw',
  'diane.mutoni@acgroup.rw', 'edith@acgroup.rw', 'elite.muhoza@acgroup.rw', 'eugenie@acgroup.rw',
  'fabrice.nsengiyumva@acgroup.rw', 'fabrice.shimwa@acgroup.rw', 'gaetan@acgroup.rw', 'hirwa.aime@acgroup.rw',
  'ida@acgroup.rw', 'igabe.jeandamascene@acgroup.rw', 'ignace.ndizeye@acgroup.rw', 'immaculee@acgroup.rw',
  'innocent.ishimwe@acgroup.rw', 'isidore@acgroup.rw', 'jean.paul@acgroup.rw', 'joan@acgroup.rw',
  'karangwa@acgroup.rw', 'karanganwa.steve@acgroup.rw', 'laissa@acgroup.rw', 'lambert.iradukunda@acgroup.rw',
  'mario@acgroup.rw', 'mbabazi@acgroup.rw', 'mugeni@acgroup.rw', 'mugwaneza.yvonne@acgroup.rw',
  'mushimiyimana@acgroup.rw', 'mwizakwizera@acgroup.rw', 'n.yvette@acgroup.rw', 'ndagijimana.nathan@acgroup.rw',
  'ngoboka@acgroup.rw', 'nyiraneza.angelique@acgroup.rw', 'olivier@acgroup.rw', 'patrick@acgroup.rw',
  'rodrigue@acgroup.rw', 'sabin@acgroup.rw', 'safi@acgroup.rw', 'samuel@acgroup.rw',
  'shumbusho.emile@acgroup.rw', 'shyaka.honore@acgroup.rw', 'sibomana.mubarack@acgroup.rw', 'tuyizere.gaston@acgroup.rw',
  'steven@acgroup.rw', 'eurempie@acgroup.rw', 'umuhoza.vanessa@acgroup.rw', 'umunyanapauline@acgroup.rw',
  'urayenezalourence7@gmail.com', 'uwimbabazi@acgroup.rw', 'bildad.wafula@acgroup.rw', 'fidelite@acgroup.rw',
  'marlene@acgroup.rw', 'bonae@acgroup.rw', 'yvonne@acgroup.rw', 'irene@acgroup.rw'
];

async function seed() {
  try {
    let inserted = 0;
    
    for (const email of emails) {
      // Viewer role restricts access to analytics only and hides sensitive sections.
      // Assuming Viewer role covers all emails here based on PRD
      const role = 'Viewer';
      
      const checkResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (checkResult.rows.length === 0) {
        await pool.query('INSERT INTO users (email, role) VALUES ($1, $2)', [email, role]);
        inserted++;
      }
    }
    
    console.log(`Successfully seeded ${inserted} new users.`);
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await pool.end();
  }
}

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  seed();
}

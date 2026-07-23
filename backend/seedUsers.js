const pool = require('./config/db');

const emails = [
  'bamuines20@gmail.com', 'sharon@acgroup.rw', 'dennis.kalisa@acgroup.rw', 'abitsumutima@gmail.com',
  'gelio@acgroup.rw', 'cyusa.amour@acgroup.rw', 'jacques.dusabimana@acgroup.rw', 'elia@acgroup.rw',
  'rurisa@acgroup.rw', 'jeannefuraha359@gmail.com', 'gasavianney1977@gmail.com', 'gasoreeugene12@gmail.com',
  'habinshuti.denys@acgroup.rw', 'habiyamberemarcel12@gmail.com', 'harerimana.binego@acgroup.rw',
  'hodari2020@gmail.com', 'divine.ingabire@acgroup.rw', 'intwaza.gael@acgroup.rw', 'benndalton@acgroup.rw',
  'iradukundajoyeuse5@gmail.com', 'eloi.iratanga@acgroup.rw', 'ishimweclaude@acgroup.rw', 'kalex@acgroup.rw',
  'kanamugire.heritier@acgroup.rw', 'esthermpyisi@acgroup.rw', 'kasande.alice@acgroup.rw',
  'innocent.kayiranga@acgroup.rw', 'kayitareolivier12@gmail.com', 'kinzigirepacific@gmail.com',
  'kwibukaphilippe@acgroup.rw', 'kwizera.emmanuel@acgroup.rw', 'mandela.vincent@acgroup.rw',
  'jmbonigaba05@gmail.com', 'mugabocharlies250@gmail.com', 'piusmu16@gmail.com', 'jmugunga@acgroup.rw',
  'noel@acgroup.rw', 'mukagasana.26@acgroup.rw', 'mumararungu.shabani@acgroup.rw', 'jclaude.munezero@acgroup.rw',
  'rose.munezero@acgroup.rw', 'shyakainnocent123@gmail.com', 'chrimusemakweri@gmail.com', 'mutabazi@acgroup.rw',
  'mutangana.emmanuel@acgroup.rw', 'william@acgroup.rw', 'jaqueline@acgroup.rw', 'ndagijedan05@gmail.com',
  'ndayisaba@acgroup.rw', 'ndayichris12@gmail.com', 'nduwayezu@acgroup.rw', 'nikuze.ange@acgroup.rw',
  'romalis@acgroup.rw', 'niyogakiza@acgroup.rw', 'sam.niyomukiza@acgroup.rw', 'niyonizeyesamuel54@gmail.com',
  'amosniyonkuru5@gmail.com', 'jeanpniyonsaba@gmail.com', 'jean.bosco@acgroup.rw', 'rusagara.emmanuel@acgroup.rw',
  'bobopatrick417@gmail.com', 'rutayisire@acgroup.rw', 'sano@acgroup.rw', 'hambali.sebutatari@acgroup.rw',
  'shumbusho.emile@acgroup.rw', 'shyaka.honore@acgroup.rw', 'sibomana.mubarack@acgroup.rw', 'tuyizere.gaston@acgroup.rw',
  'steven@acgroup.rw', 'eurempie@acgroup.rw', 'umuhoza.vanessa@acgroup.rw', 'umunyanapauline@acgroup.rw',
  'urayenezalourence7@gmail.com', 'uwimbabazi@acgroup.rw', 'bildad.wafula@acgroup.rw', 'fidelite@acgroup.rw',
  'marlene@acgroup.rw', 'bonae@acgroup.rw', 'yvonne@acgroup.rw', 'irene@acgroup.rw'
];

async function seed() {
  try {
    let count = 0;
    for (const email of emails) {
      const res = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (res.rows.length === 0) {
        await pool.query('INSERT INTO users (email, role) VALUES ($1, $2)', [email, 'Viewer']);
        count++;
      }
    }
    console.log(`Successfully seeded ${count} new users.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

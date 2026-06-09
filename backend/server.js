const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDb, save } = require('./db/database');
const patientsRoute = require('./routes/patients');
const staffRoute = require('./routes/staff');
const servicesRoute = require('./routes/services');
const appointmentsRoute = require('./routes/appointments');

const app = express();
const PORT = 3000;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(bodyParser.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

initDb().then((db) => {
  patientsRoute.setDb(db, save);
  staffRoute.setDb(db);
  servicesRoute.setDb(db);
  appointmentsRoute.setDb(db, save);

  app.use('/api/patients', patientsRoute.router);
  app.use('/api/staff', staffRoute.router);
  app.use('/api/services', servicesRoute.router);
  app.use('/api/appointments', appointmentsRoute.router);

  app.listen(PORT, () => {
    console.log(`Clinique Lumière backend running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

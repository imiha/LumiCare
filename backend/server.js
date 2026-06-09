const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDb, save } = require('./db/database');
const patientsRoute = require('./routes/patients');

const app = express();
const PORT = 3000;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(bodyParser.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

initDb().then((db) => {
  patientsRoute.setDb(db, save);
  app.use('/api/patients', patientsRoute.router);

  app.listen(PORT, () => {
    console.log(`Clinique Lumière backend running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

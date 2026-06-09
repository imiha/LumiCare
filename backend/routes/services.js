const express = require('express');
const router = express.Router();
let db;

function setDb(database) {
  db = database;
}

router.get('/', (req, res) => {
  const results = db.exec('SELECT id, name, duration FROM services ORDER BY name ASC');
  const services = results.length > 0
    ? results[0].values.map(r => ({ id: r[0], name: r[1], duration: r[2] }))
    : [];
  res.json(services);
});

module.exports = { router, setDb };

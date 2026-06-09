const express = require('express');
const router = express.Router();
let db;

function setDb(database) {
  db = database;
}

router.get('/', (req, res) => {
  const results = db.exec(
    'SELECT id, first_name, last_name, role FROM staff WHERE active = 1 ORDER BY last_name ASC'
  );
  const staff = results.length > 0
    ? results[0].values.map(r => ({ id: r[0], firstName: r[1], lastName: r[2], role: r[3] }))
    : [];
  res.json(staff);
});

module.exports = { router, setDb };

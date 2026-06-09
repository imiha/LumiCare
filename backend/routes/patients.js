const express = require('express');
const router = express.Router();
let db;
let save;

function setDb(database, saveFunc) {
  db = database;
  save = saveFunc;
}

function rowToPatient(row) {
  return {
    id: row[0],
    firstName: row[1],
    lastName: row[2],
    email: row[3],
    phone: row[4],
    dateOfBirth: row[5],
    gender: row[6],
    emergencyContactName: row[7],
    emergencyContactPhone: row[8],
    allergies: row[9],
    medications: row[10],
    conditions: row[11],
    notes: row[12],
    createdAt: row[13],
  };
}

const SELECT_COLS = `id, first_name, last_name, email, phone, date_of_birth, gender,
  emergency_contact_name, emergency_contact_phone, allergies, medications, conditions, notes, created_at`;

router.get('/', (req, res) => {
  const { search } = req.query;
  let results;

  if (search && search.length >= 2) {
    const like = `%${search}%`;
    results = db.exec(
      `SELECT ${SELECT_COLS} FROM patients
       WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
       ORDER BY last_name ASC`,
      [like, like, like]
    );
  } else {
    results = db.exec(`SELECT ${SELECT_COLS} FROM patients ORDER BY last_name ASC`);
  }

  const patients = results.length > 0 ? results[0].values.map(rowToPatient) : [];
  res.json(patients);
});

router.post('/', (req, res) => {
  const { firstName, lastName, email, phone, dateOfBirth, gender,
    emergencyContactName, emergencyContactPhone, allergies, medications, conditions, notes } = req.body;

  const existing = db.exec('SELECT id FROM patients WHERE email = ?', [email]);
  if (existing.length > 0 && existing[0].values.length > 0) {
    return res.status(409).json({ error: 'A patient with this email already exists' });
  }

  db.run(
    `INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender,
      emergency_contact_name, emergency_contact_phone, allergies, medications, conditions, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [firstName, lastName, email, phone || null, dateOfBirth || null, gender || null,
      emergencyContactName || null, emergencyContactPhone || null,
      allergies || null, medications || null, conditions || null, notes || null]
  );

  save();

  const newId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
  const result = db.exec(`SELECT ${SELECT_COLS} FROM patients WHERE id = ?`, [newId]);
  res.status(201).json(rowToPatient(result[0].values[0]));
});

router.get('/:id', (req, res) => {
  const result = db.exec(`SELECT ${SELECT_COLS} FROM patients WHERE id = ?`, [req.params.id]);
  if (!result.length || !result[0].values.length) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json(rowToPatient(result[0].values[0]));
});

router.put('/:id', (req, res) => {
  const { firstName, lastName, email, phone, dateOfBirth, gender,
    emergencyContactName, emergencyContactPhone, allergies, medications, conditions, notes } = req.body;

  const exists = db.exec('SELECT id FROM patients WHERE id = ?', [req.params.id]);
  if (!exists.length || !exists[0].values.length) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const emailCheck = db.exec('SELECT id FROM patients WHERE email = ? AND id != ?', [email, req.params.id]);
  if (emailCheck.length > 0 && emailCheck[0].values.length > 0) {
    return res.status(409).json({ error: 'A patient with this email already exists' });
  }

  db.run(
    `UPDATE patients SET first_name=?, last_name=?, email=?, phone=?, date_of_birth=?, gender=?,
      emergency_contact_name=?, emergency_contact_phone=?, allergies=?, medications=?, conditions=?, notes=?
     WHERE id=?`,
    [firstName, lastName, email, phone || null, dateOfBirth || null, gender || null,
      emergencyContactName || null, emergencyContactPhone || null,
      allergies || null, medications || null, conditions || null, notes || null, req.params.id]
  );

  save();

  const result = db.exec(`SELECT ${SELECT_COLS} FROM patients WHERE id = ?`, [req.params.id]);
  res.json(rowToPatient(result[0].values[0]));
});

module.exports = { router, setDb };

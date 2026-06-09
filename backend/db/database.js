const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'clinique.db');
let db;

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    createSchema();
    seedData();
    save();
  }

  return db;
}

function createSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      date_of_birth TEXT,
      gender TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      allergies TEXT,
      medications TEXT,
      conditions TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

function seedData() {
  const patients = [
    ['Marie', 'Dupont', 'marie.dupont@example.com', '+31 6 12345678', '1985-03-15', 'F', 'Jean Dupont', '+31 6 87654321', 'Penicillin', null, 'Hypertension', 'Prefers morning appointments'],
    ['Jean', 'Martin', 'jean.martin@example.com', '+31 6 23456789', '1972-07-22', 'M', 'Claire Martin', '+31 6 98765432', null, 'Metformin', 'Type 2 Diabetes', null],
    ['Sophie', 'Bernard', 'sophie.bernard@example.com', '+31 6 34567890', '1990-11-08', 'F', 'Paul Bernard', '+31 6 43210987', 'Latex', null, null, 'Student, flexible schedule'],
  ];

  const stmt = db.prepare(`
    INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender,
      emergency_contact_name, emergency_contact_phone, allergies, medications, conditions, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of patients) {
    stmt.run(p);
  }
  stmt.free();
}

function save() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

module.exports = { initDb, save };

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
  }

  createSchema();

  const patientCount = db.exec('SELECT COUNT(*) FROM patients')[0].values[0][0];
  if (patientCount === 0) seedPatients();

  const staffCount = db.exec('SELECT COUNT(*) FROM staff')[0].values[0][0];
  if (staffCount === 0) seedStaff();

  const serviceCount = db.exec('SELECT COUNT(*) FROM services')[0].values[0][0];
  if (serviceCount === 0) seedServices();

  const apptCount = db.exec('SELECT COUNT(*) FROM appointments')[0].values[0][0];
  if (apptCount === 0) seedAppointments();

  save();
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

  db.run(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      duration INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id),
      practitioner_id INTEGER NOT NULL REFERENCES staff(id),
      service_id INTEGER NOT NULL REFERENCES services(id),
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

function seedPatients() {
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
  for (const p of patients) stmt.run(p);
  stmt.free();
}

function seedStaff() {
  const staff = [
    ['Sophie', 'Laurent', 'Naturopath'],
    ['Pierre', 'Moreau', 'Osteopath'],
    ['Marie-Claire', 'Dubois', 'Massage Therapist'],
  ];
  const stmt = db.prepare('INSERT INTO staff (first_name, last_name, role) VALUES (?, ?, ?)');
  for (const s of staff) stmt.run(s);
  stmt.free();
}

function seedServices() {
  const services = [
    ['Initial Consultation', 60],
    ['Follow-up', 30],
    ['Therapeutic Massage', 60],
    ['Osteopathy Session', 45],
    ['Wellness Assessment', 90],
  ];
  const stmt = db.prepare('INSERT INTO services (name, duration) VALUES (?, ?)');
  for (const s of services) stmt.run(s);
  stmt.free();
}

function seedAppointments() {
  const today = new Date().toISOString().split('T')[0];
  const appointments = [
    [1, 1, 1, today, '09:00', '10:00', 'scheduled'],
    [2, 2, 4, today, '10:30', '11:15', 'confirmed'],
    [3, 3, 3, today, '14:00', '15:00', 'scheduled'],
  ];
  const stmt = db.prepare(`
    INSERT INTO appointments (patient_id, practitioner_id, service_id, date, start_time, end_time, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of appointments) stmt.run(a);
  stmt.free();
}

function save() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

module.exports = { initDb, save };

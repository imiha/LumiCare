const express = require('express');
const router = express.Router();
let db;
let save;

function setDb(database, saveFunc) {
  db = database;
  save = saveFunc;
}

const JOIN_SQL = `
  SELECT a.id, a.patient_id, p.first_name || ' ' || p.last_name AS patient_name,
    a.practitioner_id, s.first_name || ' ' || s.last_name AS practitioner_name,
    a.service_id, svc.name AS service_name, svc.duration AS service_duration,
    a.date, a.start_time, a.end_time, a.status, a.created_at
  FROM appointments a
  JOIN patients p ON p.id = a.patient_id
  JOIN staff s ON s.id = a.practitioner_id
  JOIN services svc ON svc.id = a.service_id
`;

function rowToAppointment(row) {
  return {
    id: row[0],
    patientId: row[1],
    patientName: row[2],
    practitionerId: row[3],
    practitionerName: row[4],
    serviceId: row[5],
    serviceName: row[6],
    serviceDuration: row[7],
    date: row[8],
    startTime: row[9],
    endTime: row[10],
    status: row[11],
    createdAt: row[12],
  };
}

router.get('/', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const results = db.exec(
    `${JOIN_SQL} WHERE a.date = ? ORDER BY a.start_time ASC`,
    [date]
  );
  res.json(results.length > 0 ? results[0].values.map(rowToAppointment) : []);
});

router.post('/', (req, res) => {
  const { patientId, practitionerId, serviceId, date, startTime, endTime } = req.body;

  const conflict = db.exec(`
    SELECT a.id, a.start_time, a.end_time, s.first_name || ' ' || s.last_name AS practitioner_name
    FROM appointments a
    JOIN staff s ON s.id = a.practitioner_id
    WHERE a.practitioner_id = ? AND a.date = ?
      AND a.status NOT IN ('cancelled')
      AND NOT (a.end_time <= ? OR a.start_time >= ?)
  `, [practitionerId, date, startTime, endTime]);

  if (conflict.length > 0 && conflict[0].values.length > 0) {
    const [, cStart, cEnd, practitionerName] = conflict[0].values[0];
    return res.status(409).json({
      error: `Time slot conflict: ${practitionerName} is already booked from ${cStart} to ${cEnd}`,
    });
  }

  db.run(
    `INSERT INTO appointments (patient_id, practitioner_id, service_id, date, start_time, end_time, status)
     VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
    [patientId, practitionerId, serviceId, date, startTime, endTime]
  );
  save();

  const newId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
  const result = db.exec(`${JOIN_SQL} WHERE a.id = ?`, [newId]);
  res.status(201).json(rowToAppointment(result[0].values[0]));
});

router.patch('/:id/cancel', (req, res) => {
  const exists = db.exec('SELECT id FROM appointments WHERE id = ?', [req.params.id]);
  if (!exists.length || !exists[0].values.length) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  db.run("UPDATE appointments SET status = 'cancelled' WHERE id = ?", [req.params.id]);
  save();
  const result = db.exec(`${JOIN_SQL} WHERE a.id = ?`, [req.params.id]);
  res.json(rowToAppointment(result[0].values[0]));
});

module.exports = { router, setDb };

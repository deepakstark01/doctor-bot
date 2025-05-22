import { getDb } from '../../lib/db';

export default async function handler(req, res) {
  const db = await getDb();
  
  if (req.method === 'GET') {
    try {
      const { patient_id } = req.query;
      
      if (!patient_id) {
        return res.status(400).json({ error: 'Patient ID is required' });
      }

      // Get appointments with doctor details
      const appointments = await db.all(`
        SELECT 
          a.id,
          a.patient_id,
          a.doctor_id,
          a.date,
          a.time,
          a.reason,
          a.status,
          d.name as doctor_name,
          d.specialty,
          c.name as category_name
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN categories c ON d.specialty = c.name
        WHERE a.patient_id = ?
        ORDER BY a.date DESC, a.time DESC
      `, [patient_id]);

      res.status(200).json({ appointments });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  } else if (req.method === 'POST') {
    try {
      const { patient_id, doctor_id, date, time, reason } = req.body;

      if (!patient_id || !doctor_id || !date || !time) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if appointment slot is already taken
      const existingAppointment = await db.get(`
        SELECT id FROM appointments 
        WHERE doctor_id = ? AND date = ? AND time = ? AND status != 'cancelled'
      `, [doctor_id, date, time]);

      if (existingAppointment) {
        return res.status(409).json({ error: 'This time slot is already booked' });
      }

      // Create new appointment
      const result = await db.run(`
        INSERT INTO appointments (patient_id, doctor_id, date, time, reason, status)
        VALUES (?, ?, ?, ?, ?, 'booked')
      `, [patient_id, doctor_id, date, time, reason || '']);

      // Get the created appointment with doctor details
      const newAppointment = await db.get(`
        SELECT 
          a.id,
          a.patient_id,
          a.doctor_id,
          a.date,
          a.time,
          a.reason,
          a.status,
          d.name as doctor_name,
          d.specialty,
          c.name as category_name
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN categories c ON d.specialty = c.name
        WHERE a.id = ?
      `, [result.lastID]);

      res.status(201).json({ appointment: newAppointment });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ error: 'Failed to create appointment' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
import { getDb } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  const db = await getDb();
  
  if (req.method === 'PUT') {
    // Update/Reschedule appointment
    try {
      const { date, time, reason, status } = req.body;

      if (!date && !time && !reason && !status) {
        return res.status(400).json({ error: 'At least one field is required for update' });
      }

      // Build dynamic update query
      const updateFields = [];
      const values = [];

      if (date) {
        updateFields.push('date = ?');
        values.push(date);
      }
      if (time) {
        updateFields.push('time = ?');
        values.push(time);
      }
      if (reason) {
        updateFields.push('reason = ?');
        values.push(reason);
      }
      if (status) {
        updateFields.push('status = ?');
        values.push(status);
      }

      values.push(id);

      // Check if new time slot conflicts (if date/time being changed)
      if (date || time) {
        const currentAppointment = await db.get('SELECT doctor_id, date, time FROM appointments WHERE id = ?', [id]);
        
        const checkDate = date || currentAppointment.date;
        const checkTime = time || currentAppointment.time;
        
        const conflictingAppointment = await db.get(`
          SELECT id FROM appointments 
          WHERE doctor_id = ? AND date = ? AND time = ? AND status != 'cancelled' AND id != ?
        `, [currentAppointment.doctor_id, checkDate, checkTime, id]);

        if (conflictingAppointment) {
          return res.status(409).json({ error: 'This time slot is already booked' });
        }
      }

      const result = await db.run(`
        UPDATE appointments 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, values);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Get updated appointment with doctor details
      const updatedAppointment = await db.get(`
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
      `, [id]);

      res.status(200).json({ appointment: updatedAppointment });
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  } else if (req.method === 'DELETE') {
    // Cancel appointment
    try {
      const result = await db.run(`
        UPDATE appointments 
        SET status = 'cancelled'
        WHERE id = ?
      `, [id]);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      res.status(200).json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      res.status(500).json({ error: 'Failed to cancel appointment' });
    }
  } else if (req.method === 'GET') {
    // Get single appointment
    try {
      const appointment = await db.get(`
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
          c.name as category_name,
          u.username as patient_name,
          u.email as patient_email
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON a.patient_id = u.id
        LEFT JOIN categories c ON d.specialty = c.name
        WHERE a.id = ?
      `, [id]);

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      res.status(200).json({ appointment });
    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({ error: 'Failed to fetch appointment' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
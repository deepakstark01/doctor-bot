// Database queries for the Doctor Appointment System
import { getDb } from './database';

// =======================
// USER QUERIES
// =======================

/**
 * Find user by username and role
 */
export async function findUserByUsernameAndRole(username, role) {
  const db = await getDb();
  return await db.query(
    'SELECT * FROM users WHERE username = $1 AND role = $2',
    [username.trim(), role]
  );
}

/**
 * Find active user by username and role
 */
export async function findActiveUserByUsernameAndRole(username, role) {
  const db = await getDb();
  
  // First, check if is_active column exists
  const columnExists = await db.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_active'
    );
  `);
  
  if (columnExists.rows[0].exists) {
    return await db.query(
      'SELECT * FROM users WHERE username = $1 AND role = $2 AND is_active = true',
      [username.trim(), role]
    );
  } else {
    // Fallback to query without is_active column
    return await db.query(
      'SELECT * FROM users WHERE username = $1 AND role = $2',
      [username.trim(), role]
    );
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email) {
  const db = await getDb();
  return await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email.trim().toLowerCase()]
  );
}

/**
 * Find user by ID
 */
export async function findUserById(id) {
  const db = await getDb();
  return await db.query('SELECT * FROM users WHERE id = $1', [id]);
}

/**
 * Create new user
 */
export async function createUser(userData) {
  const db = await getDb();
  const { username, email, password_hash, role, full_name, phone } = userData;
  
  return await db.query(
    `INSERT INTO users (username, email, password_hash, role, full_name, phone) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      username.trim(),
      email.trim().toLowerCase(),
      password_hash,
      role || 'patient',
      full_name?.trim() || null,
      phone?.trim() || null
    ]
  );
}

/**
 * Update user
 */
export async function updateUser(id, userData) {
  const db = await getDb();
  const { full_name, email, phone, password_hash } = userData;
  
  if (password_hash) {
    return await db.query(
      `UPDATE users 
       SET full_name = $1, email = $2, phone = $3, password_hash = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [full_name?.trim(), email?.trim().toLowerCase(), phone?.trim() || null, password_hash, id]
    );
  } else {
    return await db.query(
      `UPDATE users 
       SET full_name = $1, email = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [full_name?.trim(), email?.trim().toLowerCase(), phone?.trim() || null, id]
    );
  }
}

/**
 * Check if username exists
 */
export async function usernameExists(username, excludeId = null) {
  const db = await getDb();
  
  if (excludeId) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE username = $1 AND id != $2',
      [username.trim(), excludeId]
    );
    return parseInt(result.rows[0].count) > 0;
  } else {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE username = $1',
      [username.trim()]
    );
    return parseInt(result.rows[0].count) > 0;
  }
}

/**
 * Check if email exists
 */
export async function emailExists(email, excludeId = null) {
  const db = await getDb();
  
  if (excludeId) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE email = $1 AND id != $2',
      [email.trim().toLowerCase(), excludeId]
    );
    return parseInt(result.rows[0].count) > 0;
  } else {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    return parseInt(result.rows[0].count) > 0;
  }
}

// =======================
// DOCTOR QUERIES
// =======================

/**
 * Get all active doctors with categories
 */
export async function getAllDoctors() {
  const db = await getDb();
  return await db.query(`
    SELECT d.*, c.name as category_name 
    FROM doctors d 
    LEFT JOIN categories c ON d.category_id = c.id 
    WHERE d.is_active = true
    ORDER BY d.name
  `);
}

/**
 * Get doctor by ID
 */
export async function getDoctorById(id) {
  const db = await getDb();
  return await db.query(`
    SELECT d.*, c.name as category_name 
    FROM doctors d 
    LEFT JOIN categories c ON d.category_id = c.id 
    WHERE d.id = $1
  `, [id]);
}

/**
 * Create new doctor
 */
export async function createDoctor(doctorData) {
  const db = await getDb();
  const { name, specialty, category_id, details, experience_years, consultation_fee, available_days, available_hours } = doctorData;
  
  return await db.query(
    `INSERT INTO doctors (name, specialty, category_id, details, experience_years, consultation_fee, available_days, available_hours) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [name, specialty, category_id, details, experience_years, consultation_fee, available_days, available_hours]
  );
}

/**
 * Update doctor
 */
export async function updateDoctor(id, doctorData) {
  const db = await getDb();
  const { name, specialty, category_id, details, experience_years, consultation_fee, available_days, available_hours } = doctorData;
  
  return await db.query(
    `UPDATE doctors 
     SET name = $1, specialty = $2, category_id = $3, details = $4, 
         experience_years = $5, consultation_fee = $6, available_days = $7, 
         available_hours = $8, updated_at = CURRENT_TIMESTAMP
     WHERE id = $9 RETURNING *`,
    [name, specialty, category_id, details, experience_years, consultation_fee, available_days, available_hours, id]
  );
}

/**
 * Delete doctor (soft delete)
 */
export async function deleteDoctor(id) {
  const db = await getDb();
  return await db.query(
    'UPDATE doctors SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [id]
  );
}

// =======================
// CATEGORY QUERIES
// =======================

/**
 * Get all active categories
 */
export async function getAllCategories() {
  const db = await getDb();
  return await db.query('SELECT * FROM categories WHERE is_active = true ORDER BY name');
}

/**
 * Get category by ID
 */
export async function getCategoryById(id) {
  const db = await getDb();
  return await db.query('SELECT * FROM categories WHERE id = $1', [id]);
}

/**
 * Create new category
 */
export async function createCategory(categoryData) {
  const db = await getDb();
  const { name, description } = categoryData;
  
  return await db.query(
    'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
    [name, description]
  );
}

// =======================
// APPOINTMENT QUERIES
// =======================

/**
 * Get appointments by patient ID
 */
export async function getAppointmentsByPatientId(patientId) {
  const db = await getDb();
  return await db.query(`
    SELECT a.*, d.name as doctor_name, d.specialty as doctor_specialty, c.name as category_name
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    LEFT JOIN categories c ON d.category_id = c.id
    WHERE a.patient_id = $1
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `, [patientId]);
}

/**
 * Get appointments by doctor ID
 */
export async function getAppointmentsByDoctorId(doctorId) {
  const db = await getDb();
  return await db.query(`
    SELECT a.*, u.full_name as patient_name, u.username as patient_username
    FROM appointments a
    JOIN users u ON a.patient_id = u.id
    WHERE a.doctor_id = $1
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `, [doctorId]);
}

/**
 * Get all appointments (for admin)
 */
export async function getAllAppointments() {
  const db = await getDb();
  return await db.query(`
    SELECT a.*, d.name as doctor_name, d.specialty as doctor_specialty, 
           u.full_name as patient_name, u.username as patient_username, c.name as category_name
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    JOIN users u ON a.patient_id = u.id
    LEFT JOIN categories c ON d.category_id = c.id
    ORDER BY a.created_at DESC
  `);
}

/**
 * Check if appointment slot is available
 */
export async function isAppointmentSlotAvailable(doctorId, date, time, excludeId = null) {
  const db = await getDb();
  
  let query = 'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status = $4';
  let params = [doctorId, date, time, 'booked'];
  
  if (excludeId) {
    query += ' AND id != $5';
    params.push(excludeId);
  }
  
  const result = await db.query(query, params);
  return parseInt(result.rows[0].count) === 0;
}

/**
 * Create new appointment
 */
export async function createAppointment(appointmentData) {
  const db = await getDb();
  const { patient_id, doctor_id, appointment_date, appointment_time, reason } = appointmentData;
  
  return await db.query(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [patient_id, doctor_id, appointment_date, appointment_time, reason, 'booked']
  );
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(id, status, notes = null) {
  const db = await getDb();
  
  if (notes) {
    return await db.query(
      'UPDATE appointments SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, notes, id]
    );
  } else {
    return await db.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
  }
}

/**
 * Update appointment
 */
export async function updateAppointment(id, appointmentData) {
  const db = await getDb();
  const { appointment_date, appointment_time, reason, notes } = appointmentData;
  
  return await db.query(
    `UPDATE appointments 
     SET appointment_date = $1, appointment_time = $2, reason = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
     WHERE id = $5 RETURNING *`,
    [appointment_date, appointment_time, reason, notes, id]
  );
}

/**
 * Cancel appointment
 */
export async function cancelAppointment(id) {
  return await updateAppointmentStatus(id, 'cancelled');
}

/**
 * Complete appointment
 */
export async function completeAppointment(id, notes = null) {
  return await updateAppointmentStatus(id, 'completed', notes);
}

// =======================
// STATISTICS QUERIES
// =======================

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  const db = await getDb();
  
  const [
    patientsResult,
    doctorsResult,
    appointmentsResult,
    categoriesResult,
    todayResult,
    upcomingResult,
    completedResult,
    cancelledResult
  ] = await Promise.all([
    db.query("SELECT COUNT(*) as count FROM users WHERE role = 'patient'"),
    db.query('SELECT COUNT(*) as count FROM doctors WHERE is_active = true'),
    db.query('SELECT COUNT(*) as count FROM appointments'),
    db.query('SELECT COUNT(*) as count FROM categories WHERE is_active = true'),
    db.query("SELECT COUNT(*) as count FROM appointments WHERE appointment_date = CURRENT_DATE"),
    db.query("SELECT COUNT(*) as count FROM appointments WHERE appointment_date > CURRENT_DATE AND status = 'booked'"),
    db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'"),
    db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'cancelled'")
  ]);

  return {
    totalPatients: parseInt(patientsResult.rows[0].count),
    totalDoctors: parseInt(doctorsResult.rows[0].count),
    totalAppointments: parseInt(appointmentsResult.rows[0].count),
    totalCategories: parseInt(categoriesResult.rows[0].count),
    todayAppointments: parseInt(todayResult.rows[0].count),
    upcomingAppointments: parseInt(upcomingResult.rows[0].count),
    completedAppointments: parseInt(completedResult.rows[0].count),
    cancelledAppointments: parseInt(cancelledResult.rows[0].count)
  };
}

/**
 * Get recent appointments for dashboard
 */
export async function getRecentAppointments(limit = 10) {
  const db = await getDb();
  return await db.query(`
    SELECT a.*, d.name as doctor_name, u.full_name as patient_name, u.username as patient_username
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    JOIN users u ON a.patient_id = u.id
    ORDER BY a.created_at DESC
    LIMIT $1
  `, [limit]);
}

/**
 * Get top doctors by appointment count
 */
export async function getTopDoctors(limit = 5) {
  const db = await getDb();
  return await db.query(`
    SELECT d.name, d.specialty, COUNT(a.id) as appointment_count
    FROM doctors d
    LEFT JOIN appointments a ON d.id = a.doctor_id AND a.status != 'cancelled'
    WHERE d.is_active = true
    GROUP BY d.id, d.name, d.specialty
    ORDER BY appointment_count DESC
    LIMIT $1
  `, [limit]);
}
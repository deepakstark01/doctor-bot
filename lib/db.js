import { PGlite } from '@electric-sql/pglite';

// Database connection and initialization
let db = null;

/**
 * Get database connection singleton with persistence
 * @returns {Promise<PGlite>} Database connection
 */
export async function getDb() {
  if (!db) {
    // Use IndexedDB for persistence
    db = new PGlite('idb://medicare-db');
    await initializeDb();
  }
  return db;
}

/**
 * Initialize database tables and default data
 */
async function initializeDb() {
  try {
    // Check if database is already initialized
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      await createTables();
      await insertDefaultData();
      console.log('Database initialized successfully');
    } else {
      console.log('Database already exists, skipping initialization');
      // Still ensure default admin exists if missing
      await ensureDefaultAdmin();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Check if main tables exist
 */
async function checkTablesExist() {
  try {
    const result = await db.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name IN ('users', 'categories', 'doctors', 'appointments')
    `);
    return parseInt(result.rows[0].count) >= 4;
  } catch (error) {
    return false;
  }
}

/**
 * Create all database tables
 */
async function createTables() {
  await db.exec(`
    -- Users table for patients and admins
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
      full_name VARCHAR(100),
      phone VARCHAR(20),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Medical specialties/categories
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Doctors profiles
    CREATE TABLE IF NOT EXISTS doctors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      specialty VARCHAR(100) NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      details TEXT,
      experience_years INTEGER DEFAULT 0 CHECK (experience_years >= 0),
      consultation_fee DECIMAL(10,2) DEFAULT 0 CHECK (consultation_fee >= 0),
      available_days VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
      available_hours VARCHAR(100) DEFAULT '09:00-17:00',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Appointments
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      reason TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'booked' CHECK (status IN ('booked', 'cancelled', 'completed', 'no-show')),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
    CREATE INDEX IF NOT EXISTS idx_doctors_category ON doctors(category_id);
    CREATE INDEX IF NOT EXISTS idx_doctors_active ON doctors(is_active);
    CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
    CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(appointment_date, appointment_time);
  `);
}

/**
 * Insert default categories, doctors, and admin user
 */
async function insertDefaultData() {
  try {
    console.log('Inserting default data...');

    // Insert medical categories
    await db.exec(`
      INSERT INTO categories (name, description) VALUES
      ('Cardiology', 'Heart and cardiovascular system specialists'),
      ('Dentistry', 'Dental care and oral health specialists'),
      ('General Medicine', 'Primary care and general health consultations'),
      ('Dermatology', 'Skin, hair, and nail specialists'),
      ('Orthopedics', 'Bone, joint, and musculoskeletal specialists'),
      ('Pediatrics', 'Child healthcare specialists'),
      ('Neurology', 'Brain and nervous system specialists'),
      ('Gynecology', 'Women''s reproductive health specialists'),
      ('Psychiatry', 'Mental health and psychiatric care'),
      ('Ophthalmology', 'Eye and vision care specialists');
    `);

    // Insert sample doctors
    await db.exec(`
      INSERT INTO doctors (name, specialty, category_id, details, experience_years, consultation_fee, available_days, available_hours) VALUES
      ('Dr. John Smith', 'Cardiologist', 1, 'Experienced heart specialist with expertise in interventional cardiology and heart disease prevention. Board-certified with 15 years of practice.', 15, 150.00, 'Mon,Tue,Wed,Thu,Fri', '09:00-17:00'),
      ('Dr. Sarah Johnson', 'General Dentist', 2, 'Comprehensive dental care including preventive, restorative, and cosmetic dentistry. Specializes in patient comfort and modern dental techniques.', 8, 80.00, 'Mon,Tue,Wed,Thu,Fri,Sat', '08:00-18:00'),
      ('Dr. Michael Brown', 'Family Physician', 3, 'Primary care physician specializing in family medicine, preventive care, and chronic disease management for patients of all ages.', 12, 100.00, 'Mon,Tue,Wed,Thu,Fri', '08:00-17:00'),
      ('Dr. Emily Davis', 'Dermatologist', 4, 'Board-certified dermatologist specializing in medical and cosmetic dermatology, skin cancer screening, and advanced dermatological procedures.', 10, 120.00, 'Mon,Wed,Fri', '10:00-16:00'),
      ('Dr. Robert Wilson', 'Orthopedic Surgeon', 5, 'Orthopedic surgeon specializing in joint replacement, sports medicine, and trauma surgery. Expert in minimally invasive techniques.', 18, 200.00, 'Tue,Thu', '09:00-15:00'),
      ('Dr. Lisa Anderson', 'Pediatrician', 6, 'Board-certified pediatrician providing comprehensive healthcare for children from newborn to adolescent. Specializes in child development and immunizations.', 9, 90.00, 'Mon,Tue,Wed,Thu,Fri', '08:00-16:00'),
      ('Dr. David Martinez', 'Neurologist', 7, 'Neurologist specializing in the diagnosis and treatment of brain, spinal cord, and nervous system disorders. Expert in headache management and epilepsy.', 14, 180.00, 'Mon,Wed,Fri', '09:00-17:00'),
      ('Dr. Jennifer Taylor', 'Gynecologist', 8, 'Board-certified OB/GYN providing comprehensive women''s healthcare including routine exams, prenatal care, and gynecological procedures.', 11, 130.00, 'Mon,Tue,Thu,Fri', '09:00-16:00'),
      ('Dr. Mark Thompson', 'Psychiatrist', 9, 'Board-certified psychiatrist specializing in adult mental health, anxiety, depression, and psychiatric medication management.', 13, 160.00, 'Mon,Tue,Wed,Thu', '10:00-18:00'),
      ('Dr. Anna Rodriguez', 'Ophthalmologist', 10, 'Comprehensive eye care specialist offering medical and surgical treatment for eye conditions, including cataract and retinal surgery.', 16, 140.00, 'Tue,Wed,Thu,Fri', '08:00-16:00');
    `);

    // Insert default admin user
    await createDefaultAdmin();

    console.log('Default data inserted successfully');
  } catch (error) {
    console.error('Error inserting default data:', error);
    throw error;
  }
}

/**
 * Create default admin user
 */
async function createDefaultAdmin() {
  let bcrypt;
  try {
    bcrypt = await import('bcryptjs');
  } catch (error) {
    console.warn('bcryptjs not available during build time');
    return;
  }
  
  const adminPassword = await bcrypt.default.hash('admin123', 12);
  
  await db.exec(`
    INSERT INTO users (username, email, password_hash, role, full_name, phone) VALUES
    ('admin', 'admin@medicare.com', '${adminPassword}', 'admin', 'System Administrator', '+1-234-567-8900');
  `);
}

/**
 * Ensure default admin exists (for existing databases)
 */
async function ensureDefaultAdmin() {
  try {
    const adminResult = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
    );
    
    if (parseInt(adminResult.rows[0].count) === 0) {
      console.log('No admin user found, creating default admin...');
      await createDefaultAdmin();
    }
  } catch (error) {
    console.error('Error checking admin user:', error);
  }
}

/**
 * Reset database to initial state (for development)
 */
export async function resetDatabase() {
  try {
    const database = await getDb();
    await database.exec(`
      DROP TABLE IF EXISTS appointments CASCADE;
      DROP TABLE IF EXISTS doctors CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    
    // Recreate everything
    await createTables();
    await insertDefaultData();
    console.log('Database reset successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

/**
 * Clear all data but keep structure
 */
export async function clearDatabase() {
  try {
    const database = await getDb();
    await database.exec(`
      TRUNCATE TABLE appointments RESTART IDENTITY CASCADE;
      TRUNCATE TABLE doctors RESTART IDENTITY CASCADE;
      TRUNCATE TABLE categories RESTART IDENTITY CASCADE;
      TRUNCATE TABLE users RESTART IDENTITY CASCADE;
    `);
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

/**
 * Execute a query with error handling
 */
export async function executeQuery(query, params = []) {
  try {
    const database = await getDb();
    return await database.query(query, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute multiple queries in a transaction
 */
export async function executeTransaction(queries) {
  const database = await getDb();
  
  try {
    await database.exec('BEGIN');
    
    const results = [];
    for (const { query, params = [] } of queries) {
      const result = await database.query(query, params);
      results.push(result);
    }
    
    await database.exec('COMMIT');
    return results;
  } catch (error) {
    await database.exec('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  }
}

/**
 * Get database health status
 */
export async function getDatabaseHealth() {
  try {
    const database = await getDb();
    
    const [
      usersCount,
      doctorsCount,
      categoriesCount,
      appointmentsCount
    ] = await Promise.all([
      database.query('SELECT COUNT(*) as count FROM users'),
      database.query('SELECT COUNT(*) as count FROM doctors'),
      database.query('SELECT COUNT(*) as count FROM categories'),
      database.query('SELECT COUNT(*) as count FROM appointments')
    ]);

    return {
      status: 'healthy',
      persistent: true,
      tables: {
        users: parseInt(usersCount.rows[0].count),
        doctors: parseInt(doctorsCount.rows[0].count),
        categories: parseInt(categoriesCount.rows[0].count),
        appointments: parseInt(appointmentsCount.rows[0].count)
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      persistent: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
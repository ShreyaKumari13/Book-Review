import { Pool } from 'pg';

// Use environment variables for sensitive information
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL environment variable is not set. Using fallback connection string.');
}

const connectionString = process.env.DATABASE_URL;

// Create a new pool instance with the connection string
const pool = new Pool({
  connectionString,
});

// Helper function to execute SQL queries
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  }
}

// Test connection function
export async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    return {
      success: true,
      message: 'Database connection successful',
      timestamp: result.rows[0].now
    };
  } catch (error) {
    return {
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Export the pool for direct use if needed
export default pool;

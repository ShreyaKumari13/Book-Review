import { query } from './db';

/**
 * Set up the database tables for the Book Review API
 */
export async function setupDatabase() {
  try {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created or already exists');

    // Create books table
    await query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        genre VARCHAR(100),
        description TEXT,
        published_year INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id)
      )
    `);
    console.log('Books table created or already exists');

    // Create reviews table
    await query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(book_id, user_id)
      )
    `);
    console.log('Reviews table created or already exists');

    // Create index for book search
    await query(`
      CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
      CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
      CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
    `);
    console.log('Indexes created or already exist');

    return { success: true, message: 'Database setup completed successfully' };
  } catch (error) {
    console.error('Error setting up database:', error);
    return { 
      success: false, 
      message: 'Database setup failed', 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Drop all tables (for testing/reset purposes)
 */
export async function dropAllTables() {
  try {
    await query('DROP TABLE IF EXISTS reviews CASCADE');
    await query('DROP TABLE IF EXISTS books CASCADE');
    await query('DROP TABLE IF EXISTS users CASCADE');
    
    return { success: true, message: 'All tables dropped successfully' };
  } catch (error) {
    console.error('Error dropping tables:', error);
    return { 
      success: false, 
      message: 'Failed to drop tables', 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

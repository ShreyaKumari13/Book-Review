import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';
import { generateToken } from '../../../lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    // This is a placeholder - in a real app, you would check if the email already exists in your database
    
    // For demonstration purposes, we'll create a SQL query to insert a new user
    // In a real application, you would:
    // 1. Hash the password before storing it
    // 2. Validate the email format
    // 3. Add additional security measures

    // Example SQL query to create a users table (if it doesn't exist)
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      console.error('Error creating users table:', error);
      return res.status(500).json({ error: 'Failed to set up database' });
    }

    // Insert the new user
    // Note: In a real application, you should hash the password before storing it
    const result = await query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role',
      [name, email, password] // In a real app, use a hashed password here
    );

    const newUser = result.rows[0];

    // Generate JWT token for the new user
    const token = generateToken({
      id: newUser.id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    });

    // Return success response with token
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Check for duplicate email error
    if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

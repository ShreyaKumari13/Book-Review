import { NextApiRequest, NextApiResponse } from 'next';
import { generateToken, User } from '../../../lib/auth';
import { query } from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // For demonstration purposes only - in a real app, you would:
    // 1. Check if the user exists in the database
    // 2. Verify the password hash
    // 3. Generate a token if authentication is successful

    // This is a placeholder for database authentication
    // In a real application, replace this with actual database queries
    
    // Simulating a user for demonstration
    // In a real app, you would fetch this from the database
    const mockUser: User = {
      id: '123',
      email: email,
      name: 'Test User',
      role: 'user'
    };

    // Generate JWT token
    const token = generateToken(mockUser);

    // Return the token
    return res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

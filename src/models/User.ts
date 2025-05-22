import { query } from '../lib/db';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  created_at?: Date;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
}

export class UserModel {
  /**
   * Create a new user
   */
  static async create(userData: UserInput): Promise<User> {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const result = await query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [userData.name, userData.email, hashedPassword]
    );

    return result.rows[0];
  }

  /**
   * Find a user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find a user by ID
   */
  static async findById(id: number): Promise<User | null> {
    const result = await query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [id]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

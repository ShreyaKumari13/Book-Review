import jwt from 'jsonwebtoken';

// Make sure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not set. Authentication will not work properly.');
}

// Define user type
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// Define token payload type
export interface TokenPayload {
  userId: string;
  email: string;
  name?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for a user
 * @param user User object
 * @param expiresIn Token expiration time (default: '7d')
 * @returns JWT token string
 */
export function generateToken(user: User, expiresIn: string = '7d'): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret, { expiresIn } as jwt.SignOptions);
}

/**
 * Verify and decode a JWT token
 * @param token JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader Authorization header value
 * @returns Token string or null if not found
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

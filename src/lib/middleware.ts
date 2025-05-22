import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, extractTokenFromHeader, TokenPayload } from './auth';

// Extend NextApiRequest to include user information
export interface AuthenticatedRequest extends NextApiRequest {
  user?: TokenPayload;
}

type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;
type AuthHandler = (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void;

/**
 * Middleware to authenticate requests using JWT
 * @param handler The API route handler
 * @returns A new handler with authentication
 */
export function withAuth(handler: AuthHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        res.status(401).json({ error: 'Authentication token is required' });
        return;
      }

      // Verify token
      const decodedToken = verifyToken(token);

      if (!decodedToken) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      // Add user information to request
      (req as AuthenticatedRequest).user = decodedToken;

      // Call the original handler
      await handler(req as AuthenticatedRequest, res);
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ error: 'Internal server error during authentication' });
    }
  };
}

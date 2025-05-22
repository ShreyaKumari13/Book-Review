import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../lib/middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    // In a stateless JWT authentication system, the server doesn't maintain session state
    // The client is responsible for removing the token
    // We can return a success message to confirm the logout request was received

    res.status(200).json({
      success: true,
      message: 'Logout successful. Please remove the token from your client storage.'
    });

    // Note: For a more secure implementation, you could:
    // 1. Maintain a blacklist of invalidated tokens
    // 2. Use short-lived tokens with refresh tokens
    // 3. Implement token revocation
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

// Use authentication middleware to ensure only logged-in users can logout
export default withAuth(handler);

import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../lib/middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // This route is protected by the withAuth middleware
  // req.user contains the decoded token payload
  
  if (req.method === 'GET') {
    // Return user information from the token
    return res.status(200).json({
      message: 'This is a protected route',
      user: req.user
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);

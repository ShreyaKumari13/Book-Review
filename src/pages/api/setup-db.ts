import { NextApiRequest, NextApiResponse } from 'next';
import { setupDatabase, dropAllTables } from '../../lib/db-setup';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // This endpoint should only be used in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'This endpoint is not available in production' });
  }

  if (req.method === 'POST') {
    try {
      const { action } = req.body;

      if (action === 'setup') {
        const result = await setupDatabase();
        return res.status(result.success ? 200 : 500).json(result);
      } else if (action === 'reset') {
        const dropResult = await dropAllTables();
        if (!dropResult.success) {
          return res.status(500).json(dropResult);
        }
        
        const setupResult = await setupDatabase();
        return res.status(setupResult.success ? 200 : 500).json({
          drop: dropResult,
          setup: setupResult
        });
      } else {
        return res.status(400).json({ error: 'Invalid action. Use "setup" or "reset".' });
      }
    } catch (error) {
      console.error('Error in setup-db endpoint:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

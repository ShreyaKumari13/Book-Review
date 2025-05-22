import { NextApiRequest, NextApiResponse } from 'next';
import { testConnection } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const result = await testConnection();
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(500).json(result);
      }
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error testing database connection',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

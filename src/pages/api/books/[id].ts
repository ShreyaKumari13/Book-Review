import { NextApiRequest, NextApiResponse } from 'next';
import { BookModel } from '../../../models/Book';
import { ReviewModel } from '../../../models/Review';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const bookId = parseInt(id as string);

  if (isNaN(bookId)) {
    res.status(400).json({ error: 'Invalid book ID' });
    return;
  }

  // GET /books/:id - Get book details by ID
  if (req.method === 'GET') {
    try {
      // Get book details
      const book = await BookModel.findById(bookId);

      if (!book) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      // Get reviews with pagination
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const reviewsResult = await ReviewModel.getByBookId(bookId, page, limit);

      res.status(200).json({
        book,
        reviews: reviewsResult.reviews,
        pagination: {
          total: reviewsResult.total,
          page,
          limit,
          totalPages: Math.ceil(reviewsResult.total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching book details:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

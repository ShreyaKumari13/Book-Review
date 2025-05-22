import { NextApiResponse } from 'next';
import { ReviewModel, ReviewInput } from '../../../../models/Review';
import { BookModel } from '../../../../models/Book';
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  const bookId = parseInt(id as string);

  if (isNaN(bookId)) {
    res.status(400).json({ error: 'Invalid book ID' });
    return;
  }

  // POST /books/:id/reviews - Submit a review (authenticated users only)
  if (req.method === 'POST') {
    try {
      const userId = parseInt(req.user!.userId);
      const { rating, comment } = req.body;

      // Validate rating
      if (!rating || isNaN(parseInt(rating)) || parseInt(rating) < 1 || parseInt(rating) > 5) {
        res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
        return;
      }

      // Check if book exists
      const book = await BookModel.findById(bookId);
      if (!book) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      // Check if user has already reviewed this book
      const hasReviewed = await ReviewModel.hasUserReviewedBook(userId, bookId);
      if (hasReviewed) {
        res.status(409).json({ error: 'You have already reviewed this book' });
        return;
      }

      // Create review
      const reviewInput: ReviewInput = {
        book_id: bookId,
        user_id: userId,
        rating: parseInt(rating),
        comment
      };

      const newReview = await ReviewModel.create(reviewInput);

      res.status(201).json({
        message: 'Review submitted successfully',
        review: newReview
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);

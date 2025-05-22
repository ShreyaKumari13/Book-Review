import { NextApiResponse } from 'next';
import { ReviewModel } from '../../../models/Review';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  const reviewId = parseInt(id as string);

  if (isNaN(reviewId)) {
    res.status(400).json({ error: 'Invalid review ID' });
    return;
  }

  const userId = parseInt(req.user!.userId);

  // PUT /reviews/:id - Update your own review
  if (req.method === 'PUT') {
    try {
      const { rating, comment } = req.body;

      // Validate rating if provided
      if (rating !== undefined) {
        const ratingNum = parseInt(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
          res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
          return;
        }
      }

      // Update review
      const updatedReview = await ReviewModel.update(reviewId, userId, {
        rating: rating ? parseInt(rating) : undefined,
        comment
      });

      if (!updatedReview) {
        res.status(404).json({ error: 'Review not found or you do not have permission to update it' });
        return;
      }

      res.status(200).json({
        message: 'Review updated successfully',
        review: updatedReview
      });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // DELETE /reviews/:id - Delete your own review
  else if (req.method === 'DELETE') {
    try {
      const success = await ReviewModel.delete(reviewId, userId);

      if (!success) {
        res.status(404).json({ error: 'Review not found or you do not have permission to delete it' });
        return;
      }

      res.status(200).json({
        message: 'Review deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }

  else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);

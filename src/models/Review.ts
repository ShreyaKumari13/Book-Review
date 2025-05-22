import { query } from '../lib/db';

export interface Review {
  id: number;
  book_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at?: Date;
  updated_at?: Date;
  user_name?: string;
}

export interface ReviewInput {
  book_id: number;
  user_id: number;
  rating: number;
  comment?: string;
}

export class ReviewModel {
  /**
   * Create a new review
   */
  static async create(reviewData: ReviewInput): Promise<Review> {
    const result = await query(
      `INSERT INTO reviews (book_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING id, book_id, user_id, rating, comment, created_at, updated_at`,
      [
        reviewData.book_id,
        reviewData.user_id,
        reviewData.rating,
        reviewData.comment || null
      ]
    );

    return result.rows[0];
  }

  /**
   * Update an existing review (only if it belongs to the user)
   */
  static async update(id: number, userId: number, data: { rating?: number; comment?: string }): Promise<Review | null> {
    // First check if the review exists and belongs to the user
    const checkResult = await query(
      'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return null;
    }

    // Build the update query
    const updateFields: string[] = [];
    const queryParams: any[] = [id, userId];
    let paramIndex = 3;

    if (data.rating !== undefined) {
      updateFields.push(`rating = $${paramIndex++}`);
      queryParams.push(data.rating);
    }

    if (data.comment !== undefined) {
      updateFields.push(`comment = $${paramIndex++}`);
      queryParams.push(data.comment);
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    if (updateFields.length === 0) {
      // Nothing to update
      return checkResult.rows[0];
    }

    const result = await query(
      `UPDATE reviews
       SET ${updateFields.join(', ')}
       WHERE id = $1 AND user_id = $2
       RETURNING id, book_id, user_id, rating, comment, created_at, updated_at`,
      queryParams
    );

    return result.rows[0];
  }

  /**
   * Update any review by ID (for testing purposes only)
   */
  static async updateAny(id: number, data: { rating?: number; comment?: string }): Promise<Review | null> {
    // First check if the review exists
    const checkResult = await query(
      'SELECT * FROM reviews WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return null;
    }

    // Build the update query
    const updateFields: string[] = [];
    const queryParams: any[] = [id];
    let paramIndex = 2;

    if (data.rating !== undefined) {
      updateFields.push(`rating = $${paramIndex++}`);
      queryParams.push(data.rating);
    }

    if (data.comment !== undefined) {
      updateFields.push(`comment = $${paramIndex++}`);
      queryParams.push(data.comment);
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    if (updateFields.length === 0) {
      // Nothing to update
      return checkResult.rows[0];
    }

    const result = await query(
      `UPDATE reviews
       SET ${updateFields.join(', ')}
       WHERE id = $1
       RETURNING id, book_id, user_id, rating, comment, created_at, updated_at`,
      queryParams
    );

    return result.rows[0];
  }

  /**
   * Delete a review
   */
  static async delete(id: number, userId: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    return result.rows.length > 0;
  }

  /**
   * Get reviews for a book with pagination
   */
  static async getByBookId(bookId: number, page: number = 1, limit: number = 10): Promise<{ reviews: Review[], total: number }> {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.book_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [bookId, limit, offset]
    );

    // Get total count for pagination
    const countResult = await query(
      'SELECT COUNT(*) FROM reviews WHERE book_id = $1',
      [bookId]
    );

    const total = parseInt(countResult.rows[0].count);

    return {
      reviews: result.rows,
      total
    };
  }

  /**
   * Check if a user has already reviewed a book
   */
  static async hasUserReviewedBook(userId: number, bookId: number): Promise<boolean> {
    const result = await query(
      'SELECT id FROM reviews WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );

    return result.rows.length > 0;
  }

  /**
   * Get a review by ID
   */
  static async findById(id: number): Promise<Review | null> {
    const result = await query(
      'SELECT * FROM reviews WHERE id = $1',
      [id]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

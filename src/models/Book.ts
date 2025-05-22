import { query } from '../lib/db';

export interface Book {
  id: number;
  title: string;
  author: string;
  genre?: string;
  description?: string;
  published_year?: number;
  created_at?: Date;
  created_by?: number;
  average_rating?: number;
}

export interface BookInput {
  title: string;
  author: string;
  genre?: string;
  description?: string;
  published_year?: number;
  created_by: number;
}

export interface BookSearchParams {
  author?: string;
  genre?: string;
  page?: number;
  limit?: number;
}

export class BookModel {
  /**
   * Create a new book
   */
  static async create(bookData: BookInput): Promise<Book> {
    const result = await query(
      `INSERT INTO books (title, author, genre, description, published_year, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, title, author, genre, description, published_year, created_at, created_by`,
      [
        bookData.title,
        bookData.author,
        bookData.genre || null,
        bookData.description || null,
        bookData.published_year || null,
        bookData.created_by
      ]
    );

    return result.rows[0];
  }

  /**
   * Find a book by ID with average rating
   */
  static async findById(id: number): Promise<Book | null> {
    const result = await query(
      `SELECT b.*, 
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
       FROM books b
       LEFT JOIN reviews r ON b.id = r.book_id
       WHERE b.id = $1
       GROUP BY b.id`,
      [id]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get all books with pagination and optional filters
   */
  static async findAll(params: BookSearchParams = {}): Promise<{ books: Book[], total: number }> {
    const { author, genre, page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;
    
    let queryStr = `
      SELECT b.*, 
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM books b
      LEFT JOIN reviews r ON b.id = r.book_id
    `;
    
    const queryParams: any[] = [];
    const whereConditions: string[] = [];
    
    if (author) {
      queryParams.push(`%${author}%`);
      whereConditions.push(`b.author ILIKE $${queryParams.length}`);
    }
    
    if (genre) {
      queryParams.push(`%${genre}%`);
      whereConditions.push(`b.genre ILIKE $${queryParams.length}`);
    }
    
    if (whereConditions.length > 0) {
      queryStr += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    queryStr += ` GROUP BY b.id ORDER BY b.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    const result = await query(queryStr, queryParams);
    
    // Get total count for pagination
    let countQueryStr = 'SELECT COUNT(*) FROM books b';
    if (whereConditions.length > 0) {
      countQueryStr += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    const countResult = await query(countQueryStr, queryParams.slice(0, whereConditions.length));
    const total = parseInt(countResult.rows[0].count);
    
    return {
      books: result.rows,
      total
    };
  }

  /**
   * Search books by title or author
   */
  static async search(searchTerm: string, page: number = 1, limit: number = 10): Promise<{ books: Book[], total: number }> {
    const offset = (page - 1) * limit;
    
    const queryStr = `
      SELECT b.*, 
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM books b
      LEFT JOIN reviews r ON b.id = r.book_id
      WHERE b.title ILIKE $1 OR b.author ILIKE $1
      GROUP BY b.id
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await query(queryStr, [`%${searchTerm}%`, limit, offset]);
    
    // Get total count for pagination
    const countResult = await query(
      'SELECT COUNT(*) FROM books WHERE title ILIKE $1 OR author ILIKE $1',
      [`%${searchTerm}%`]
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    return {
      books: result.rows,
      total
    };
  }
}

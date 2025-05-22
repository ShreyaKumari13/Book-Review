import { NextApiRequest, NextApiResponse } from 'next';
import { BookModel, BookInput } from '../../../models/Book';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';

// GET /books - Get all books with pagination and optional filters
// This endpoint is public and doesn't require authentication
async function getBooks(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { author, genre, page, limit } = req.query;

    const result = await BookModel.findAll({
      author: author as string | undefined,
      genre: genre as string | undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10
    });

    return res.status(200).json({
      books: result.books,
      pagination: {
        total: result.total,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        totalPages: Math.ceil(result.total / (limit ? parseInt(limit as string) : 10))
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

// POST /books - Add a new book (authenticated users only)
async function addBook(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { title, author, genre, description, published_year } = req.body;

    // Validate required fields
    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Create book input
    const bookInput: BookInput = {
      title,
      author,
      genre,
      description,
      published_year: published_year ? parseInt(published_year) : undefined,
      created_by: parseInt(req.user.userId)
    };

    // Create the book
    const newBook = await BookModel.create(bookInput);

    return res.status(201).json({
      message: 'Book created successfully',
      book: newBook
    });
  } catch (error) {
    console.error('Error creating book:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

// Protected handler for POST requests
const protectedHandler = withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    addBook(req, res);
    return;
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }
});

// Main handler that routes to the appropriate function based on the HTTP method
export default async function booksHandler(req: NextApiRequest | AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getBooks(req, res);
  } else if (req.method === 'POST') {
    // For POST requests, use the protected handler with authentication
    return protectedHandler(req as AuthenticatedRequest, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

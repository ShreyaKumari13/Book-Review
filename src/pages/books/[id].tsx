import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Book } from '../../models/Book';

interface BookDetails {
  book: Book;
  reviews: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function BookDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (id) {
      fetchBookDetails();
    }
  }, [id]);
  
  const fetchBookDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/books/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch book details');
      }
      
      const data = await response.json();
      setBookDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching book details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading book details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          <p>Error: {error}</p>
        </div>
        <Link href="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }
  
  if (!bookDetails) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded mb-4">
          <p>Book not found</p>
        </div>
        <Link href="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }
  
  const { book, reviews } = bookDetails;
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </Link>
        <span className="mx-2">|</span>
        <Link href="/search" className="text-blue-500 hover:underline">
          Search Books
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
        <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
        
        <div className="flex items-center mb-4">
          <div className="flex items-center mr-4">
            <span className="text-yellow-500 mr-1">★</span>
            <span>{book.average_rating ? book.average_rating.toFixed(1) : 'No ratings'}</span>
          </div>
          {book.genre && (
            <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
              {book.genre}
            </div>
          )}
          {book.published_year && (
            <div className="ml-3 text-sm text-gray-500">
              Published: {book.published_year}
            </div>
          )}
        </div>
        
        {book.description && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{book.description}</p>
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Reviews ({bookDetails.pagination.total})</h2>
        
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review this book!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className="flex items-center text-yellow-500 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                    <span className="font-semibold">{review.user_name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
        
        {bookDetails.pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/books/${id}?page=${Math.max(1, bookDetails.pagination.page - 1)}`)}
                disabled={bookDetails.pagination.page <= 1}
                className={`px-3 py-1 rounded ${
                  bookDetails.pagination.page <= 1 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Previous
              </button>
              
              <span className="text-gray-600">
                Page {bookDetails.pagination.page} of {bookDetails.pagination.totalPages}
              </span>
              
              <button
                onClick={() => router.push(`/books/${id}?page=${Math.min(bookDetails.pagination.totalPages, bookDetails.pagination.page + 1)}`)}
                disabled={bookDetails.pagination.page >= bookDetails.pagination.totalPages}
                className={`px-3 py-1 rounded ${
                  bookDetails.pagination.page >= bookDetails.pagination.totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Book } from '../models/Book';

interface SearchResults {
  books: Book[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function SearchPage() {
  const router = useRouter();
  const { q, page, limit } = router.query;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize search query from URL parameter
  useEffect(() => {
    if (q && typeof q === 'string') {
      setSearchQuery(q);
    }
  }, [q]);
  
  // Perform search when URL parameters change
  useEffect(() => {
    if (q) {
      performSearch();
    }
  }, [q, page, limit]);
  
  const performSearch = async () => {
    if (!q) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.append('q', q as string);
      
      if (page) {
        queryParams.append('page', page as string);
      }
      
      if (limit) {
        queryParams.append('limit', limit as string);
      }
      
      const response = await fetch(`/api/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search books');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    // Update URL with search parameters
    router.push({
      pathname: '/search',
      query: { q: searchQuery }
    });
  };
  
  const handlePageChange = (newPage: number) => {
    router.push({
      pathname: '/search',
      query: { 
        q: q,
        page: newPage,
        limit: limit || 10
      }
    });
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Book Search</h1>
      
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or author..."
            className="flex-grow p-2 border rounded"
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
      </form>
      
      {/* Search Results */}
      {results && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {results.pagination.total} {results.pagination.total === 1 ? 'result' : 'results'} for "{q}"
          </h2>
          
          {results.books.length === 0 ? (
            <p className="text-gray-500">No books found matching your search.</p>
          ) : (
            <div className="space-y-6">
              {results.books.map((book) => (
                <div key={book.id} className="border rounded p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold">{book.title}</h3>
                  <p className="text-gray-600">by {book.author}</p>
                  {book.genre && <p className="text-sm text-gray-500">Genre: {book.genre}</p>}
                  {book.published_year && <p className="text-sm text-gray-500">Published: {book.published_year}</p>}
                  {book.description && <p className="mt-2">{book.description}</p>}
                  <div className="mt-2 flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span>{book.average_rating ? book.average_rating.toFixed(1) : 'No ratings'}</span>
                  </div>
                  <Link href={`/books/${book.id}`} className="mt-3 inline-block text-blue-500 hover:underline">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {results.pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, (results.pagination.page - 1)))}
                  disabled={results.pagination.page <= 1}
                  className={`px-3 py-1 rounded ${
                    results.pagination.page <= 1 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Previous
                </button>
                
                <span className="text-gray-600">
                  Page {results.pagination.page} of {results.pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(Math.min(results.pagination.totalPages, (results.pagination.page + 1)))}
                  disabled={results.pagination.page >= results.pagination.totalPages}
                  className={`px-3 py-1 rounded ${
                    results.pagination.page >= results.pagination.totalPages
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
      )}
      
      {/* Back to Home */}
      <div className="mt-8">
        <Link href="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

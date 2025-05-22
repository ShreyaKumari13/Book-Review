import { useState } from 'react';

export default function ApiTestFull() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [token, setToken] = useState('');
  const [bookId, setBookId] = useState<number | null>(null);
  const [reviewId, setReviewId] = useState<number | null>(null);

  // User registration form state
  const [userForm, setUserForm] = useState({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  });

  // Book form state
  const [bookForm, setBookForm] = useState({
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Classic',
    description: 'A novel about the American Dream',
    published_year: '1925'
  });

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: '5',
    comment: 'This is an excellent book! Highly recommended.'
  });

  // Book list filters and pagination state
  const [bookListParams, setBookListParams] = useState({
    page: '1',
    limit: '10',
    author: '',
    genre: ''
  });

  // Book details input state
  const [bookDetailsInput, setBookDetailsInput] = useState({
    bookId: ''
  });

  // Handle user form input changes
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle book form input changes
  const handleBookFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle review form input changes
  const handleReviewFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle book list parameters changes
  const handleBookListParamsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookListParams(prev => ({ ...prev, [name]: value }));
  };

  // Handle book details input changes
  const handleBookDetailsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookDetailsInput(prev => ({ ...prev, [name]: value }));
  };

  // Add a result to the results array
  const addResult = (title: string, data: any) => {
    setResults(prev => [...prev, { title, data, timestamp: new Date().toISOString() }]);
  };

  // Clear results
  const clearResults = () => {
    setResults([]);
  };

  // Setup database
  const setupDatabase = async () => {
    setLoading(true);
    try {
      addResult('Setting up database...', null);

      const response = await fetch('/api/setup-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reset' }),
      });

      const data = await response.json();
      addResult('Database setup complete', data);
    } catch (error) {
      addResult('Database setup error', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  // Register a user
  const registerUser = async () => {
    setLoading(true);
    try {
      addResult('Registering user...', userForm);

      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      });

      const data = await response.json();
      addResult('User registration result', data);

      if (data.token) {
        setToken(data.token);
        addResult('Token saved', { token: data.token });
      }
    } catch (error) {
      addResult('Registration error', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async () => {
    setLoading(true);
    try {
      // Don't allow login if already logged in
      if (token) {
        addResult('Login skipped', { message: 'Already logged in. Please logout first.' });
        setLoading(false);
        return;
      }

      addResult('Logging in...', { email: userForm.email, password: userForm.password });

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userForm.email,
          password: userForm.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setToken(data.token);
        addResult('Login successful ✅', {
          message: `Logged in as ${userForm.email}`,
          user: data.user
        });
      } else {
        addResult('Login failed ❌', data);
      }
    } catch (error) {
      addResult('Login error', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      if (!token) {
        addResult('Logout error', { error: 'No token available. You must be logged in to logout.' });
        setLoading(false);
        return;
      }

      addResult('Logging out...', null);

      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      // Clear the token regardless of response
      setToken('');

      if (response.ok) {
        addResult('Logout successful ✅', {
          message: 'You have been logged out successfully',
          details: data
        });
      } else {
        addResult('Logout completed with issues', data);
      }
    } catch (error) {
      // Still clear the token even if there's an error
      setToken('');
      addResult('Logout error', {
        message: 'Logged out locally, but server request failed',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a single book
  const addBooks = async () => {
    setLoading(true);
    try {
      addResult('Adding book...', bookForm);

      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...bookForm,
          published_year: parseInt(bookForm.published_year)
        }),
      });

      const data = await response.json();
      addResult(`Added book: ${bookForm.title}`, data);

      // Save the book ID for later use
      if (data.book && data.book.id) {
        setBookId(data.book.id);
        addResult('Saved book ID for testing', { bookId: data.book.id });
      }
    } catch (error) {
      addResult('Error adding book', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  // Get all books with pagination and filters
  const getBooks = async () => {
    setLoading(true);
    try {
      // Build query string with pagination and filter parameters
      const queryParams = new URLSearchParams();

      if (bookListParams.page) {
        queryParams.append('page', bookListParams.page);
      }

      if (bookListParams.limit) {
        queryParams.append('limit', bookListParams.limit);
      }

      if (bookListParams.author) {
        queryParams.append('author', bookListParams.author);
      }

      if (bookListParams.genre) {
        queryParams.append('genre', bookListParams.genre);
      }

      const queryString = queryParams.toString();
      const url = `/api/books${queryString ? `?${queryString}` : ''}`;

      addResult('Getting books with parameters...', bookListParams);

      const response = await fetch(url);
      const data = await response.json();

      addResult('Books result', data);
    } catch (error) {
      addResult('Error getting books', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  // Get a specific book or all books if no ID is provided
  const getBook = async () => {
    // Use the input field value if provided, otherwise fall back to the stored bookId
    const idToUse = bookDetailsInput.bookId ? parseInt(bookDetailsInput.bookId) : bookId;

    setLoading(true);
    try {
      if (!idToUse) {
        // If no ID is provided, get all books instead
        addResult('No specific book ID provided. Getting all books...', null);

        const response = await fetch('/api/books');
        const data = await response.json();

        addResult('All books (no specific ID provided)', data);

        // Make it clear in the UI that we're showing all books
        // We don't update the bookId state here since we're not selecting a specific book
      } else {
        // Get specific book by ID
        addResult(`Getting book with ID ${idToUse}...`, null);

        const response = await fetch(`/api/books/${idToUse}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to get book with ID ${idToUse}`);
        }

        const data = await response.json();

        // If using the input field and the request was successful, update the stored bookId
        if (bookDetailsInput.bookId && data.book) {
          setBookId(idToUse);
          addResult('Updated stored book ID', { bookId: idToUse });
        }

        addResult(`Book details for ID ${idToUse}`, data);
      }
    } catch (error) {
      addResult('Error getting book', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  // Add a review
  const addReview = async () => {
    if (!bookId) {
      addResult('Cannot add review', { error: 'No book ID available' });
      return;
    }

    setLoading(true);
    try {
      addResult(`Adding review for book ID ${bookId}...`, reviewForm);

      const response = await fetch(`/api/books/${bookId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: parseInt(reviewForm.rating),
          comment: reviewForm.comment,
        }),
      });

      const data = await response.json();
      addResult('Review added', data);

      if (data.review && data.review.id) {
        setReviewId(data.review.id);
        addResult('Saved review ID for testing', { reviewId: data.review.id });
      }
    } catch (error) {
      addResult('Error adding review', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  // Update a review
  const updateReview = async () => {
    if (!reviewId) {
      addResult('Cannot update review', { error: 'No review ID available' });
      return;
    }

    setLoading(true);
    try {
      // Create updated review data
      const updatedReview = {
        rating: parseInt(reviewForm.rating),
        comment: `Updated: ${reviewForm.comment}`
      };

      addResult(`Updating review with ID ${reviewId}...`, updatedReview);

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedReview),
      });

      const data = await response.json();
      addResult('Review updated', data);
    } catch (error) {
      addResult('Error updating review', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  // Search for books
  const searchBooks = async () => {
    setLoading(true);
    try {
      addResult('Searching for books with "Gatsby"...', null);

      const response = await fetch('/api/search?q=Gatsby');
      const data = await response.json();

      addResult('Search results for "Gatsby"', data);
    } catch (error) {
      addResult('Error searching books', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  // Delete a review
  const deleteReview = async () => {
    if (!reviewId) {
      addResult('Cannot delete review', { error: 'No review ID available' });
      return;
    }

    setLoading(true);
    try {
      addResult(`Deleting review with ID ${reviewId}...`, null);

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      addResult('Review deleted', data);
      setReviewId(null);
    } catch (error) {
      addResult('Error deleting review', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    clearResults();
    addResult('Starting automated test sequence with current form values', {
      user: userForm,
      book: bookForm,
      review: reviewForm
    });

    await setupDatabase();
    await registerUser();
    await login();
    await addBooks();
    await getBooks();
    await getBook();
    await addReview();
    await getBook(); // Get book again to see the review
    await updateReview();
    await getBook(); // Get book again to see the updated review
    await searchBooks();
    await deleteReview();
    await getBook(); // Get book again to confirm review is deleted
    await logout(); // Test logout functionality
    addResult('All tests completed', { success: true });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Book Review API Full Test</h1>

      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Test Controls</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={runAllTests}
            disabled={loading}
          >
            Run All Tests
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={clearResults}
            disabled={loading}
          >
            Clear Results
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Test buttons */}
          <div className="grid grid-cols-1 gap-2">

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={registerUser}
              disabled={loading}
            >
              1. Register User
            </button>
            <button
              className={`${token ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded flex items-center justify-center`}
              onClick={login}
              disabled={loading || !!token}
            >
              <span className="mr-2">2. Login</span>
              {!token && !loading && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm5 10V7l5 3-5 3z" clipRule="evenodd" />
              </svg>}
              {token && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>}
            </button>
            <button
              className={`${!token ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} text-white px-4 py-2 rounded flex items-center justify-center`}
              onClick={logout}
              disabled={loading || !token}
            >
              <span className="mr-2">2a. Logout</span>
              {token && !loading && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd" />
              </svg>}
            </button>
            <button
              className={`${!token ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded flex items-center justify-center`}
              onClick={addBooks}
              disabled={loading || !token}
            >
              <span className="mr-2">3. Add Book</span>
              {!token && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">Login Required</span>}
              {token && !loading && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                <path d="M8 11a1 1 0 100 2h4a1 1 0 100-2H8z" />
                <path d="M8 8a1 1 0 100 2h4a1 1 0 100-2H8z" />
              </svg>}
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={getBooks}
              disabled={loading}
            >
              4. Get Books (with filters)
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center"
              onClick={getBook}
              disabled={loading}
            >
              <span className="mr-2">5. Get Book{(bookId || bookDetailsInput.bookId) ? ' Details' : 's'}</span>
              {(bookId || bookDetailsInput.bookId) && (
                <span className="text-xs bg-blue-700 text-white px-2 py-0.5 rounded-full">
                  ID: {bookDetailsInput.bookId || bookId}
                </span>
              )}
              {!bookId && !bookDetailsInput.bookId && (
                <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">
                  GET /books (All Books)
                </span>
              )}
            </button>
            <button
              className={`${!token || !bookId ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded flex items-center justify-center`}
              onClick={addReview}
              disabled={loading || !token || !bookId}
            >
              <span className="mr-2">6. Add Review</span>
              {!token && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">Login Required</span>}
              {!bookId && token && <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full">Book ID Required</span>}
              {token && bookId && !loading && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>}
            </button>
            <button
              className={`${!token || !reviewId ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded flex items-center justify-center`}
              onClick={updateReview}
              disabled={loading || !token || !reviewId}
            >
              <span className="mr-2">7. Update Review</span>
              {!token && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">Login Required</span>}
              {!reviewId && token && <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full">Review ID Required</span>}
              {token && reviewId && !loading && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>}
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={searchBooks}
              disabled={loading}
            >
              8. Search Books
            </button>
            <button
              className={`${!token || !reviewId ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} text-white px-4 py-2 rounded flex items-center justify-center`}
              onClick={deleteReview}
              disabled={loading || !token || !reviewId}
            >
              <span className="mr-2">9. Delete Review</span>
              {!token && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">Login Required</span>}
              {!reviewId && token && <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full">Review ID Required</span>}
              {token && reviewId && !loading && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>}
            </button>
          </div>

          {/* Right column - Forms */}
          <div className="space-y-6">
            {/* User Registration Form */}
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">User Registration/Login Details</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={userForm.name}
                    onChange={handleUserFormChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={userForm.email}
                    onChange={handleUserFormChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={userForm.password}
                    onChange={handleUserFormChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>

            {/* Book Form */}
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Book Details</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={bookForm.title}
                    onChange={handleBookFormChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Author</label>
                  <input
                    type="text"
                    name="author"
                    value={bookForm.author}
                    onChange={handleBookFormChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={bookForm.genre}
                    onChange={handleBookFormChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Description</label>
                  <textarea
                    name="description"
                    value={bookForm.description}
                    onChange={handleBookFormChange}
                    className="w-full p-2 border rounded"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Published Year</label>
                  <input
                    type="number"
                    name="published_year"
                    value={bookForm.published_year}
                    onChange={handleBookFormChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>

            {/* Review Form */}
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Review Details</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    name="rating"
                    value={reviewForm.rating}
                    onChange={handleReviewFormChange}
                    min="1"
                    max="5"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Comment</label>
                  <textarea
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleReviewFormChange}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Book Details Input */}
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Book Details Input</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm mb-1">Book ID (for "Get Book Details") - Optional</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      name="bookId"
                      value={bookDetailsInput.bookId}
                      onChange={handleBookDetailsInputChange}
                      min="1"
                      placeholder={bookId ? `Current: ${bookId}` : "Enter book ID or leave empty for all books"}
                      className="w-full p-2 border rounded"
                    />
                    {bookId && (
                      <div className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Current: {bookId}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      Enter a book ID to fetch specific book details, leave empty to use the current book ID, or leave empty with no current ID to get all books.
                    </p>
                    <button
                      onClick={() => {
                        setBookDetailsInput({...bookDetailsInput, bookId: ''});
                        setBookId(null);
                      }}
                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded ml-2"
                    >
                      Clear ID
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Book List Parameters */}
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Book List Parameters</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm mb-1">Page</label>
                    <input
                      type="number"
                      name="page"
                      value={bookListParams.page}
                      onChange={handleBookListParamsChange}
                      min="1"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Limit</label>
                    <input
                      type="number"
                      name="limit"
                      value={bookListParams.limit}
                      onChange={handleBookListParamsChange}
                      min="1"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Filter by Author</label>
                  <input
                    type="text"
                    name="author"
                    value={bookListParams.author}
                    onChange={handleBookListParamsChange}
                    placeholder="Enter author name"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Filter by Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={bookListParams.genre}
                    onChange={handleBookListParamsChange}
                    placeholder="Enter genre"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-yellow-700">Processing... Please wait.</p>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Current State</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-3 border rounded ${token ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
            <div className="flex justify-between items-center mb-1">
              <p className="font-semibold">Authentication Status:</p>
              {token ? (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Logged In</span>
              ) : (
                <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">Logged Out</span>
              )}
            </div>
            <p className="text-xs break-all bg-gray-100 p-2 rounded overflow-auto max-h-20">
              {token ? token : 'No token - Please login'}
            </p>
          </div>
          <div className="p-3 border rounded">
            <p className="font-semibold">Book ID:</p>
            <p className="text-sm">{bookId || 'None'}</p>
          </div>
          <div className="p-3 border rounded">
            <p className="font-semibold">Review ID:</p>
            <p className="text-sm">{reviewId || 'None'}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Test Results ({results.length})</h2>
        {results.length === 0 ? (
          <p className="text-gray-500">No results yet. Run tests to see results here.</p>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{result.title}</h3>
                  <span className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleTimeString()}</span>
                </div>
                {result.data === null ? (
                  <p className="italic text-gray-600">Processing...</p>
                ) : (
                  <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-60 text-sm">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

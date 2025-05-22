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

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Review details input state
  const [reviewDetailsInput, setReviewDetailsInput] = useState({
    reviewId: ''
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

  // Handle search query input change
  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle review details input changes
  const handleReviewDetailsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setReviewDetailsInput(prev => ({ ...prev, [name]: value }));
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

      addResult('Getting books with parameters...', {
        ...bookListParams,
        endpoint: url,
        method: 'GET'
      });

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get books');
      }

      const data = await response.json();

      // Display information about the books without automatically selecting one
      if (data.books && data.books.length > 0) {
        addResult('Books found', {
          count: data.books.length,
          message: 'To add a review, please enter a specific book ID in the Book Details Input field or click on a specific book'
        });
      } else {
        addResult('No books found', {
          message: 'Please add books first before trying to add reviews'
        });
      }

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

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get books');
        }

        const data = await response.json();

        // Display information about the books without automatically selecting one
        if (data.books && data.books.length > 0) {
          addResult('Books found', {
            count: data.books.length,
            message: 'To add a review, please enter a specific book ID in the Book Details Input field or click on a specific book'
          });
        } else {
          addResult('No books found', {
            message: 'Please add books first before trying to add reviews'
          });
        }

        addResult('All books (no specific ID provided)', data);
      } else {
        // Get specific book by ID
        addResult(`Getting book with ID ${idToUse}...`, null);

        const response = await fetch(`/api/books/${idToUse}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to get book with ID ${idToUse}`);
        }

        const data = await response.json();

        // Always update the stored bookId when successfully fetching a specific book
        // This ensures the bookId state is always in sync with what we're viewing
        if (data.book) {
          setBookId(idToUse);

          // Only log if we're changing the ID
          if (bookId !== idToUse) {
            addResult('Updated stored book ID for review operations', {
              bookId: idToUse,
              message: 'You can now add reviews to this book'
            });
          }
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
    // Use the book ID from the input field if available, otherwise use the stored bookId
    const idToUse = bookDetailsInput.bookId ? parseInt(bookDetailsInput.bookId) : bookId;

    if (!idToUse) {
      addResult('Cannot add review', {
        error: 'No book ID available',
        message: 'Please enter a book ID in the Book Details Input field or select a specific book first'
      });
      return;
    }

    if (!token) {
      addResult('Cannot add review', {
        error: 'Not authenticated',
        message: 'Please login first'
      });
      return;
    }

    // Update the stored bookId to match what we're using
    if (bookId !== idToUse) {
      setBookId(idToUse);
      addResult('Updated book ID for review', {
        bookId: idToUse,
        message: 'Using the book ID from the input field'
      });
    }

    setLoading(true);
    try {
      // Validate review data
      const ratingNum = parseInt(reviewForm.rating);
      if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      if (!reviewForm.comment.trim()) {
        throw new Error('Comment cannot be empty');
      }

      addResult(`Adding review for book ID ${idToUse}...`, {
        endpoint: `/api/books/${idToUse}/reviews`,
        method: 'POST',
        data: {
          rating: parseInt(reviewForm.rating),
          comment: reviewForm.comment
        }
      });

      const response = await fetch(`/api/books/${idToUse}/reviews`, {
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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add review');
      }

      addResult('Review added successfully ✅', data);

      if (data.review && data.review.id) {
        setReviewId(data.review.id);
        // Update the review ID input field to match the new review ID
        setReviewDetailsInput({...reviewDetailsInput, reviewId: data.review.id.toString()});
        addResult('Saved review ID for update/delete operations', {
          reviewId: data.review.id,
          message: 'You can now update or delete this review'
        });
      }
    } catch (error) {
      addResult('Error adding review', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  // Update a review
  const updateReview = async () => {
    // Check if we have a book ID but no review ID
    const bookIdToUse = bookDetailsInput.bookId ? parseInt(bookDetailsInput.bookId) : bookId;
    let idToUse = reviewDetailsInput.reviewId ? parseInt(reviewDetailsInput.reviewId) : reviewId;

    if (!token) {
      addResult('Cannot update review', {
        error: 'Not authenticated',
        message: 'Please login first'
      });
      return;
    }

    // If we have a book ID but no review ID, try to find the review ID for this book
    if (bookIdToUse && !idToUse) {
      addResult('Looking up review ID for book', {
        bookId: bookIdToUse,
        message: 'Attempting to find your review for this book'
      });

      try {
        // First, get the book details which should include reviews
        const response = await fetch(`/api/books/${bookIdToUse}`);

        if (!response.ok) {
          throw new Error(`Failed to get book with ID ${bookIdToUse}`);
        }

        const data = await response.json();

        if (data.book && data.book.reviews && data.book.reviews.length > 0) {
          // Find the first review by the current user
          const userReview = data.book.reviews.find((review: any) => review.user_id === data.currentUser?.id);

          if (userReview) {
            idToUse = userReview.id;
            setReviewId(idToUse);
            addResult('Found review ID for book', {
              bookId: bookIdToUse,
              reviewId: idToUse,
              message: 'Successfully found your review for this book'
            });
          } else {
            addResult('No review found for this book', {
              bookId: bookIdToUse,
              message: 'You have not reviewed this book yet. Please add a review first.'
            });
            return;
          }
        } else {
          addResult('No reviews found for this book', {
            bookId: bookIdToUse,
            message: 'This book has no reviews yet. Please add a review first.'
          });
          return;
        }
      } catch (error) {
        addResult('Error finding review for book', {
          error: error instanceof Error ? error.message : String(error),
          bookId: bookIdToUse
        });
        return;
      }
    }

    if (!idToUse) {
      addResult('Cannot update review', {
        error: 'No review ID available',
        message: 'Please enter a review ID in the Review Details Input field, or a book ID to find your review for that book'
      });
      return;
    }

    // Update the stored reviewId to match what we're using
    if (reviewId !== idToUse) {
      setReviewId(idToUse);
      addResult('Updated review ID for operation', {
        reviewId: idToUse,
        message: 'Using the review ID from the input field or found from book ID'
      });
    }

    setLoading(true);
    try {
      // Validate review data
      const ratingNum = parseInt(reviewForm.rating);
      if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      if (!reviewForm.comment.trim()) {
        throw new Error('Comment cannot be empty');
      }

      // Create updated review data
      const updatedReview = {
        rating: ratingNum,
        comment: `Updated: ${reviewForm.comment}`
      };

      addResult(`Updating review with ID ${idToUse}...`, {
        endpoint: `/api/reviews/${idToUse}`,
        method: 'PUT',
        data: updatedReview
      });

      const response = await fetch(`/api/reviews/${idToUse}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedReview),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update review');
      }

      addResult('Review updated successfully ✅', data);

      // Update the input field to match the current review ID
      if (reviewDetailsInput.reviewId !== idToUse.toString()) {
        setReviewDetailsInput({...reviewDetailsInput, reviewId: idToUse.toString()});
      }
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
      // Use the search query from state, or default to "Gatsby" if empty
      const query = searchQuery.trim() || "Gatsby";

      addResult(`Searching for books with "${query}"...`, null);

      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      addResult(`Search results for "${query}"`, data);
    } catch (error) {
      addResult('Error searching books', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  // Delete a review
  const deleteReview = async () => {
    // Check if we have a book ID but no review ID
    const bookIdToUse = bookDetailsInput.bookId ? parseInt(bookDetailsInput.bookId) : bookId;
    let idToUse = reviewDetailsInput.reviewId ? parseInt(reviewDetailsInput.reviewId) : reviewId;

    if (!token) {
      addResult('Cannot delete review', {
        error: 'Not authenticated',
        message: 'Please login first'
      });
      return;
    }

    // If we have a book ID but no review ID, try to find the review ID for this book
    if (bookIdToUse && !idToUse) {
      addResult('Looking up review ID for book', {
        bookId: bookIdToUse,
        message: 'Attempting to find your review for this book'
      });

      try {
        // First, get the book details which should include reviews
        const response = await fetch(`/api/books/${bookIdToUse}`);

        if (!response.ok) {
          throw new Error(`Failed to get book with ID ${bookIdToUse}`);
        }

        const data = await response.json();

        if (data.book && data.book.reviews && data.book.reviews.length > 0) {
          // Find the first review by the current user
          const userReview = data.book.reviews.find((review: any) => review.user_id === data.currentUser?.id);

          if (userReview) {
            idToUse = userReview.id;
            setReviewId(idToUse);
            addResult('Found review ID for book', {
              bookId: bookIdToUse,
              reviewId: idToUse,
              message: 'Successfully found your review for this book'
            });
          } else {
            addResult('No review found for this book', {
              bookId: bookIdToUse,
              message: 'You have not reviewed this book yet. Please add a review first.'
            });
            return;
          }
        } else {
          addResult('No reviews found for this book', {
            bookId: bookIdToUse,
            message: 'This book has no reviews yet. Please add a review first.'
          });
          return;
        }
      } catch (error) {
        addResult('Error finding review for book', {
          error: error instanceof Error ? error.message : String(error),
          bookId: bookIdToUse
        });
        return;
      }
    }

    if (!idToUse) {
      addResult('Cannot delete review', {
        error: 'No review ID available',
        message: 'Please enter a review ID in the Review Details Input field, or a book ID to find your review for that book'
      });
      return;
    }

    // Update the stored reviewId to match what we're using
    if (reviewId !== idToUse) {
      setReviewId(idToUse);
      addResult('Updated review ID for operation', {
        reviewId: idToUse,
        message: 'Using the review ID from the input field or found from book ID'
      });
    }

    setLoading(true);
    try {
      addResult(`Deleting review with ID ${idToUse}...`, {
        endpoint: `/api/reviews/${idToUse}`,
        method: 'DELETE'
      });

      const response = await fetch(`/api/reviews/${idToUse}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete review');
      }

      addResult('Review deleted successfully ✅', data);

      // Clear both the stored review ID and the input field since the review no longer exists
      setReviewId(null);
      setReviewDetailsInput({...reviewDetailsInput, reviewId: ''});

      // Also clear the book ID if we used it to find the review
      if (!reviewDetailsInput.reviewId && bookIdToUse) {
        setBookDetailsInput({...bookDetailsInput, bookId: ''});
        setBookId(null);
        addResult('Cleared book ID', {
          message: 'The book ID has been cleared since the review has been deleted'
        });
      }

      addResult('Cleared review ID', {
        message: 'The review ID has been cleared since the review no longer exists'
      });
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

    // For the automated test, we need to explicitly get a specific book
    // to ensure we have a book ID for the review operations
    if (!bookId && !bookDetailsInput.bookId) {
      addResult('Setting up book ID for automated test', {
        message: 'Getting the first book to use for review operations'
      });

      try {
        const response = await fetch('/api/books');
        const data = await response.json();

        if (data.books && data.books.length > 0) {
          const firstBookId = data.books[0].id;
          setBookId(firstBookId);
          addResult('Selected first book for automated test', { bookId: firstBookId });
        } else {
          addResult('Warning: No books found for automated test', {
            message: 'Review operations may fail'
          });
        }
      } catch (error) {
        addResult('Error setting up book ID for automated test', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

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
              className={`${!token || (!bookId && !bookDetailsInput.bookId) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded flex items-center justify-center relative`}
              onClick={addReview}
              disabled={loading || !token || (!bookId && !bookDetailsInput.bookId)}
            >
              <span className="mr-2">6. Add Review</span>
              {!token && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">Login Required</span>}
              {!bookId && !bookDetailsInput.bookId && token && <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full">Book ID Required</span>}
              {token && (bookId || bookDetailsInput.bookId) && !loading && (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                  <span className="absolute -top-1 -right-1 text-xs bg-blue-700 text-white px-2 py-0.5 rounded-full">
                    POST /books/{bookDetailsInput.bookId || bookId}/reviews
                  </span>
                </>
              )}
            </button>
            <button
              className={`${!token || (!reviewId && !reviewDetailsInput.reviewId && !bookId && !bookDetailsInput.bookId) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded flex items-center justify-center relative`}
              onClick={updateReview}
              disabled={loading || !token || (!reviewId && !reviewDetailsInput.reviewId && !bookId && !bookDetailsInput.bookId)}
            >
              <span className="mr-2">7. Update Review</span>
              {!token && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">Login Required</span>}
              {!reviewId && !reviewDetailsInput.reviewId && !bookId && !bookDetailsInput.bookId && token &&
                <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full">Review ID or Book ID Required</span>
              }
              {token && (reviewId || reviewDetailsInput.reviewId || bookId || bookDetailsInput.bookId) && !loading && (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  {(reviewId || reviewDetailsInput.reviewId) ? (
                    <span className="absolute -top-1 -right-1 text-xs bg-blue-700 text-white px-2 py-0.5 rounded-full">
                      PUT /reviews/{reviewDetailsInput.reviewId || reviewId}
                    </span>
                  ) : (
                    <span className="absolute -top-1 -right-1 text-xs bg-blue-700 text-white px-2 py-0.5 rounded-full">
                      Using Book ID: {bookDetailsInput.bookId || bookId}
                    </span>
                  )}
                </>
              )}
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={searchBooks}
              disabled={loading}
            >
              8. Search Books
            </button>
            <button
              className={`${!token || (!reviewId && !reviewDetailsInput.reviewId && !bookId && !bookDetailsInput.bookId) ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} text-white px-4 py-2 rounded flex items-center justify-center relative`}
              onClick={deleteReview}
              disabled={loading || !token || (!reviewId && !reviewDetailsInput.reviewId && !bookId && !bookDetailsInput.bookId)}
            >
              <span className="mr-2">9. Delete Review</span>
              {!token && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">Login Required</span>}
              {!reviewId && !reviewDetailsInput.reviewId && !bookId && !bookDetailsInput.bookId && token &&
                <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full">Review ID or Book ID Required</span>
              }
              {token && (reviewId || reviewDetailsInput.reviewId || bookId || bookDetailsInput.bookId) && !loading && (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {(reviewId || reviewDetailsInput.reviewId) ? (
                    <span className="absolute -top-1 -right-1 text-xs bg-blue-700 text-white px-2 py-0.5 rounded-full">
                      DELETE /reviews/{reviewDetailsInput.reviewId || reviewId}
                    </span>
                  ) : (
                    <span className="absolute -top-1 -right-1 text-xs bg-blue-700 text-white px-2 py-0.5 rounded-full">
                      Using Book ID: {bookDetailsInput.bookId || bookId}
                    </span>
                  )}
                </>
              )}
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
            <div className="border p-4 rounded mb-4">
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

            {/* Review Details Input */}
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Review Details Input</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm mb-1">Review ID (for "Update/Delete Review") - Optional</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      name="reviewId"
                      value={reviewDetailsInput.reviewId}
                      onChange={handleReviewDetailsInputChange}
                      min="1"
                      placeholder={reviewId ? `Current: ${reviewId}` : "Enter review ID for update/delete"}
                      className="w-full p-2 border rounded"
                    />
                    {reviewId && (
                      <div className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Current: {reviewId}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      Enter a review ID to update or delete a specific review, or leave empty to use the current review ID.
                    </p>
                    <button
                      onClick={() => {
                        setReviewDetailsInput({...reviewDetailsInput, reviewId: ''});
                        setReviewId(null);
                      }}
                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded ml-2"
                    >
                      Clear ID
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800">New Feature!</h4>
                <p className="text-xs text-blue-700 mt-1">
                  You can now use either a Review ID or a Book ID to update/delete reviews. If you provide a Book ID (in the Book Details Input above)
                  but no Review ID, the system will automatically find your review for that book.
                </p>
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

            {/* Search Parameters */}
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Search Books</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm mb-1">Search Query (Title or Author)</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchQueryChange}
                    placeholder="Enter search term (e.g., Gatsby, Fitzgerald)"
                    className="w-full p-2 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Search is case-insensitive and will match partial words in both title and author fields.
                  </p>
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

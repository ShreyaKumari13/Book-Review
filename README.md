# Book Review API Project Testing

A full-featured Book Review application built with Next.js, PostgreSQL, and TypeScript. This application allows users to register, login, add books, write reviews, and search for books.

## Live Demo

The application is deployed and can be accessed at:
[https://book-review-phi-ochre.vercel.app](https://book-review-phi-ochre.vercel.app)

## Features

- User authentication (register, login, logout)
- Book management (add, view, search)
- Review system (add, update, delete reviews)
- API testing interface
- JWT-based authentication
- PostgreSQL database
- Responsive design

## Project Structure

```
book-review/
├── lib/            # Utility functions and middleware
├── models/         # Database models
├── pages/          # Next.js pages and API routes
│   ├── api/        # API endpoints
│   └── ...         # Frontend pages
├── public/         # Static assets
├── styles/         # CSS styles
└── ...
```

## Database Schema

The application uses a PostgreSQL database with the following schema:

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Books Table
```sql
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  description TEXT,
  published_year INTEGER,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd book-review
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/book_review

# JWT
JWT_SECRET=your_jwt_secret_key

# Optional: Set to 'development' or 'production'
NODE_ENV=development
```

### 4. Set up the database

Create a PostgreSQL database and run the following SQL commands to set up the tables:

```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create books table
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  description TEXT,
  published_year INTEGER,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## API Endpoints

### Authentication

#### Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

### Books

#### Get all books
```bash
curl -X GET http://localhost:3000/api/books
```

#### Get a specific book
```bash
curl -X GET http://localhost:3000/api/books/1
```

#### Add a new book (requires authentication)
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "genre": "Classic", "description": "A novel about the American Dream", "published_year": 1925}'
```

#### Search books
```bash
curl -X GET "http://localhost:3000/api/search?q=gatsby"
```

### Reviews

#### Get reviews for a book
```bash
curl -X GET http://localhost:3000/api/books/1
```

#### Add a review (requires authentication)
```bash
curl -X POST http://localhost:3000/api/books/1/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"rating": 5, "comment": "This is an excellent book! Highly recommended."}'
```

#### Update a review (requires authentication)
```bash
curl -X PUT http://localhost:3000/api/reviews/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"rating": 4, "comment": "This is a very good book."}'
```

#### Delete a review (requires authentication)
```bash
curl -X DELETE http://localhost:3000/api/reviews/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing the API

The application includes a built-in API testing interface at `/api-test-full`. This page allows you to:

1. Register and login users
2. Add and view books
3. Add, update, and delete reviews
4. Search for books

## Design Decisions and Assumptions

1. **Authentication**: JWT-based authentication is used for simplicity and statelessness. Tokens expire after 7 days.

2. **Database**: PostgreSQL is used for its robustness and support for complex queries. The schema is designed to support the core features while maintaining data integrity through foreign key constraints.

3. **API Design**: RESTful API design principles are followed for consistency and ease of use.

4. **Error Handling**: Comprehensive error handling is implemented to provide meaningful error messages to clients.

5. **Testing**: The application includes a built-in testing interface to facilitate API testing without external tools.

6. **Security**: Passwords are hashed before storage, and authentication is required for sensitive operations.

7. **Assumptions**:
   - Users can only update or delete their own reviews (except in the testing interface)
   - Books can have multiple reviews, but a user can only review a book once
   - Rating is on a scale of 1-5
   - The application is primarily an API with a simple frontend for demonstration

## Future Improvements

- Add pagination for books and reviews
- Implement more advanced search functionality
- Add user profiles and admin dashboard
- Implement rate limiting for API endpoints
- Add more comprehensive test coverage
- Enhance the UI/UX

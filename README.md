# Dubai Listings API

A comprehensive real estate listing API for Dubai properties with JWT authentication and MongoDB.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [API Documentation](#api-documentation)
- [Running Tests](#running-tests)
- [Code Quality](#code-quality)
- [Deployment](#deployment)
- [Security](#security)
- [License](#license)

## Features

- **User Management**

  - Registration and authentication (JWT)
  - Role-based access control (Admin/User)
  - Password reset via email
  - Profile management

- **Property Listings**

  - Create, read, update, and delete property listings
  - Advanced filtering and searching
  - Image uploads with local storage
  - Image processing and optimization
  - Property categorization

- **Reviews & Ratings**

  - Users can leave reviews and ratings
  - Average rating calculation
  - Review moderation

- **Security**

  - Rate limiting
  - Data sanitization
  - XSS protection
  - HTTP security headers
  - Request validation

- **Developer Experience**
  - API documentation with Swagger
  - Comprehensive test coverage
  - ESLint and Prettier for code quality
  - Husky pre-commit hooks

## Tech Stack

- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint, Prettier
- **File Uploads**: Multer with Sharp for image processing
- **Email**: Nodemailer

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/           # Database models
├── public/           # Static files
├── routes/           # Route definitions
├── utils/            # Utility functions
├── views/            # Template files
├── app.js            # Express application
└── server.js         # Server entry point
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn
- Cloudinary account (for image uploads)
- SMTP email service (for notifications)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/dubai-listings-api.git
   cd dubai-listings-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the example environment file and update the values:

   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server
NODE_ENV=development
PORT=8000

# Database
MONGODB_URI=mongodb://localhost:27017/dubai-listings

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=your_email_username
EMAIL_PASSWORD=your_email_password
EMAIL_FROM='Dubai Listings <noreply@dubailistings.com>'

# File Uploads
MAX_FILE_UPLOAD=10000000  # 10MB
UPLOAD_PATH=./public/uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour in milliseconds
RATE_LIMIT_MAX_REQUESTS=100   # limit each IP to 100 requests per window
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/forgot-password` - Forgot password
- `PATCH /api/v1/auth/reset-password/:token` - Reset password
- `PATCH /api/v1/auth/update-password` - Update password (authenticated)

### Users

- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/:id` - Get single user
- `PATCH /api/v1/users/update-me` - Update current user
- `DELETE /api/v1/users/delete-me` - Delete current user

### Properties

- `GET /api/v1/properties` - Get all properties
- `GET /api/v1/properties/:id` - Get single property
- `POST /api/v1/properties` - Create new property (authenticated)
- `PATCH /api/v1/properties/:id` - Update property (owner or admin)
- `DELETE /api/v1/properties/:id` - Delete property (owner or admin)

### Reviews

- `GET /api/v1/reviews` - Get all reviews
- `GET /api/v1/reviews/:id` - Get single review
- `POST /api/v1/properties/:propertyId/reviews` - Create new review (authenticated)
- `PATCH /api/v1/reviews/:id` - Update review (owner or admin)
- `DELETE /api/v1/reviews/:id` - Delete review (owner or admin)

## API Documentation

Interactive API documentation is available at `/api-docs` when running the server in development mode. The OpenAPI specification is available at `/docs.json`.

## Running Tests

To run tests:

```bash
npm test
```

## Deployment

1. Set `NODE_ENV` to `production` in your environment variables
2. Update the database connection string and other production-specific settings
3. Install production dependencies:
   ```bash
   npm install --production
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a new branch for your feature (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc.

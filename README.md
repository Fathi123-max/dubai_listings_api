# Dubai Listings API

A comprehensive real estate listing API for Dubai properties with user authentication, property management, and review system.

## Features

- **User Authentication**
  - Signup, login, and password reset functionality
  - Role-based access control (user, agent, admin)
  - JWT authentication
  - Password reset via email

- **Property Management**
  - CRUD operations for properties
  - Filter, sort, and paginate properties
  - Property search within a radius
  - Image upload for properties

- **Reviews & Ratings**
  - Users can leave reviews and ratings
  - Average rating calculation
  - Review management

- **Security**
  - Data sanitization
  - XSS protection
  - Rate limiting
  - Secure HTTP headers
  - Parameter pollution prevention

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Upload**: Multer with Sharp for image processing
- **Validation**: Joi
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize, xss-clean, hpp
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Supertest
- **Linting/Formatting**: ESLint, Prettier
- **Git Hooks**: Husky, lint-staged

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (v6 or higher) or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dubai-listings-api.git
   cd dubai-listings-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=8000
HOST=0.0.0.0

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/dubai-listings

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email Configuration
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
EMAIL_FROM='Dubai Listings <noreply@dubailistings.com>'

# File Upload
MAX_FILE_UPLOAD=10000000  # 10MB
FILE_UPLOAD_PATH=./public/uploads

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## API Documentation

API documentation is available at `/api-docs` when running in development mode.

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Fix linting errors
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/           # Mongoose models
├── routes/           # Route definitions
├── utils/            # Utility functions and helpers
├── validators/       # Request validation schemas
├── app.js            # Express application
└── server.js         # Server entry point
```

## Testing

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

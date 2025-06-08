import dotenv from 'dotenv';
import app from './app.js';
import { connectDB, disconnectDB } from './utils/db.js';

// Load environment variables
dotenv.config({ path: '.env' });

// Set port
const PORT = process.env.PORT || 8000;

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    const server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
        // eslint-disable-next-line no-console
        console.log(`API JSON Spec: http://localhost:${PORT}/docs.json`);
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', err => {
      // eslint-disable-next-line no-console
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      // eslint-disable-next-line no-console
      console.error(err.name, err.message);

      // Close server gracefully
      server.close(() => {
        disconnectDB().then(() => {
          // eslint-disable-next-line no-console
          console.log('💥 Process terminated!');
          process.exit(1);
        });
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', err => {
      // eslint-disable-next-line no-console
      console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      // eslint-disable-next-line no-console
      console.error(err.name, err.message);

      // Close server gracefully
      server.close(() => {
        disconnectDB().then(() => {
          // eslint-disable-next-line no-console
          console.log('💥 Process terminated!');
          process.exit(1);
        });
      });
    });

    // Handle SIGTERM (For Heroku)
    process.on('SIGTERM', () => {
      // eslint-disable-next-line no-console
      console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
      server.close(() => {
        // eslint-disable-next-line no-console
        console.log('💥 Process terminated!');
      });
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Start the server
startServer();

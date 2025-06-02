import mongoose from 'mongoose';
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
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      
      // Close server gracefully
      server.close(() => {
        disconnectDB().then(() => {
          console.log('💥 Process terminated!');
          process.exit(1);
        });
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      
      // Close server gracefully
      server.close(() => {
        disconnectDB().then(() => {
          console.log('💥 Process terminated!');
          process.exit(1);
        });
      });
    });

    // Handle SIGTERM (For Heroku)
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
      server.close(() => {
        console.log('💥 Process terminated!');
      });
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Start the server
startServer();

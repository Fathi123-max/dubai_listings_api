import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

// Exit application on error
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

// Print mongoose logs in development env
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

/**
 * Connect to MongoDB
 * @returns {Promise} Mongoose connection
 * @public
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise} Mongoose disconnection
 * @public
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Handle Node process termination
const exitHandler = () => {
  if (mongoose.connection.readyState === 1) {
    disconnectDB().then(() => {
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Handle process termination
process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);

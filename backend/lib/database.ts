import mongoose from 'mongoose';
import { DB_CONFIG } from './config';

// Global variables to maintain connection state
let cachedConnection: typeof mongoose | null = null;
let isConnecting = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

/**
 * Connects to MongoDB
 * Optimized for serverless environments with connection pooling
 */
export const connectDB = async (): Promise<typeof mongoose> => {
  // If we already have a cached connection, return it
  if (cachedConnection) {
    return cachedConnection;
  }

  // If a connection is in progress, wait for it to complete
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  // Check if MongoDB URI is defined
  if (!DB_CONFIG.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    isConnecting = true;
    
    // Create a connection promise to handle concurrent connection attempts
    connectionPromise = mongoose.connect(DB_CONFIG.MONGO_URI, {
      // Mongoose 6+ options for better serverless performance
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });
    
    // Wait for connection to establish
    cachedConnection = await connectionPromise;
    
    // Set strictQuery to false to prepare for Mongoose 7
    mongoose.set('strictQuery', false);
    
    console.log(`MongoDB connected successfully: ${mongoose.connection.readyState}`);
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  } finally {
    isConnecting = false;
    connectionPromise = null;
  }
};

/**
 * Disconnect from MongoDB
 * Typically used for testing or cleanup
 */
export const disconnectDB = async (): Promise<void> => {
  if (!cachedConnection) {
    return;
  }
  
  try {
    await mongoose.disconnect();
    cachedConnection = null;
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error while disconnecting from MongoDB:', error);
    throw error;
  }
};

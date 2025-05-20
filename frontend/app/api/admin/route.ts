import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// This is a simple admin utility for development purposes only
// It should be removed or properly secured in production

// Set a secure admin key - this should be a strong, random string in a real app
const ADMIN_KEY = 'DEVELOPMENT_ADMIN_KEY_123';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: 'Admin API is available. Use POST with proper authorization to perform actions.' },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Check admin key
    const { adminKey, action } = await request.json();
    
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid admin key.' },
        { status: 401 }
      );
    }
    
    // Basic validation
    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      );
    }
    
    // Manage different admin actions
    switch (action) {
      case 'count-users':
        return await countUsers();
      case 'delete-all-users':
        return await deleteAllUsers();
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function connectToMongo() {
  // Use the existing environment variable
  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not defined. Please set it in your Vercel project settings or environment.');
  }
  
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error(`MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function countUsers() {
  try {
    await connectToMongo();
    const usersCollection = mongoose.connection.collection('users');
    const count = await usersCollection.countDocuments();
    
    return NextResponse.json(
      { 
        action: 'count-users', 
        count, 
        timestamp: new Date().toISOString(),
        message: `Found ${count} users in the database.`
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Database operation failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

async function deleteAllUsers() {
  try {
    await connectToMongo();
    const usersCollection = mongoose.connection.collection('users');
    
    // Count before deletion
    const countBefore = await usersCollection.countDocuments();
    
    // Delete all users
    const result = await usersCollection.deleteMany({});
    
    return NextResponse.json(
      { 
        action: 'delete-all-users',
        deletedCount: result.deletedCount,
        countBefore,
        timestamp: new Date().toISOString(),
        message: `Successfully deleted ${result.deletedCount} users from the database.`
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Database operation failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 
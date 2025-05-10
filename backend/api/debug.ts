import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../lib/database';
import mongoose from 'mongoose';
import UserModel from '../lib/models/User';
import QuestModel from '../lib/models/Quest';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    // Debug information object
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      connectionString: process.env.MONGO_URI ? 
        `${process.env.MONGO_URI.substring(0, 15)}...` : 'not set',
      mongooseState: mongoose.connection.readyState,
      databases: [],
      collections: {},
      models: Object.keys(mongoose.models),
      error: null
    };

    // Test DB connection
    console.log('Attempting to connect to MongoDB...');
    await connectDB();
    console.log('MongoDB connection successful');
    
    debugInfo.mongooseState = mongoose.connection.readyState;
    
    // Count users and quests
    const userCount = await UserModel.countDocuments();
    const questCount = await QuestModel.countDocuments();
    
    debugInfo.collections = {
      users: userCount,
      quests: questCount
    };
    
    // List available databases if connected
    if (mongoose.connection.readyState === 1) {
      try {
        debugInfo.databases = Object.keys(mongoose.connection.client.topology.s.sessionPool.sessions);
      } catch (err) {
        debugInfo.databases = ['Error listing databases'];
      }
    }
    
    // Return debug info
    return response.status(200).json({
      success: true,
      message: 'Debug information fetched successfully',
      debug: debugInfo
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return response.status(500).json({
      success: false,
      message: 'Error in debug endpoint',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

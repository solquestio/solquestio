import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { connectDB } from '../lib/database';
import { SERVER_CONFIG } from '../lib/config';

/**
 * Health check endpoint
 * Provides basic system status and database connectivity info
 */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    // Check database connection
    let dbStatus = 'disconnected';
    
    try {
      await connectDB();
      dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'connecting';
    } catch (error) {
      dbStatus = 'error';
      console.error('Database connection error during health check:', error);
    }
    
    // Return health information
    response.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: SERVER_CONFIG.NODE_ENV,
      database: {
        status: dbStatus,
        connectionState: mongoose.connection.readyState
      },
      platform: SERVER_CONFIG.IS_VERCEL ? 'vercel' : 'unknown',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check error:', error);
    response.status(500).json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

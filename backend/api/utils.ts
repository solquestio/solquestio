import { VercelRequest, VercelResponse } from '@vercel/node';
import { enableCors } from '../lib/middleware/cors';
import mongoose from 'mongoose';
import { connectDB } from '../lib/database';
import { SERVER_CONFIG } from '../lib/config';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Enable CORS for this endpoint
  enableCors(request, response);
  
  try {
    // Get path from query
    const { path } = request.query;
    
    // Route to appropriate handler based on path
    switch (path) {
      case 'health':
        return handleHealth(request, response);
      case 'debug-db':
        return handleDbDebug(request, response);
      default:
        // Default utils endpoint info
        return response.status(200).json({
          message: 'SolQuestio Utils API',
          endpoints: {
            health: '/api/utils?path=health - Check system health',
            'debug-db': '/api/utils?path=debug-db - Debug database connection'
          },
          timestamp: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error in utils endpoint:', error);
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Handler for health check endpoint
async function handleHealth(request: VercelRequest, response: VercelResponse) {
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
      version: '1.0.0',
      frontendUrl: process.env.FRONTEND_URL || 'not set'
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

// Handler for database debug
async function handleDbDebug(request: VercelRequest, response: VercelResponse) {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    // Check if MongoDB URI is defined
    if (!mongoUri) {
      return response.status(500).json({ 
        error: 'MONGO_URI is not defined in environment variables',
        availableEnvVars: Object.keys(process.env).filter(key => !key.includes('SECRET'))
      });
    }
    
    // Current connection state
    const currentState = mongoose.connection.readyState;
    const connectionStates = ['disconnected', 'connected', 'connecting', 'disconnecting', 'uninitialized'];
    
    // Attempt to connect directly
    let connectionResult = 'Not attempted';
    let error = null;
    
    if (currentState !== 1) { // If not already connected
      try {
        // Try to connect with a short timeout for quick feedback
        await mongoose.connect(mongoUri, { 
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000
        });
        connectionResult = 'Connected successfully';
      } catch (err) {
        connectionResult = 'Connection failed';
        error = err instanceof Error ? err.message : String(err);
      }
    } else {
      connectionResult = 'Already connected';
    }
    
    // Return detailed debug information
    return response.status(200).json({
      timestamp: new Date().toISOString(),
      mongoUriDefined: !!mongoUri,
      mongoUriPrefix: mongoUri ? mongoUri.substring(0, 10) + '...' : 'Not available',
      connectionState: {
        code: currentState,
        description: connectionStates[currentState] || 'unknown'
      },
      connectionResult,
      error,
      mongoose: {
        version: mongoose.version,
        models: Object.keys(mongoose.models)
      },
      serverEnvironment: process.env.NODE_ENV || 'Not set'
    });
  } catch (error) {
    console.error('Debug DB endpoint error:', error);
    return response.status(500).json({
      error: 'Error in debug endpoint',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

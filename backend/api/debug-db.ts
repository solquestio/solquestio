import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { enableCors } from '../lib/middleware/cors';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Enable CORS for this endpoint
  enableCors(request, response);
  
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
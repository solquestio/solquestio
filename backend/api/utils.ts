import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { connectDB } from '../lib/database';
import { SERVER_CONFIG } from '../lib/config';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    // Get path from request
    const { path } = request.query;
    
    // Route to appropriate handler based on path
    switch (path) {
      case 'ping':
        return handlePing(request, response);
      case 'minimal':
        return handleMinimal(request, response);
      case 'test':
        return handleTest(request, response);
      case 'health':
        return await handleHealth(request, response);
      default:
        // Default utility endpoint with all responses
        return response.status(200).json({
          message: 'SolQuestio API Utilities',
          endpoints: {
            ping: '/api/utils?path=ping - Simple ping endpoint',
            minimal: '/api/utils?path=minimal - Minimal test endpoint',
            test: '/api/utils?path=test - API test endpoint',
            health: '/api/utils?path=health - Health check endpoint'
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

// Handler for ping endpoint
function handlePing(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ pong: true });
}

// Handler for minimal endpoint
function handleMinimal(request: VercelRequest, response: VercelResponse) {
  response.status(200).json({
    message: 'Minimal test endpoint is working!',
    timestamp: new Date().toISOString(),
    platform: 'Vercel Serverless'
  });
}

// Handler for test endpoint
function handleTest(request: VercelRequest, response: VercelResponse) {
  response.status(200).json({
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
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

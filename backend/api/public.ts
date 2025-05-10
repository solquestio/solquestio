import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Public API Info Endpoint
 * Lists all public API endpoints available without authentication
 */
export default function handler(request: VercelRequest, response: VercelResponse) {
  try {
    response.status(200).json({
      message: 'SolQuestio API - Public Endpoints',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      publicEndpoints: {
        auth: {
          info: '/api/auth - Get info about auth endpoints',
          challenge: '/api/auth/challenge - Get challenge for wallet signature',
          verify: '/api/auth/verify - Verify signature and get JWT token'
        },
        quests: {
          list: '/api/quests - Get list of available quests (public access)',
          paths: '/api/quests/paths - Get available quest paths'
        },
        health: '/api/health - Check API health status',
        ping: '/api/ping - Simple ping endpoint'
      }
    });
  } catch (error) {
    console.error('Error in public info endpoint:', error);
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

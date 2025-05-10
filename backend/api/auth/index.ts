import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(request: VercelRequest, response: VercelResponse) {
  try {
    // Basic information about available auth endpoints
    response.status(200).json({
      message: 'Auth API is running',
      endpoints: {
        challenge: 'POST /api/auth/challenge - Get a challenge message to sign',
        verify: 'POST /api/auth/verify - Verify signature and get JWT token'
      }
    });
  } catch (error) {
    console.error('Error in auth index endpoint:', error);
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

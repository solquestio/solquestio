import { VercelRequest, VercelResponse } from '@vercel/node';

// Triggering redeploy to ensure Vercel picks up the latest changes
export default function handler(request: VercelRequest, response: VercelResponse) {
  try {
    // Super basic function that doesn't depend on any other code
    response.status(200).json({
      message: 'Minimal test endpoint is working!',
      timestamp: new Date().toISOString(),
      // Simplified environment info
      platform: 'Vercel Serverless'
    });
  } catch (error) {
    console.error('Error in minimal endpoint:', error);
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
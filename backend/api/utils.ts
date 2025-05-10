import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(request: VercelRequest, response: VercelResponse) {
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
      default:
        // Default utility endpoint with all responses
        return response.status(200).json({
          message: 'SolQuestio API Utilities',
          endpoints: {
            ping: '/api/utils?path=ping - Simple ping endpoint',
            minimal: '/api/utils?path=minimal - Minimal test endpoint',
            test: '/api/utils?path=test - API test endpoint'
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

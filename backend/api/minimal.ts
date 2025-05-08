import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(request: VercelRequest, response: VercelResponse) {
  // Super basic function that doesn't depend on any other code
  response.status(200).json({
    message: 'Minimal test endpoint is working!',
    timestamp: new Date().toISOString(),
    environment: {
      // Log some environment info to help debug
      nodeEnv: process.env.NODE_ENV || 'not set',
      vercel: process.env.VERCEL || 'not set',
      mongoUri: process.env.MONGO_URI ? 'defined' : 'not defined'
    }
  });
} 
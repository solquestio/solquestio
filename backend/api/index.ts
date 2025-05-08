import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(request: VercelRequest, response: VercelResponse) {
  // Simple information response about the API status
  response.status(200).json({
    message: 'SolQuest.io Backend API is running',
    version: '1.0',
    serverTime: new Date().toISOString(),
    status: 'healthy'
  });
} 
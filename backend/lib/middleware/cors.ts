import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * CORS middleware for serverless functions
 * Enables CORS headers to allow requests from the frontend
 */
export function enableCors(req: VercelRequest, res: VercelResponse): void {
  // Allow all origins during debugging
  const frontendUrl = '*';
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', frontendUrl);
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * CORS middleware for serverless functions
 * Enables CORS headers to allow requests from the frontend
 */
export function enableCors(req: VercelRequest, res: VercelResponse): void {
  // Define your specific frontend URL
  const allowedOrigin = 'https://solquest.io'; // Your production frontend

  // Fallback for local development if needed, or manage via ENV VAR
  // const allowedOrigin = process.env.NODE_ENV === 'development' 
  //   ? 'http://localhost:3000' 
  //   : 'https://solquest.io';

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin); 
  // If you need to support multiple origins (e.g. previews), you'll need more logic here
  // to check req.headers.origin and set it dynamically if it's in an allowed list.
  // For now, hardcoding the production one is the most direct fix.

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

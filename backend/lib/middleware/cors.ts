import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * CORS middleware for serverless functions
 * Enables CORS headers to allow requests from the frontend
 */
export function enableCors(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin;
  let effectiveOrigin = 'https://solquest.io'; // Default non-www

  // Explicitly check if the request origin is the www version
  if (origin === 'https://www.solquest.io') {
    effectiveOrigin = 'https://www.solquest.io';
  } else if (origin === 'https://solquest.io') {
    effectiveOrigin = 'https://solquest.io';
  }
  // For any other origin, or if origin is not present, it will default to 'https://solquest.io'
  // or you could choose to not set the ACAO header or block.
  // For local dev, you'd add: else if (origin === 'http://localhost:3000') effectiveOrigin = 'http://localhost:3000';

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', effectiveOrigin);
  res.setHeader('Vary', 'Origin');

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  if (req.method === 'OPTIONS') {
    console.log(`CORS: OPTIONS request from ${origin}, responding with ACAO: ${effectiveOrigin}`); // Log OPTIONS
    res.status(200).end();
    return;
  }
  // Log for non-OPTIONS requests too
  console.log(`CORS: Request from ${origin}, method ${req.method}, responding with ACAO: ${effectiveOrigin}`);
}

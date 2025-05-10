import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * CORS middleware for serverless functions
 * Enables CORS headers to allow requests from the frontend
 */
export function enableCors(req: VercelRequest, res: VercelResponse): void {
  const productionFrontendDomain = 'solquest.io';
  const allowedOrigins = [
    `https://www.${productionFrontendDomain}`, // For www.solquest.io
    `https://${productionFrontendDomain}`,   // For solquest.io
    // Add preview deployment URLs if needed, e.g., using a regex or specific URLs
    // For local development:
    // 'http://localhost:3000' 
  ];

  const origin = req.headers.origin;
  let effectiveOrigin = allowedOrigins[0]; // Default to www if origin is not in the list or not present

  if (origin && allowedOrigins.includes(origin)) {
    effectiveOrigin = origin;
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', effectiveOrigin);
  res.setHeader('Vary', 'Origin'); // Important when dynamically setting Allow-Origin

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

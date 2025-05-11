import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * CORS middleware for serverless functions
 * Enables CORS headers to allow requests from the frontend
 */
export function enableCors(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin;
  let effectiveOrigin = 'https://solquest.io'; // Default to non-www as a fallback

  console.log(`[CORS Pre-Check] Request origin: ${origin}`);

  if (origin === 'https://www.solquest.io') {
    effectiveOrigin = 'https://www.solquest.io';
    console.log(`[CORS Logic] Matched www.solquest.io, setting effectiveOrigin to: ${effectiveOrigin}`);
  } else if (origin === 'https://solquest.io') {
    effectiveOrigin = 'https://solquest.io';
    console.log(`[CORS Logic] Matched solquest.io (no www), setting effectiveOrigin to: ${effectiveOrigin}`);
  } else if (origin === 'http://localhost:3000') { // Keep local dev
    effectiveOrigin = 'http://localhost:3000';
    console.log(`[CORS Logic] Matched localhost:3000, setting effectiveOrigin to: ${effectiveOrigin}`);
  } else {
    console.log(`[CORS Logic] Origin ${origin} did not match specific cases, defaulting to: ${effectiveOrigin}`);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  console.log(`[CORS Header Set] Setting Access-Control-Allow-Origin to: ${effectiveOrigin}`);
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
    console.log(`[CORS Final] OPTIONS request from ${origin}. Responding with ACAO: ${effectiveOrigin}.`);
    res.status(200).end();
    return;
  }
  console.log(`[CORS Final] Request from ${origin}, method ${req.method}. Responding with ACAO: ${effectiveOrigin}.`);
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import { enableCors } from '../../lib/middleware/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  // Enable CORS for this endpoint
  enableCors(req, res);

  // Handle /api/auth/verify
  if (action === 'verify') {
    res.status(501).json({ error: 'verify not implemented in combined handler yet.' });
    return;
  }

  // Handle /api/auth/challenge
  if (action === 'challenge') {
    res.status(501).json({ error: 'challenge not implemented in combined handler yet.' });
    return;
  }

  res.status(404).json({ error: 'Auth action not found' });
}

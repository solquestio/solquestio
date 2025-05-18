import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  // Handle /api/nft/verify-code
  if (action === 'verify-code') {
    res.status(501).json({ error: 'verify-code not implemented in combined handler yet.' });
    return;
  }

  // Handle /api/nft/twitter-auth
  if (action === 'twitter-auth') {
    res.status(501).json({ error: 'twitter-auth not implemented in combined handler yet.' });
    return;
  }

  // Handle /api/nft/discord-auth
  if (action === 'discord-auth') {
    res.status(501).json({ error: 'discord-auth not implemented in combined handler yet.' });
    return;
  }

  // Handle /api/nft/mint-og
  if (action === 'mint-og') {
    res.status(501).json({ error: 'mint-og not implemented in combined handler yet.' });
    return;
  }

  // Handle /api/nft/check-eligibility
  if (action === 'check-eligibility') {
    res.status(501).json({ error: 'check-eligibility not implemented in combined handler yet.' });
    return;
  }

  res.status(404).json({ error: 'NFT action not found' });
} 
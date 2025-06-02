import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    // Mock eligibility check - in production this would check database/blockchain
    const eligibilityData = {
      eligible: true,
      reason: 'Wallet is eligible for free mint',
      collectionMint: null,
      stats: {
        totalMinted: 0,
        remaining: 10000,
        maxSupply: 10000,
        nextTokenId: 1
      },
      mintingAvailable: true,
      mockData: true
    };

    res.status(200).json(eligibilityData);
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
} 
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
    // Return mock NFT statistics for now
    // In production, this would fetch real data from your database
    const stats = {
      totalMinted: 0,
      maxSupply: 10000,
      remaining: 10000,
      mintPrice: 0,
      mintType: 'Community Free Mint'
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching OG NFT stats:', error);
    res.status(500).json({ error: 'Failed to fetch NFT statistics' });
  }
} 
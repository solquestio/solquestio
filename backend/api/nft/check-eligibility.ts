import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';
import { getCollection } from '../../lib/mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet } = req.query;

  if (!wallet || typeof wallet !== 'string') {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    // Connect to MongoDB
    const collection = await getCollection('og_nft_claims');
    
    // Check if wallet has already claimed
    const existingClaim = await collection.findOne({ wallet });
    
    // Get social verifications if they exist
    const verifications = await collection.findOne({ 
      wallet, 
      type: 'verification' 
    });

    return res.status(200).json({
      alreadyClaimed: !!existingClaim?.claimed,
      twitterVerified: !!verifications?.twitterVerified,
      discordVerified: !!verifications?.discordVerified
    });
  } catch (err) {
    console.error('Error checking eligibility:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
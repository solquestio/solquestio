import { VercelRequest, VercelResponse } from '@vercel/node';
import { getCollection } from '../../lib/mongodb';

// List of valid secret codes - in production, you might store these in your database
const VALID_CODES = [
  'SOLQUESTOG',
  'OGSOLQUEST',
  'SOLANA2024'
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, wallet } = req.body;

  if (!code || !wallet) {
    return res.status(400).json({ error: 'Code and wallet address are required' });
  }

  try {
    // Check if the code is valid
    const isValidCode = VALID_CODES.includes(code.toUpperCase());
    
    if (!isValidCode) {
      return res.status(200).json({ verified: false });
    }
    
    // Store the verification in the database
    const collection = await getCollection('og_nft_claims');
    
    await collection.updateOne(
      { wallet, type: 'verification' },
      { 
        $set: { 
          wallet,
          type: 'verification',
          codeVerified: true,
          verificationTime: new Date()
        } 
      },
      { upsert: true }
    );
    
    return res.status(200).json({ verified: true });
  } catch (err) {
    console.error('Error verifying code:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
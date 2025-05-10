import { VercelRequest, VercelResponse } from '@vercel/node';
import { generateChallengeMessage } from '../../lib/utils/solana';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    // Generate a challenge message for the wallet to sign
    const message = generateChallengeMessage(walletAddress);
    
    // Return the message for the client to sign
    res.status(200).json({
      message,
      walletAddress
    });
  } catch (error) {
    console.error('Error generating challenge:', error);
    res.status(500).json({ 
      error: 'Server error during challenge generation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import { enableCors } from '../../lib/middleware/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS using the proper middleware
  enableCors(req, res);

  const { action, walletAddress } = req.query;

  try {
    // Handle stats endpoint
    if (action === 'stats' && req.method === 'GET') {
      const stats = {
        totalMinted: 0,
        maxSupply: 10000,
        remaining: 10000,
        mintPrice: 0,
        mintType: 'Community Free Mint'
      };

      res.status(200).json({
        success: true,
        stats
      });
      return;
    }

    // Handle eligibility check
    if (action === 'eligibility' && req.method === 'GET') {
      if (!walletAddress || typeof walletAddress !== 'string') {
        res.status(400).json({ error: 'Invalid wallet address' });
        return;
      }

      // Mock eligibility check - in production this would check real data
      const isEligible = true;
      const hasAlreadyMinted = false;
      const eligibilityReason = hasAlreadyMinted 
        ? 'Already minted' 
        : isEligible 
          ? 'Eligible for OG NFT' 
          : 'Not eligible';

      res.status(200).json({
        success: true,
        eligible: isEligible && !hasAlreadyMinted,
        reason: eligibilityReason,
        walletAddress
      });
      return;
    }

    // Handle mint endpoint
    if (action === 'mint' && req.method === 'POST') {
      const { walletAddress: mintWallet, specialAttributes } = req.body;

      if (!mintWallet) {
        res.status(400).json({ error: 'Wallet address is required' });
        return;
      }

      // Mock mint response - in production this would create actual NFT
      const mintResult = {
        success: true,
        message: 'NFT minted successfully!',
        walletAddress: mintWallet,
        nftId: `og_nft_${Date.now()}`,
        attributes: specialAttributes || [],
        transactionHash: `mock_tx_${Date.now()}`
      };

      res.status(200).json(mintResult);
      return;
    }

    // Invalid action or method
    res.status(404).json({ error: 'Invalid endpoint or method' });

  } catch (error) {
    console.error('OG NFT API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
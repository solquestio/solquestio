import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { walletAddress, specialAttributes } = req.body;

    if (!walletAddress) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }

    // Mock mint response - in production this would create actual NFT
    const mintResult = {
      success: true,
      message: 'NFT minted successfully!',
      nft: {
        mintAddress: 'mock_mint_address_' + Date.now(),
        tokenId: Math.floor(Math.random() * 10000) + 1,
        metadataUri: 'https://example.com/metadata/mock.json',
        recipient: walletAddress
      },
      transactionSignature: 'mock_signature_' + Date.now(),
      limitEnforced: true,
      mockData: true
    };

    res.status(200).json(mintResult);
  } catch (error) {
    console.error('Error minting NFT:', error);
    res.status(500).json({ error: 'Failed to mint NFT' });
  }
} 
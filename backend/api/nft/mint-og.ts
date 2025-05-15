import { VercelRequest, VercelResponse } from '@vercel/node';
import { getCollection } from '../../lib/mongodb';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { mintNFT } from '../../lib/solana-nft';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet } = req.body;

  if (!wallet) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    // Connect to MongoDB
    const collection = await getCollection('og_nft_claims');
    
    // Check if wallet has already claimed
    const existingClaim = await collection.findOne({ 
      wallet, 
      claimed: true 
    });
    
    if (existingClaim) {
      return res.status(400).json({ 
        success: false, 
        message: 'NFT already claimed by this wallet' 
      });
    }
    
    // Get verification status
    const verifications = await collection.findOne({ 
      wallet, 
      type: 'verification' 
    });
    
    // Verify all requirements are met
    if (!verifications?.twitterVerified || !verifications?.discordVerified || !verifications?.codeVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Not all verification requirements are met' 
      });
    }
    
    // In a real implementation, this would mint the NFT to the user's wallet
    // For this example, we'll simulate a successful mint
    
    /*
    // Actual minting code would look something like this:
    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    const walletPublicKey = new PublicKey(wallet);
    
    const mintResult = await mintNFT(
      connection, 
      process.env.PRIVATE_KEY as string,
      walletPublicKey,
      {
        name: "SolQuest OG Pass",
        symbol: "SQOG",
        description: "Early supporter of the SolQuest platform - grants exclusive access to upcoming features and events.",
        image: "https://solquest.io/assets/og-nft.png",
        attributes: [
          { trait_type: "Type", value: "OG Pass" },
          { trait_type: "Generation", value: "First" },
          { trait_type: "Rarity", value: "Rare" },
          { trait_type: "Access Level", value: "VIP" }
        ]
      }
    );
    
    const signature = mintResult.signature;
    */
    
    // Simulate a successful mint
    const signature = `simulated_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Record the claim in the database
    await collection.insertOne({
      wallet,
      claimed: true,
      claimTime: new Date(),
      signature,
      type: 'claim'
    });
    
    return res.status(200).json({
      success: true,
      message: 'NFT minted successfully!',
      signature
    });
  } catch (err) {
    console.error('Error minting NFT:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
} 
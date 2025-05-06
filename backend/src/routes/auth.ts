import express, { Request, Response, Router } from 'express';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import jwt from 'jsonwebtoken'; // Import jwt
import { PublicKey } from '@solana/web3.js'; // Import PublicKey for validation
import User from '../models/User'; // Import the User model
import { QUEST_DEFINITIONS } from './quests'; // Import quest definitions
import { Helius } from "helius-sdk"; // Import Helius SDK
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const router: Router = express.Router();
const VERIFY_WALLET_QUEST_ID = 'verify-wallet'; // Define quest ID
const VERIFY_WALLET_XP_REWARD = 10; // Define reward directly

// --- Helius Setup --- 
const heliusApiKey = process.env.NEXT_PUBLIC_HELIUS_RPC_URL?.split('/').pop(); // Extract API key from RPC URL
const helius = new Helius(heliusApiKey || "");

// --- Constants --- 
const JWT_SECRET = process.env.JWT_SECRET;
const OG_NFT_COLLECTION_MINT = process.env.SOLQUEST_OG_NFT_COLLECTION_MINT;

// Helper function to check NFT ownership
const checkOgNftOwnership = async (walletAddress: string): Promise<boolean> => {
    if (!OG_NFT_COLLECTION_MINT || !heliusApiKey) {
        console.warn('OG NFT Collection Mint or Helius API key not configured, skipping ownership check.');
        return false;
    }
    try {
        console.log(`Checking OG NFT ownership for ${walletAddress} against collection ${OG_NFT_COLLECTION_MINT}...`);
        // Use Helius DAS API getAssetsByOwner - fetch first page only is usually enough for checking *if* they own any
        const response = await helius.rpc.getAssetsByOwner({ 
            ownerAddress: walletAddress, 
            page: 1, 
            limit: 100 // Limit the number of assets fetched for efficiency
        });
        
        // Iterate through assets to find one matching the collection mint
        const ownsNft = response.items.some(asset => 
            asset.grouping?.some(group => 
                group.group_key === 'collection' && group.group_value === OG_NFT_COLLECTION_MINT
            )
        );
        
        console.log(`NFT ownership check result for ${walletAddress}: ${ownsNft}`);
        return ownsNft;
    } catch (error: any) {
        console.error(`Error checking NFT ownership for ${walletAddress}:`, error.message);
        // Don't fail the login if the NFT check fails, just assume they don't own it
        return false; 
    }
};

// POST /api/auth/verify - Verify signature and login/register user
router.post('/verify', async (req: Request, res: Response) => {
  const { walletAddress, signature, message } = req.body;

  // Access directly from process.env
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables.');
    return res.status(500).json({ message: 'Server configuration error [JWT]' });
  }

  // 1. Input Validation
  if (!walletAddress || !signature || !message) {
    return res.status(400).json({ message: 'Missing walletAddress, signature, or message' });
  }

  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = new PublicKey(walletAddress).toBytes(); // Validate and get bytes

    // 2. Signature Verification
    const isVerified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

    if (!isVerified) {
      console.warn(`Signature verification failed for ${walletAddress}`);
      return res.status(401).json({ message: 'Invalid signature' });
    }

    console.log(`Signature verified successfully for ${walletAddress}`);

    // 3. Find or Create User & Award XP
    let user = await User.findOne({ walletAddress });
    let updatedUser: any; // Use 'any' temporarily or define a proper type

    if (!user) {
      console.log(`User not found, creating new user for ${walletAddress}`);
      // Create user with quest completed and initial XP
      const questReward = QUEST_DEFINITIONS[VERIFY_WALLET_QUEST_ID]?.xpReward || 0;
      user = new User({
        walletAddress,
        completedQuestIds: [VERIFY_WALLET_QUEST_ID],
        xp: questReward,
        checkInStreak: 0, // Initialize streak
        ownsOgNft: false, // Default ownership
      });
      await user.save();
      updatedUser = user; // The newly saved user is the updated one
      console.log(`New user created with ID: ${user._id}. Quest '${VERIFY_WALLET_QUEST_ID}' completed. Awarded ${questReward} XP.`);
    } else {
      console.log(`Existing user found with ID: ${user._id}`);
      // Check if quest needs completing for existing user
      if (!user.completedQuestIds.includes(VERIFY_WALLET_QUEST_ID)) {
        const questReward = QUEST_DEFINITIONS[VERIFY_WALLET_QUEST_ID]?.xpReward || 0;
        updatedUser = await User.findByIdAndUpdate(
          user._id,
          {
            $push: { completedQuestIds: VERIFY_WALLET_QUEST_ID },
            $inc: { xp: questReward } // Award XP on completion
          },
          { new: true } // Return the updated document
        );
        if (updatedUser) {
          console.log(`Quest '${VERIFY_WALLET_QUEST_ID}' completed for existing user ${user._id}. Awarded ${questReward} XP.`);
        } else {
          console.error(`Failed to update user ${user._id} for quest ${VERIFY_WALLET_QUEST_ID}`);
          // Decide how to handle - maybe proceed without XP update?
          // For now, we'll use the original user data for JWT
          updatedUser = user; 
        }
      } else {
        console.log(`Quest '${VERIFY_WALLET_QUEST_ID}' already completed for user ${user._id}`);
        updatedUser = user; // Use existing user data
      }
    }

    // Ensure we have a user object to proceed
    if (!updatedUser) {
      console.error(`User object is null or undefined after find/create/update logic for ${walletAddress}`);
      return res.status(500).json({ message: 'Internal server error processing user data' });
    }

    // --- Check NFT Ownership --- 
    const ownsOgNft = await checkOgNftOwnership(walletAddress);
    updatedUser.ownsOgNft = ownsOgNft;

    // Save user (either new or updated with NFT status/quest completion)
    await updatedUser.save();
    const savedUser = await User.findById(updatedUser._id).select('-__v'); // Re-fetch to exclude __v
    if (!savedUser) throw new Error("Failed to retrieve saved user data");

    // Generate JWT Token using updatedUser data
    const tokenPayload = {
      userId: updatedUser._id,
      walletAddress: updatedUser.walletAddress
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    // Return token and updated user info (including XP and ownsOgNft)
    res.status(200).json({
      message: 'Authentication successful',
      token,
      user: savedUser // Return the saved user data (including ownsOgNft)
    });

  } catch (error: any) {
    console.error('Auth verification error:', error);
    // Handle potential PublicKey validation error
    if (error.message.includes('Invalid public key')) {
       return res.status(400).json({ message: 'Invalid wallet address format' });
    }
    res.status(500).json({ message: 'Internal server error during verification' });
  }
});

export default router; 
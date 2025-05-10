import express, { Request, Response, Router } from 'express';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import jwt from 'jsonwebtoken'; // Import jwt
import { PublicKey } from '@solana/web3.js'; // Import PublicKey for validation
import User, { IUser } from '../models/User'; // Import the User model and IUser interface
import { QUEST_DEFINITIONS } from './quests'; // Import quest definitions
import { Helius } from "helius-sdk"; // Import Helius SDK
import dotenv from 'dotenv';
import crypto from 'crypto'; // Import crypto for random string generation
import mongoose from 'mongoose'; // Import mongoose for ObjectId
// Referral imports removed

dotenv.config(); // Load .env variables

const router: Router = express.Router();
const VERIFY_WALLET_QUEST_ID = 'verify-wallet'; // Define quest ID

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
    let userDoc: IUser | null = await User.findOne({ walletAddress });
    let finalUserDataForToken: IUser;
    let questRewardForVerification = QUEST_DEFINITIONS[VERIFY_WALLET_QUEST_ID]?.xpReward || 0;

    if (!userDoc) {
      console.log(`User not found, creating new user for ${walletAddress}`);
      
      // Step 1: Create user object with referral code
      let initialNewUserData = {
        walletAddress,
        completedQuestIds: [VERIFY_WALLET_QUEST_ID],
        xp: questRewardForVerification,
        checkInStreak: 0,
        ownsOgNft: false,
        // Referral code removed
      };

      // Step 2: Save initial user to DB
      let savedNewUserDoc = await new User(initialNewUserData).save();
      
      // Step 3: Use the saved document (which is typed as IUser via Mongoose)
      let userBeingProcessed = savedNewUserDoc as IUser;
      
      // Referral logic removed
      
      // Save the user (not needed after removing referral logic, but kept for clarity)
      await userBeingProcessed.save(); 

      finalUserDataForToken = userBeingProcessed;
      console.log(`New user created with ID: ${userBeingProcessed._id}. Quest '${VERIFY_WALLET_QUEST_ID}' completed. Awarded ${questRewardForVerification} XP.`);
      
      // Referral bonus logic removed

    } else {
      console.log(`Existing user found with ID: ${userDoc._id}`);
      let updatedExistingUser = userDoc;
      let awardedXpThisSession = 0; // Track if XP was awarded in this specific login for this quest

      if (!userDoc.completedQuestIds.includes(VERIFY_WALLET_QUEST_ID)) {
        const result = await User.findByIdAndUpdate(
          userDoc._id,
          {
            $push: { completedQuestIds: VERIFY_WALLET_QUEST_ID },
            $inc: { xp: questRewardForVerification }
          },
          { new: true }
        );
        if (result) {
          updatedExistingUser = result;
          awardedXpThisSession = questRewardForVerification;
          console.log(`Quest '${VERIFY_WALLET_QUEST_ID}' completed for existing user ${userDoc._id}. Awarded ${questRewardForVerification} XP.`);
        } else {
          console.error(`Failed to update user ${userDoc._id} for quest ${VERIFY_WALLET_QUEST_ID}`);
        }
      }
      finalUserDataForToken = updatedExistingUser;
      
      // Referral bonus logic removed
    }

    const ownsOgNft = await checkOgNftOwnership(finalUserDataForToken.walletAddress);
    if (finalUserDataForToken.ownsOgNft !== ownsOgNft) {
        finalUserDataForToken.ownsOgNft = ownsOgNft;
        await (finalUserDataForToken as any).save(); // Save if NFT status changed
    }
    
    // Re-fetch to ensure all updates are present and __v is excluded for token/response
    const userForResponse = await User.findById(finalUserDataForToken._id).select('-__v');
    if (!userForResponse) {
        console.error(`Failed to re-fetch user ${finalUserDataForToken._id} before sending response.`);
        return res.status(500).json({ message: 'Internal server error finalizing user data' });
    }

    const tokenPayload = {
      userId: userForResponse._id,
      walletAddress: userForResponse.walletAddress
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    // Return token and updated user info (including XP and ownsOgNft)
    res.status(200).json({
      message: 'Authentication successful',
      token,
      user: userForResponse // Return the saved user data (including ownsOgNft)
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
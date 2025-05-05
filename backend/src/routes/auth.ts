import express, { Request, Response, Router } from 'express';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import jwt from 'jsonwebtoken'; // Import jwt
import { PublicKey } from '@solana/web3.js'; // Import PublicKey for validation
import User from '../models/User'; // Import the User model

const router: Router = express.Router();
const VERIFY_WALLET_QUEST_ID = 'verify-wallet'; // Define quest ID
const VERIFY_WALLET_XP_REWARD = 10; // Define reward directly

// POST /api/auth/verify - Verify signature and login/register user
router.post('/verify', async (req: Request, res: Response) => {
  const { walletAddress, signature, message } = req.body;

  // Access directly from process.env
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in environment variables.');
    return res.status(500).json({ message: 'Server configuration error' });
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
      user = new User({
        walletAddress,
        completedQuestIds: [VERIFY_WALLET_QUEST_ID],
        xp: VERIFY_WALLET_XP_REWARD // Award XP on creation
      });
      await user.save();
      updatedUser = user; // The newly saved user is the updated one
      console.log(`New user created with ID: ${user._id}. Quest '${VERIFY_WALLET_QUEST_ID}' completed. Awarded ${VERIFY_WALLET_XP_REWARD} XP.`);
    } else {
      console.log(`Existing user found with ID: ${user._id}`);
      // Check if quest needs completing for existing user
      if (!user.completedQuestIds.includes(VERIFY_WALLET_QUEST_ID)) {
        updatedUser = await User.findByIdAndUpdate(
          user._id,
          {
            $push: { completedQuestIds: VERIFY_WALLET_QUEST_ID },
            $inc: { xp: VERIFY_WALLET_XP_REWARD } // Award XP on completion
          },
          { new: true } // Return the updated document
        );
        if (updatedUser) {
          console.log(`Quest '${VERIFY_WALLET_QUEST_ID}' completed for existing user ${user._id}. Awarded ${VERIFY_WALLET_XP_REWARD} XP.`);
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

    // Generate JWT Token using updatedUser data
    const tokenPayload = {
      userId: updatedUser._id,
      walletAddress: updatedUser.walletAddress
    };
    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '1d' });

    // Return token and updated user info (including XP)
    res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        id: updatedUser._id,
        walletAddress: updatedUser.walletAddress,
        username: updatedUser.username,
        completedQuestIds: updatedUser.completedQuestIds,
        xp: updatedUser.xp, // Include XP in the response
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
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
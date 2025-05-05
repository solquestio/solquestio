import express, { Request, Response, Router } from 'express';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import jwt from 'jsonwebtoken'; // Import jwt
import { PublicKey } from '@solana/web3.js'; // Import PublicKey for validation
import User from '../models/User'; // Import the User model

const router: Router = express.Router();

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

    // 3. Find or Create User
    let user = await User.findOne({ walletAddress });

    if (!user) {
      console.log(`User not found, creating new user for ${walletAddress}`);
      user = new User({ walletAddress });
      await user.save();
      console.log(`New user created with ID: ${user._id}`);
    } else {
      console.log(`Existing user found with ID: ${user._id}`);
    }

    // Generate JWT Token
    const tokenPayload = {
      userId: user._id,
      walletAddress: user.walletAddress
    };
    
    const token = jwt.sign(
      tokenPayload,
      jwtSecret,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // Return token and user info
    res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        completedQuests: user.completedQuests,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
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
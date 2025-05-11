import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import UserModel from '../../lib/models/User';
import { connectDB } from '../../lib/database';
import { verifySignature } from '../../lib/utils/solana';
import { enableCors } from '../../lib/middleware/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for this endpoint
  enableCors(req, res);
  
  // Direct CORS headers as backup to ensure they're set properly
  const origin = req.headers.origin;
  
  // Handle different origins directly
  if (origin === 'https://www.solquest.io' || origin === 'https://solquest.io' || origin === 'http://localhost:3000') {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Default fallback
    res.setHeader('Access-Control-Allow-Origin', 'https://solquest.io');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await connectDB();
    
    const { walletAddress, signature, message } = req.body;
    
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: 'Missing required authentication parameters' });
    }
    
    // Verify the signature from the Solana wallet
    if (!verifySignature(walletAddress, signature, message)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Find or create the user in the database
    let user = await UserModel.findOne({ walletAddress });
    
    if (!user) {
      user = new UserModel({ walletAddress });
      await user.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, walletAddress }, 
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );
    
    // Return the token and user profile
    res.status(200).json({
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username || null,
        xp: user.xp || 0,
        checkInStreak: user.checkInStreak || 0,
        ownsOgNft: user.ownsOgNft || false
      }
    });
    
  } catch (error) {
    console.error('Error in auth/verify endpoint:', error);
    res.status(500).json({ error: 'Server error during authentication' });
  }
} 
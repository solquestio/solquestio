import { VercelRequest, VercelResponse } from '@vercel/node';
import { enableCors } from '../../lib/middleware/cors';
import jwt from 'jsonwebtoken';
import UserModel from '../../lib/models/User';
import { verifySignature } from '../../lib/utils/solana';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  // Enable CORS for this endpoint
  enableCors(req, res);

  // Handle /api/auth/challenge
  if (action === 'challenge') {
    const timestamp = Date.now();
    const challengeMessage = `Sign in to SolQuest.io\n\nTimestamp: ${timestamp}`;
    res.status(200).json({ challengeMessage });
    return;
  }

  // Handle /api/auth/verify
  if (action === 'verify') {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ message: 'Missing walletAddress, signature, or message' });
    }

    const isVerified = verifySignature(walletAddress, signature, message);
    if (!isVerified) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    let user = await UserModel.findOne({ walletAddress });
    if (!user) {
      user = await UserModel.create({ walletAddress });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '7d' });
    res.status(200).json({ token, user });
    return;
  }

  res.status(404).json({ error: 'Auth action not found' });
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../lib/database';
import UserModel from '../../lib/models/User';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  // Handle /api/nft/verify-code
  if (action === 'verify-code') {
    res.status(501).json({ error: 'verify-code not implemented in combined handler yet.' });
    return;
  }

  // Handle /api/nft/twitter-auth
  if (action === 'twitter-auth') {
    try {
      const { userId, twitterUsername } = req.body;
      
      if (!userId || !twitterUsername) {
        return res.status(400).json({ error: 'Missing userId or twitterUsername' });
      }
      
      await connectDB();
      
      // Update the user's Twitter username in the database
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { 'social.twitter': twitterUsername },
        { new: true }
      );
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Twitter username stored successfully' 
      });
    } catch (error) {
      console.error('Error storing Twitter username:', error);
      return res.status(500).json({ error: 'Failed to store Twitter username' });
    }
  }

  // Handle /api/nft/discord-auth
  if (action === 'discord-auth') {
    res.status(501).json({ error: 'discord-auth not implemented in combined handler yet.' });
    return;
  }

  // Handle /api/nft/mint-og
  if (action === 'mint-og') {
    res.status(501).json({ error: 'mint-og not implemented in combined handler yet.' });
    return;
  }

  // Handle /api/nft/check-eligibility
  if (action === 'check-eligibility') {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
      }
      
      await connectDB();
      
      // Get the user from the database
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if the user has a Twitter username stored
      const hasTwitterConnection = !!user.social?.twitter;
      
      // For now, we're only checking if they have connected their Twitter account
      // In production, you might want to verify they are actually following your account
      // using the Twitter API or a third-party service
      
      return res.status(200).json({
        eligible: hasTwitterConnection,
        requirements: {
          twitterFollowed: hasTwitterConnection,
        },
        message: hasTwitterConnection 
          ? 'You are eligible to mint the NFT for FREE!' 
          : 'Please follow @SolQuestio on X (Twitter) to mint the NFT'
      });
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return res.status(500).json({ error: 'Failed to check eligibility' });
    }
  }

  res.status(404).json({ error: 'NFT action not found' });
} 
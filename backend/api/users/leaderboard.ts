import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../lib/database';
import UserModel from '../../lib/models/User';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    // Connect to database
    await connectDB();
    
    // Get top users sorted by XP
    const users = await UserModel.find({})
      .sort({ xp: -1 }) // Sort by XP in descending order
      .limit(20) // Limit to top 20 users
      .select('walletAddress username xp ownsOgNft'); // Only select needed fields
    
    // Transform data and add ranks
    const leaderboard = users.map((user, index) => ({
      _id: user._id,
      walletAddress: user.walletAddress,
      username: user.username || null, // Handle null usernames
      xp: user.xp,
      rank: index + 1, // Add rank based on order
      ownsOgNft: user.ownsOgNft || false
    }));

    response.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error in leaderboard endpoint:', error);
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
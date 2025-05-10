import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { connectDB } from '../../lib/database';
import UserModel from '../../lib/models/User';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    // Connect to database
    await connectDB();
    
    // Get path from query
    const { path } = request.query;
    
    // Route to appropriate handler based on path
    switch (path) {
      case 'me':
        return handleMe(request, response);
      case 'leaderboard':
        return handleLeaderboard(request, response);
      default:
        // Default user endpoint info
        return response.status(200).json({
          message: 'SolQuestio User API',
          endpoints: {
            me: '/api/users?path=me - Get current user profile (requires auth)',
            leaderboard: '/api/users?path=leaderboard - Get user leaderboard'
          },
          timestamp: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error in users endpoint:', error);
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Handler for me endpoint
async function handleMe(request: VercelRequest, response: VercelResponse) {
  try {
    // Check for authorization header
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication required'
      });
    }
    
    // Get the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { id: string };
    
    // Find the user
    const user = await UserModel.findById(decoded.id);
    
    if (!user) {
      return response.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    // Return user data without sensitive info
    return response.status(200).json({
      _id: user._id,
      walletAddress: user.walletAddress,
      username: user.username,
      xp: user.xp,
      completedQuestIds: user.completedQuestIds,
      ownsOgNft: user.ownsOgNft
    });
  } catch (error) {
    console.error('Error in me endpoint:', error);
    
    // Handle token verification errors specially
    if (error instanceof jwt.JsonWebTokenError) {
      return response.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }
    
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Handler for leaderboard endpoint
async function handleLeaderboard(request: VercelRequest, response: VercelResponse) {
  try {
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

    return response.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error in leaderboard endpoint:', error);
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

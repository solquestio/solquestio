import { VercelRequest, VercelResponse } from '@vercel/node';
import { enableCors } from '../../lib/middleware/cors';
import jwt from 'jsonwebtoken';
import { connectDB } from '../../lib/database';
import UserModel from '../../lib/models/User';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Enable CORS for this endpoint
  enableCors(request, response);
  
  // Direct CORS headers as backup to ensure they're set properly
  const origin = request.headers.origin;
  
  // Handle different origins directly
  if (origin === 'https://www.solquest.io' || origin === 'https://solquest.io' || origin === 'http://localhost:3000') {
    response.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Default fallback
    response.setHeader('Access-Control-Allow-Origin', 'https://solquest.io');
  }
  
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
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
    // Ensure database connection
    await connectDB();
    
    // Get limit from query parameter or default to 20
    const limit = request.query.limit ? parseInt(request.query.limit as string) : 20;
    
    // Get top users sorted by XP
    const users = await UserModel.find({})
      .sort({ xp: -1 }) // Sort by XP in descending order
      .limit(limit) // Limit to requested number or default
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

    // Log successful response for debugging
    console.log(`Leaderboard data fetched successfully. ${leaderboard.length} users returned.`);
    
    return response.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error in leaderboard endpoint:', error);
    response.status(500).json({ 
      error: 'Failed to fetch leaderboard data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

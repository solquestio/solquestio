import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { connectDB } from '../../lib/database';
import UserModel from '../../lib/models/User';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // --- CORS HEADERS ---
  const origin = request.headers.origin || '';
  const allowedOrigins = ['https://www.solquest.io', 'https://solquest.io', 'http://localhost:3000', 'http://localhost:3001'];
  
  // Set CORS headers for all requests
  response.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins temporarily for debugging
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // --- Handle OPTIONS ---
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
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
      case 'check-in':
        if (request.method === 'POST') {
          return handleCheckIn(request, response);
        } else {
          return response.status(405).json({ error: 'Method not allowed' });
        }
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
    // Set content type to application/json
    response.setHeader('Content-Type', 'application/json');
    
    // Ensure database connection
    await connectDB();
    
    // Get limit from query parameter or default to 20
    const limit = request.query.limit ? parseInt(request.query.limit as string) : 20;
    
    // Get timeframe parameter - 'monthly' or default to all-time
    const timeframe = request.query.timeframe as string || 'total';
    
    // Define query based on timeframe
    let query = {};
    
    // For monthly timeframe implementation, we would typically use date range filtering
    // For now, we'll just return the same data for both, but in a real implementation
    // you would track monthly XP separately or filter based on date ranges
    
    // Get top users sorted by XP
    const users = await UserModel.find(query)
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
      ownsOgNft: user.ownsOgNft || false,
      // Add XP boost if user owns OG NFT
      xpBoost: user.ownsOgNft ? 1.2 : 1.0
    }));

    // Log successful response for debugging
    console.log(`${timeframe} leaderboard data fetched successfully. ${leaderboard.length} users returned.`);
    
    // Send the response as JSON
    return response.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error in leaderboard endpoint:', error);
    
    // Make sure to set content type for error responses too
    response.setHeader('Content-Type', 'application/json');
    
    return response.status(500).json({ 
      error: 'Failed to fetch leaderboard data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Handler for check-in endpoint
async function handleCheckIn(request: VercelRequest, response: VercelResponse) {
  try {
    // Authenticate user
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.status(401).json({ message: 'Not authorized' });
    }
    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    } catch (err) {
      return response.status(401).json({ message: 'Invalid token' });
    }
    const userId = decoded.id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);
    let currentStreak = user.checkInStreak || 0;
    let baseXpAwarded = 0;
    // Already checked in today?
    if (user.lastCheckedInAt && user.lastCheckedInAt >= todayStart) {
      return response.status(400).json({ 
        message: 'Already checked in today.', 
        user
      });
    }
    // Streak logic
    if (user.lastCheckedInAt && user.lastCheckedInAt >= yesterdayStart) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
    baseXpAwarded = Math.min(currentStreak, 30);
    const OG_NFT_XP_BOOST = 1.2;
    const finalXpAwarded = Math.round(baseXpAwarded * (user.ownsOgNft ? OG_NFT_XP_BOOST : 1));
    user.lastCheckedInAt = now;
    user.checkInStreak = currentStreak;
    user.xp += finalXpAwarded;
    // Add XP event
    if (!user.xpEvents) user.xpEvents = [];
    user.xpEvents.push({
      type: 'check-in',
      amount: finalXpAwarded,
      description: `Daily check-in (streak: ${currentStreak})`,
      date: now
    });
    const updatedUser = await user.save();
    return response.status(200).json({
      message: 'Check-in successful!',
      xpAwarded: finalXpAwarded,
      streak: currentStreak,
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Error during check-in:', error);
    response.status(500).json({ message: 'Server error during check-in', error: error.message });
  }
}

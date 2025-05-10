import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { connectDB } from '../../lib/database';
import UserModel from '../../lib/models/User';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    // Connect to database
    await connectDB();
    
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
    
    // Return user data
    response.status(200).json({
      id: user._id,
      walletAddress: user.walletAddress,
      username: user.username || null,
      xp: user.xp || 0,
      checkInStreak: user.checkInStreak || 0,
      ownsOgNft: user.ownsOgNft || false,
      completedQuestIds: user.completedQuestIds || []
    });
  } catch (error) {
    console.error('Error in users/me endpoint:', error);
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
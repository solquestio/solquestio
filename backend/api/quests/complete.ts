import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../lib/database';
import UserModel from '../../lib/models/User';
import QuestModel from '../../lib/models/Quest';
import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from '../../lib/config';

/**
 * Quest completion endpoint
 * Requires authentication
 */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication required'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(
      token,
      AUTH_CONFIG.JWT_SECRET
    ) as { id: string };
    
    // Connect to database
    await connectDB();

    // Extract request data
    const { questId } = request.body;
    
    if (!questId) {
      return response.status(400).json({ error: 'Quest ID is required' });
    }
    
    // Find the user
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }
    
    // Find the quest
    const quest = await QuestModel.findOne({ id: questId });
    if (!quest) {
      return response.status(404).json({ error: 'Quest not found' });
    }
    
    // Check if the quest is already completed
    if (user.completedQuestIds.includes(questId)) {
      return response.status(400).json({ 
        error: 'Quest already completed',
        message: 'This quest has already been completed by the user'
      });
    }
    
    // Update user with completed quest and XP
    user.completedQuestIds.push(questId);
    user.xp += quest.xpReward;
    await user.save();
    
    // Return updated user data
    response.status(200).json({
      success: true,
      questId,
      xpEarned: quest.xpReward,
      totalXp: user.xp,
      message: `Quest "${quest.title}" completed successfully!`
    });
  } catch (error) {
    console.error('Error completing quest:', error);
    
    // Handle JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      return response.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid authentication token'
      });
    }
    
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import { enableCors } from '../../lib/middleware/cors';
import { connectDB } from '../../lib/database';
import QuestModel from '../../lib/models/Quest';
import UserModel from '../../lib/models/User';
import { getTokenUser } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();
  const { path, id } = req.query;

  // Enable CORS for this endpoint
  enableCors(req, res);

  // Handle /api/quests/paths
  if (req.method === 'GET' && path === 'paths') {
    // --- Begin paths.ts logic ---
    try {
      const paths = await QuestModel.distinct('path');
      res.status(200).json({ paths });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch quest paths', message: error instanceof Error ? error.message : 'Unknown error' });
    }
    return;
  }

  // Handle /api/quests/complete
  if (req.method === 'POST' && path === 'complete') {
    // Get the authenticated user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const user = await getTokenUser(token);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const { questId, xpAmount } = req.body;
      
      if (!questId) {
        return res.status(400).json({ error: 'Quest ID is required' });
      }
      
      // Check if the quest exists
      const quest = await QuestModel.findById(questId);
      if (!quest) {
        return res.status(404).json({ error: 'Quest not found' });
      }
      
      // Check if the quest is already completed by the user
      if (user.completedQuestIds.includes(questId)) {
        return res.status(400).json({ error: 'Quest already completed' });
      }
      
      // Award XP and mark quest as completed
      const xpToAward = xpAmount || quest.xpReward || 0;
      
      // Add quest to completed quests
      user.completedQuestIds.push(questId);
      
      // Add XP to user
      user.xp = (user.xp || 0) + xpToAward;
      
      // Add XP events entry
      if (!user.xpEvents) {
        user.xpEvents = [];
      }
      
      user.xpEvents.push({
        type: 'quest_completion',
        description: `Completed "${quest.title}" quest`,
        date: new Date(),
        amount: xpToAward
      });
      
      // Save user
      await user.save();
      
      return res.status(200).json({
        success: true,
        message: 'Quest completed successfully',
        xpAwarded: xpToAward,
        user
      });
    } catch (error) {
      console.error('Error completing quest:', error);
      return res.status(500).json({ 
        error: 'Failed to complete quest', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Handle /api/quests/[id]
  if (id) {
    // --- Begin [id].ts logic ---
    try {
      const quest = await QuestModel.findById(id);
      if (!quest) {
        res.status(404).json({ error: 'Quest not found' });
        return;
      }
      res.status(200).json(quest);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch quest', message: error instanceof Error ? error.message : 'Unknown error' });
    }
    return;
  }

  // Default: /api/quests
  if (req.method === 'GET') {
    try {
      const quests = await QuestModel.find();
      res.status(200).json(quests);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch quests', message: error instanceof Error ? error.message : 'Unknown error' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

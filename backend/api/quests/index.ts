import { VercelRequest, VercelResponse } from '@vercel/node';
import { enableCors } from '../../lib/middleware/cors';
import { connectDB } from '../../lib/database';
import QuestModel from '../../lib/models/Quest';

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
    // --- Begin complete.ts logic ---
    // (You may need to copy your quest completion logic here)
    res.status(501).json({ error: 'Quest completion not implemented in this combined handler yet.' });
    return;
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

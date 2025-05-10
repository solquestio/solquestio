import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../lib/database';
import QuestModel from '../../lib/models/Quest';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Only allow GET requests
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to the database
    await connectDB();
    
    // Extract query parameters
    const { path, difficulty } = request.query;
    
    // Build query based on optional filters
    const query: any = {};
    
    if (path) {
      query.path = path;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // For demo purposes, return static data since we might not have quests in the database yet
    const demoQuests = [
      {
        id: 'verify-wallet',
        title: 'Connect Your Wallet',
        shortDescription: 'Connect your Solana wallet to SolQuest',
        difficulty: 'beginner',
        xpReward: 100,
        path: 'solana-foundations',
        order: 1
      },
      {
        id: 'explore-transaction-1',
        title: 'Explore a Transaction',
        shortDescription: 'Learn how to read Solana transaction details',
        difficulty: 'beginner',
        xpReward: 150,
        path: 'solana-foundations',
        order: 2
      },
      {
        id: 'visit-x-og',
        title: 'Follow Us on X',
        shortDescription: 'Follow SolQuest on X (Twitter)',
        difficulty: 'beginner',
        xpReward: 100,
        path: 'solquest-og',
        order: 1
      }
    ];
    
    // Return quests (using demo data for now)
    response.status(200).json(demoQuests);
  } catch (error) {
    console.error('Error fetching quests:', error);
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

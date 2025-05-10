import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../lib/database';
import QuestModel from '../../lib/models/Quest';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const { id } = request.query;
  
  // Validate quest ID
  if (!id || typeof id !== 'string') {
    return response.status(400).json({ error: 'Quest ID is required' });
  }

  try {
    // Connect to the database
    await connectDB();
    
    // Fetch the quest by ID
    const quest = await QuestModel.findOne({ id });
    
    // If quest not found
    if (!quest) {
      return response.status(404).json({ error: 'Quest not found' });
    }
    
    // Return the quest data
    response.status(200).json(quest);
  } catch (error) {
    console.error(`Error fetching quest ${id}:`, error);
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

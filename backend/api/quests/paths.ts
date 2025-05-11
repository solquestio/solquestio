import { VercelRequest, VercelResponse } from '@vercel/node';
import { enableCors } from '../../lib/middleware/cors';
import { connectDB } from '../../lib/database';
import QuestModel from '../../lib/models/Quest';

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
    // Connect to MongoDB
    await connectDB();
    
    // Fetch all unique paths from the quests collection
    const pathsData = await QuestModel.aggregate([
      { $group: { _id: "$pathId", quests: { $push: "$$ROOT" } } },
      { $project: {
        id: "$_id",
        title: { $arrayElemAt: ["$quests.pathTitle", 0] },
        description: { $arrayElemAt: ["$quests.pathDescription", 0] },
        questCount: { $size: "$quests" },
        totalXp: { $sum: "$quests.xpReward" },
        graphicType: { $arrayElemAt: ["$quests.graphicType", 0] },
        imageUrl: { $arrayElemAt: ["$quests.imageUrl", 0] },
        _id: 0
      }}
    ]);
    
    // If no paths found in database, handle gracefully
    let finalPaths = pathsData;
    if (!pathsData || pathsData.length === 0) {
      console.log('No learning paths found in database, using default paths');
      // Use default paths as fallback
      finalPaths = [
        {
          id: "solana-foundations",
          title: "Solana Explorer Path",
          description: "Learn the basics of Solana blockchain and explore its ecosystem.",
          questCount: 7,
          graphicType: "gradient",
          totalXp: 300
        },
        {
          id: "solquest-og",
          title: "SolQuest OG Path",
          description: "Become a SolQuest OG by completing these community quests.",
          questCount: 5,
          graphicType: "image",
          imageUrl: "/placeholder-nft.png",
          totalXp: 450
        }
      ];
    }
    
    console.log(`Successfully fetched ${finalPaths.length} learning paths`);
    response.status(200).json({ paths: finalPaths });
  } catch (error) {
    console.error('Error in quests/paths endpoint:', error);
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
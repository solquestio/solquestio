import { VercelRequest, VercelResponse } from '@vercel/node';
import QuestModel from '../../lib/models/Quest';
import { connectDB } from '../../lib/database';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // --- CORS HEADERS ---
  const origin = (request.headers.origin || '') as string;
  const allowedOrigins = ['https://www.solquest.io', 'https://solquest.io', 'http://localhost:3000'];
  const effectiveOrigin = allowedOrigins.includes(origin) ? origin : 'https://solquest.io';
  response.setHeader('Access-Control-Allow-Origin', effectiveOrigin);
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  response.setHeader('Vary', 'Origin');

  // --- Handle OPTIONS ---
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
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
      finalPaths = [
        {
          id: "solana-foundations",
          title: "Solana Explorer Path",
          description: "Learn the basics of Solana blockchain and explore its ecosystem.",
          questCount: 7,
          graphicType: "image",
          imageUrl: "/solana_v2_2b.jpg",
          totalXp: 1650
        },
        {
          id: "layerzero-path",
          title: "LayerZero Learning Path",
          description: "Explore omnichain interactions! Start by funding your Devnet wallet, then dive into sending messages and tokens across blockchains with LayerZero V2.",
          questCount: 5,
          graphicType: "image",
          imageUrl: "/layerzero.jpg",
          totalXp: 1500
        },
        {
          id: "zk-compression-path",
          title: "ZK Compression Innovators Path",
          description: "Learn about ZK Compression on Solana. Discover how to build scalable, private, and secure applications using compressed tokens and accounts.",
          questCount: 7,
          graphicType: "image",
          imageUrl: "/zk-compression.jpg",
          totalXp: 1000
        }
      ];
    }
    response.status(200).json({ paths: finalPaths });
  } catch (error) {
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
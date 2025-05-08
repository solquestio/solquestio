import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(request: VercelRequest, response: VercelResponse) {
  try {
    // Static data for the learning paths
    const paths = [
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

    response.status(200).json(paths);
  } catch (error) {
    console.error('Error in quests/paths endpoint:', error);
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(request: VercelRequest, response: VercelResponse) {
  try {
    // This would normally fetch from MongoDB, but for testing we'll return static data
    const staticLeaderboard = [
      {
        _id: "user1",
        walletAddress: "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQq",
        username: "SolanaLegend",
        xp: 1250,
        rank: 1,
        xpBoost: 1.2,
        ownsOgNft: true
      },
      {
        _id: "user2",
        walletAddress: "BbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRr",
        username: "CryptoExplorer",
        xp: 980,
        rank: 2,
        ownsOgNft: false
      },
      {
        _id: "user3",
        walletAddress: "CcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSs",
        username: "BlockchainWizard",
        xp: 875,
        rank: 3,
        ownsOgNft: false
      }
    ];

    response.status(200).json(staticLeaderboard);
  } catch (error) {
    console.error('Error in leaderboard endpoint:', error);
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
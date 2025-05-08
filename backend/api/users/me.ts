import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(request: VercelRequest, response: VercelResponse) {
  try {
    // Check for authorization header (would validate JWT in production)
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication required'
      });
    }

    // For testing/development, just return a mock user profile
    // In production, this would decode the JWT and fetch the user from MongoDB
    const mockUser = {
      id: "user123",
      walletAddress: "YourWalletAddressHere",
      username: "SolQuestUser",
      xp: 450,
      checkInStreak: 3,
      ownsOgNft: false,
      completedQuestIds: ["visit-x-se", "join-discord-se", "check-balance-1"]
    };

    response.status(200).json(mockUser);
  } catch (error) {
    console.error('Error in users/me endpoint:', error);
    response.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
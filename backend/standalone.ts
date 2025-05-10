import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express server
const app = express();
const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL;

// Middleware
app.use(express.json());
app.use(cors({
  origin: frontendUrl || '*',
}));

// Basic health check route
app.get('/', (req: Request, res: Response) => {
  res.send('SolQuest.io Backend Running! (Standalone Server)');
});

// Public Auth API info endpoint
app.get('/api/auth', (req: Request, res: Response) => {
  res.json({
    message: 'Auth API is running',
    endpoints: {
      challenge: 'POST /api/auth/challenge - Get a challenge message to sign',
      verify: 'POST /api/auth/verify - Verify signature and get JWT token'
    }
  });
});

// Public Quests endpoint
app.get('/api/quests', (req: Request, res: Response) => {
  // Demo quests for public access
  const publicQuests = [
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
  
  res.json(publicQuests);
});

// Quests paths endpoint (public)
app.get('/api/quests/paths', (req: Request, res: Response) => {
  const pathsMetadata = [
    {
      id: 'solana-foundations',
      title: 'Solana Explorer Path',
      description: "Dive deep into Solana's core concepts, learn to navigate the ecosystem, and complete foundational quests, starting with community engagement.",
      questCount: 7,
      totalXp: 1650,
      isLocked: false,
      graphicType: 'image',
      imageUrl: '/solana_v2_2b.jpg'
    },
    {
      id: 'solquest-og',
      title: 'SolQuest OG Path',
      description: 'Exclusive quests and learning experiences for SolQuest enthusiasts. Kick off your journey by connecting with our community!',
      questCount: 4,
      totalXp: 2500,
      isLocked: false,
      graphicType: 'image',
      imageUrl: '/Union.svg'
    }
  ];

  res.status(200).json({ paths: pathsMetadata });
});

// Start server
app.listen(port, () => {
  console.log(`Standalone server listening on port ${port}`);
});

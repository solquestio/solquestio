const express = require('express');
const cors = require('cors');

// Create Express server
const app = express();
const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(express.json());
app.use(cors({
  origin: frontendUrl,
}));

// Basic health check route
app.get('/', (req, res) => {
  res.send('SolQuest.io Backend Running! (Standalone Server)');
});

// Public Auth API info endpoint
app.get('/api/auth', (req, res) => {
  res.json({
    message: 'Auth API is running',
    endpoints: {
      challenge: 'POST /api/auth/challenge - Get a challenge message to sign',
      verify: 'POST /api/auth/verify - Verify signature and get JWT token'
    }
  });
});

// Public Quests endpoint
app.get('/api/quests', (req, res) => {
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
app.get('/api/quests/paths', (req, res) => {
  const pathsMetadata = [
    {
      id: 'solana-foundations',
      title: 'Solana Explorer Path',
      description: "Dive deep into Solana's core concepts, learn to navigate the ecosystem, and complete foundational quests, starting with community engagement.",
      questCount: 3,
      totalXp: 500,
      isLocked: false,
      graphicType: 'image',
      imageUrl: '/solana-logo.svg',
      isDemo: false,
      statusTextOverride: 'Production Ready'
    },
    {
      id: 'substreams-path',
      title: 'The Graph Substreams on Solana',
      description: 'Learn to index blockchain data with The Graph Substreams. Build powerful and efficient data pipelines for Solana dApps.',
      questCount: 9,
      totalXp: 2150,
      isLocked: false,
      graphicType: 'image',
      imageUrl: '/substreams.svg',
      isDemo: true,
      statusTextOverride: 'Demo - Hackathon Ready'
    }
  ];

  res.status(200).json({ paths: pathsMetadata });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Standalone server listening on port ${port}`);
  console.log(`🌐 Frontend URL: ${frontendUrl}`);
  console.log(`📡 API available at: http://localhost:${port}/api`);
}); 
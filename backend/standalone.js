const express = require('express');
const cors = require('cors');

// Create Express server
const app = express();
const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    frontendUrl
  ],
  credentials: true
}));

// Simple in-memory storage for user data
const userStorage = new Map();

// Helper function to get or create user data
const getUserData = (walletAddress) => {
  if (!userStorage.has(walletAddress)) {
    // Create new user with default data
    const newUser = {
      id: Date.now().toString(),
      walletAddress: walletAddress,
      username: 'Unnamed User',
      completedQuestIds: [],
      xp: 0,
      lastCheckedInAt: null,
      checkInStreak: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownsOgNft: false,
      xpHistory: [],
      social: {
        github: null,
        twitter: null
      }
    };
    userStorage.set(walletAddress, newUser);
  }
  return userStorage.get(walletAddress);
};

// Helper function to update user data
const updateUserData = (walletAddress, updates) => {
  const userData = getUserData(walletAddress);
  const updatedUser = {
    ...userData,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  userStorage.set(walletAddress, updatedUser);
  return updatedUser;
};

// Helper function to add XP and history entry
const addXpToUser = (walletAddress, amount, description) => {
  const userData = getUserData(walletAddress);
  const newXp = userData.xp + amount;
  const historyEntry = {
    description,
    timestamp: new Date().toISOString(),
    amount
  };
  
  const updatedUser = updateUserData(walletAddress, {
    xp: newXp,
    xpHistory: [historyEntry, ...userData.xpHistory]
  });
  
  return updatedUser;
};

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

// Users/Leaderboard endpoint
app.get('/api/users', (req, res) => {
  const { path, limit } = req.query;
  
  if (path === 'leaderboard') {
    // Mock leaderboard data
    const mockLeaderboard = [
      {
        _id: '1',
        walletAddress: '8nL...qKSM',
        username: '8nL...qKSM',
        xp: 2850,
        rank: 1,
        xpBoost: 1.1
      },
      {
        _id: '2',
        walletAddress: '2wB...PRCX',
        username: '2wB...PRCX',
        xp: 1950,
        rank: 2,
        xpBoost: 1.0
      },
      {
        _id: '3',
        walletAddress: '5mK...7dFG',
        username: '5mK...7dFG',
        xp: 1420,
        rank: 3,
        xpBoost: 1.2
      }
    ];
    
    const limitNum = parseInt(limit) || 10;
    const limitedResults = mockLeaderboard.slice(0, limitNum);
    
    res.json(limitedResults);
  } else if (path === 'me') {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    // Extract wallet address from token
    const token = authHeader.split(' ')[1];
    const tokenParts = token.split('-');
    const walletAddress = tokenParts[tokenParts.length - 1];
    
    if (!walletAddress) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Get user data from storage
    const userData = getUserData(walletAddress);
    res.json(userData);
  } else {
    res.json([]);
  }
});

// User profile update endpoint
app.put('/api/users', (req, res) => {
  const { path } = req.query;
  const { username } = req.body;
  
  if (path === 'me') {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    // Extract wallet address from token
    const token = authHeader.split(' ')[1];
    const tokenParts = token.split('-');
    const walletAddress = tokenParts[tokenParts.length - 1];
    
    if (!walletAddress) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Validate username
    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        message: 'Username must be at least 3 characters long'
      });
    }
    
    if (username.trim().length > 15) {
      return res.status(400).json({
        message: 'Username cannot exceed 15 characters'
      });
    }
    
    // Update user data
    const updatedProfile = updateUserData(walletAddress, {
      username: username.trim()
    });
    
    res.json(updatedProfile);
  } else {
    res.status(404).json({ message: 'Endpoint not found' });
  }
});

// Auth verification endpoint
app.post('/api/auth', (req, res) => {
  const { action } = req.query;
  
  if (action === 'verify') {
    const { walletAddress, signature, message } = req.body;
    
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        message: 'Missing required fields: walletAddress, signature, message'
      });
    }
    
    // Mock successful authentication
    const mockToken = `mock-jwt-token-${Date.now()}-${walletAddress}`;
    const userData = getUserData(walletAddress);
    
    res.json({
      token: mockToken,
      user: userData,
      message: 'Authentication successful'
    });
  } else {
    res.status(400).json({ message: 'Invalid action. Use ?action=verify' });
  }
});

// Daily check-in endpoint
app.post('/api/users', (req, res) => {
  const { path } = req.query;
  
  if (path === 'check-in') {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    // Extract wallet address from token
    const token = authHeader.split(' ')[1];
    const tokenParts = token.split('-');
    const walletAddress = tokenParts[tokenParts.length - 1];
    
    if (!walletAddress) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    const userData = getUserData(walletAddress);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check if already checked in today
    if (userData.lastCheckedInAt) {
      const lastCheckDate = new Date(userData.lastCheckedInAt);
      if (lastCheckDate >= todayStart) {
        return res.status(400).json({
          message: 'Already checked in today',
          user: userData
        });
      }
    }
    
    // Calculate streak
    let newStreak = 1;
    if (userData.lastCheckedInAt) {
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(todayStart.getDate() - 1);
      const lastCheckDate = new Date(userData.lastCheckedInAt);
      
      if (lastCheckDate >= yesterdayStart) {
        // Consecutive day, continue streak
        newStreak = userData.checkInStreak + 1;
      }
      // If last check was before yesterday, streak resets to 1
    }
    
    // Calculate XP based on streak (max 30 XP)
    const xpAwarded = Math.min(newStreak, 30);
    
    // Update user data
    const updatedUser = updateUserData(walletAddress, {
      lastCheckedInAt: now.toISOString(),
      checkInStreak: newStreak
    });
    
    // Add XP and history entry
    const finalUser = addXpToUser(walletAddress, xpAwarded, 'Daily check-in');
    
    res.json({
      message: 'Check-in successful!',
      xpAwarded: xpAwarded,
      user: finalUser
    });
  } else {
    res.status(404).json({ message: 'Endpoint not found' });
  }
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
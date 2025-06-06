import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors'; // Import cors
import authRoutes from './routes/auth'; // Import the auth routes
import userRoutes from './routes/user'; // Import user routes
import questRoutes from './routes/quests'; // Import quest routes
import pathRoutes from './routes/paths'; // Import paths routes

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;
const frontendUrl = process.env.FRONTEND_URL;

// --- Database Connection ---
const connectDB = async () => {
  if (!mongoUri) {
    console.error('Error: MONGO_URI is not defined in environment variables.');
    process.exit(1); // Exit if DB connection string is missing
  }
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected...');
  } catch (err: any) {
    console.error('MongoDB Connection Error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

connectDB(); // Attempt to connect to the database on startup
// -------------------------

// --- Middleware ---
const allowedOrigins = [
  'https://solquest.io',
  'https://www.solquest.io', 
  'https://solquestio-frontend.vercel.app',
  'https://solquestio.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://solquestio-git-main-solquest.vercel.app',
  'https://solquestio-solquest.vercel.app',
  'https://sol-quests.io',
  'https://www.sol-quests.io'
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json()); // Middleware to parse JSON bodies
// ------------------

// --- Public API Routes ---
// Define a middleware that intercepts '/api/quests' GET requests before they hit the protected routes
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

// Define a public endpoint for /api/auth // Temporarily comment out
// app.get('/api/auth', (req: Request, res: Response) => { // Temporarily comment out
//   res.json({ // Temporarily comment out
//     message: 'Auth API is running', // Temporarily comment out
//     endpoints: { // Temporarily comment out
//       challenge: 'POST /api/auth/challenge - Get a challenge message to sign', // Temporarily comment out
//       verify: 'POST /api/auth/verify - Verify signature and get JWT token' // Temporarily comment out
//     } // Temporarily comment out
//   }); // Temporarily comment out
// }); // Temporarily comment out

// --- Protected API Routes ---
app.use('/api/auth', authRoutes); // Mount the auth routes
app.use('/api/users', userRoutes); // Mount user routes 
app.use('/api/quests', questRoutes); // Mount quest routes (handles /api/quests/paths as well)
app.use('/api/paths', pathRoutes); // Mount paths routes

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('SolQuest.io Backend Running! (MongoDB)');
});

// TODO: Add authentication routes (e.g., /auth/verify)
// TODO: Add user profile routes (e.g., /users/me)
// TODO: Add quest routes (e.g., /quests)

// --- Conditional Listen for Local Development ---
// Only run app.listen if not in a Vercel environment
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Backend server listening locally on port ${port}`);
    });
}
// --- Export the app for Vercel ---
export default app; 
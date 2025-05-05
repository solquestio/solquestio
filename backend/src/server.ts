import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors'; // Import cors
import authRoutes from './routes/auth'; // Import the auth routes
import userRoutes from './routes/user'; // Import user routes

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

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
// Enable CORS for all origins (for development)
// TODO: Configure specific origins for production
app.use(cors()); 
app.use(express.json()); // Middleware to parse JSON bodies
// ------------------

// --- API Routes ---
app.use('/api/auth', authRoutes); // Mount the auth routes
app.use('/api/users', userRoutes); // Mount user routes
// TODO: app.use('/api/quests', questRoutes);
// ------------------

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('SolQuest.io Backend Running! (MongoDB)');
});

// TODO: Add authentication routes (e.g., /auth/verify)
// TODO: Add user profile routes (e.g., /users/me)
// TODO: Add quest routes (e.g., /quests)

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
}); 
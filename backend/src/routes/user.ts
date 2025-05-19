import express, { Request, Response, Router } from 'express';
import { protect } from '../middleware/authMiddleware'; // Import the protect middleware
import User from '../models/User'; // Import User model

const router: Router = express.Router();

const DAILY_CHECK_IN_XP = 5; // XP reward for daily check-in

// GET /api/users/me - Get current user's profile
router.get('/me', protect, async (req: Request, res: Response) => {
  // req.user is attached by the protect middleware
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, user data missing from token' });
  }

  try {
    // Find the user by ID from the token payload
    const user = await User.findById(req.user.userId).select('-__v'); // Exclude __v field

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user); // Return user data
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/users/leaderboard - Get top users by XP
router.get('/leaderboard', async (req: Request, res: Response) => {
     try {
        const limit = parseInt(req.query.limit as string) || 20;
        const timeframe = req.query.timeframe as string;
        let query = {};

        // If timeframe is 'monthly', we should filter based on activity in the current month
        if (timeframe === 'monthly') {
            // Get the start of the current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            // For demonstration purposes, we're just using the same query
            // In a real implementation, you would track monthly XP separately
            // or filter users based on activity timestamps
            // For now, we'll just use the same data for both timeframes
            console.log(`Fetching leaderboard for monthly timeframe since ${startOfMonth.toISOString()}`);
        } else {
            console.log('Fetching leaderboard for all-time (total) timeframe');
        }
        
        // Fetch users including ownsOgNft status
        const leaderboardUsers = await User.find(query)
            .sort({ xp: -1 })
            .limit(limit)
            .select('walletAddress username xp ownsOgNft'); // Include ownsOgNft
        
        // --- Define Boost Constants ---
        const OG_NFT_XP_BOOST = 1.2; 
        const OG_NFT_REWARD_BOOST = 1.1; // Example: 10% reward boost

        // Map to desired response format, adding boost info
        const responseData = leaderboardUsers.map(user => ({
            _id: user._id,
            walletAddress: user.walletAddress,
            username: user.username,
            xp: user.xp,
            xpBoost: user.ownsOgNft ? OG_NFT_XP_BOOST : undefined, // Add boost only if they own it
            rewardBoost: user.ownsOgNft ? OG_NFT_REWARD_BOOST : undefined,
        }));
        
        res.status(200).json(responseData);
    } catch (error: any) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Server error fetching leaderboard', error: error.message });
    }
});

// PUT /api/users/me - Update current user's profile (initially just username)
router.put('/me', protect, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    const { userId } = req.user;
    const { username } = req.body;

    // 1. Validate Input
    if (!username || typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 15) {
        return res.status(400).json({ message: 'Username must be between 3 and 15 characters.' });
    }
    // Optional: Add more validation like allowed characters (regex)
    const trimmedUsername = username.trim();

    try {
        // 2. Check if username is already taken by another user
        const existingUser = await User.findOne({ 
            username: { $regex: `^${trimmedUsername}$`, $options: 'i' }, // Case-insensitive check
            _id: { $ne: userId } // Exclude the current user
        });

        if (existingUser) {
            return res.status(409).json({ message: 'Username already taken.' }); // 409 Conflict
        }

        // 3. Update User
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username: trimmedUsername }, 
            { new: true, runValidators: true } // Return updated doc, run schema validators
        ).select('-__v'); // Exclude __v

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found during update.' });
        }

        // 4. Return updated user data
        res.status(200).json(updatedUser);

    } catch (error: any) {
        console.error(`Error updating username for user ${userId}:`, error);
        // Handle potential validation errors from schema
        if (error.name === 'ValidationError') {
             return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error updating username.' });
    }
});

// POST /api/users/check-in - Daily check-in for XP with streak bonus
router.post('/check-in', protect, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    const { userId } = req.user;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today UTC
        const yesterdayStart = new Date(todayStart); // Copy todayStart
        yesterdayStart.setDate(todayStart.getDate() - 1); // Set to start of yesterday UTC

        let currentStreak = user.checkInStreak || 0;
        let baseXpAwarded = 0;

        // Check eligibility (Already checked in today?)
        if (user.lastCheckedInAt && user.lastCheckedInAt >= todayStart) {
            return res.status(400).json({ 
                message: 'Already checked in today.', 
                user // Return current user state, including streak
            });
        }

        // Check if streak continues or resets
        if (user.lastCheckedInAt && user.lastCheckedInAt >= yesterdayStart) {
            currentStreak += 1;
        } else {
            currentStreak = 1; 
        }

        // Calculate base XP based on streak
        baseXpAwarded = Math.min(currentStreak, 30);
        
        // Apply NFT boost if applicable
        const OG_NFT_XP_BOOST = 1.2; // Example: 20% boost
        const finalXpAwarded = Math.round(baseXpAwarded * (user.ownsOgNft ? OG_NFT_XP_BOOST : 1));

        // Update user document
        user.lastCheckedInAt = now;
        user.checkInStreak = currentStreak;
        user.xp += finalXpAwarded; // Use final XP
        // Add XP event
        if (!user.xpEvents) user.xpEvents = [];
        user.xpEvents.push({
          type: 'check-in',
          amount: finalXpAwarded,
          description: `Daily check-in (streak: ${currentStreak})`,
          date: now
        });
        const updatedUser = await user.save();
        console.log(`User ${userId} checked in. Streak: ${currentStreak}. BaseXP: ${baseXpAwarded}. NFT Boost: ${user.ownsOgNft}. Final XP: ${finalXpAwarded}.`);

        res.status(200).json({
            message: 'Check-in successful!',
            xpAwarded: finalXpAwarded, // Return final XP
            streak: currentStreak, 
            user: updatedUser 
        });

    } catch (error: any) {
        console.error(`Error during check-in for user ${userId}:`, error);
        res.status(500).json({ message: 'Server error during check-in', error: error.message });
    }
});

// TODO: Add route to update username (e.g., PUT /api/users/me/username)

export default router; 
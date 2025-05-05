import express, { Request, Response, Router } from 'express';
import { protect } from '../middleware/authMiddleware'; // Import the protect middleware
import User from '../models/User'; // Import User model

const router: Router = express.Router();

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

// TODO: Add route to update username (e.g., PUT /api/users/me/username)

export default router; 
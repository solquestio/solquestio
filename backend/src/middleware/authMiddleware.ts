import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user payload from JWT
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; walletAddress: string };
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Access directly from process.env
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined for middleware.');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  // Check for token in Authorization header (Bearer TOKEN)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, jwtSecret) as { userId: string; walletAddress: string };

      // Attach user payload to request object (excluding sensitive data)
      // We might fetch the full user from DB here if needed, but for now just attach decoded info
      req.user = decoded; 
      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
}; 
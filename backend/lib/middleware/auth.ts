import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

// Define environment variables type
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET?: string;
    }
  }
}

// Extend the request type
export interface ExtendedRequest extends VercelRequest {
  user?: IUser;
  userId?: string;
}

// Interface for JWT payload
interface JwtPayload {
  id: string;
  walletAddress: string;
  iat: number;
  exp: number;
}

/**
 * Middleware to authenticate JWT tokens
 * Adds the user ID to the request object if authenticated
 */
export const authenticateToken = async (
  req: ExtendedRequest,
  res: VercelResponse,
  next: () => void
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret'
    ) as JwtPayload;

    // Add user ID to request
    req.userId = decoded.id;

    // Continue to the next middleware/handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Helper function to apply middleware to a Vercel serverless function
 */
export const withAuth = (handler: Function) => {
  return async (req: VercelRequest, res: VercelResponse) => {
    return new Promise<void>((resolve) => {
      authenticateToken(req, res, async () => {
        await handler(req, res);
        resolve();
      });
    });
  };
};

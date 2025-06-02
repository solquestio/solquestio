import jwt from 'jsonwebtoken';
import { connectDB } from './database';
import UserModel, { IUser } from './models/User';

export interface JwtPayload {
  id: string;
  walletAddress: string;
  iat: number;
  exp: number;
}

export const getTokenUser = async (token: string): Promise<IUser | null> => {
  try {
    if (!token) {
      return null;
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret'
    ) as JwtPayload;

    // Connect to database
    await connectDB();

    // Get user from database
    const user = await UserModel.findById(decoded.id);
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}; 
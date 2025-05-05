import mongoose, { Schema, Document } from 'mongoose';

// Interface representing a document in MongoDB.
export interface IUser extends Document {
  walletAddress: string;
  username?: string; // Optional username
  completedQuests: string[]; // Array of completed quest IDs (or identifiers)
  createdAt: Date;
  updatedAt: Date;
}

// Schema corresponding to the document interface.
const UserSchema: Schema = new Schema(
  {
    walletAddress: {
      type: String,
      required: [true, 'Wallet address is required'],
      unique: true,
      trim: true,
      index: true, // Index for faster lookups
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null/undefined values for uniqueness
      trim: true,
    },
    completedQuests: {
      type: [String], // Simple array of strings for now
      default: [],
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Export the Mongoose model.
export default mongoose.model<IUser>('User', UserSchema); 
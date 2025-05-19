import mongoose, { Schema, Document } from 'mongoose';

// Interface representing a document in MongoDB.
export interface IXpEvent {
  type: string;
  amount: number;
  description: string;
  date: Date;
}

export interface IUser extends Document {
  walletAddress: string;
  username?: string; // Optional username
  completedQuestIds: string[]; // Array to store IDs of completed quests
  xp: number; // Experience points earned by the user
  lastCheckedInAt?: Date; // Add lastCheckedInAt field
  checkInStreak?: number; // Add checkInStreak field
  ownsOgNft?: boolean; // Add ownsOgNft field
  xpEvents?: IXpEvent[];

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
    completedQuestIds: {
      type: [String], // Defines an array of strings
      required: true,
      default: [], // Defaults to an empty array
    },
    xp: {
        type: Number,
        required: true,
        default: 0, // Start users with 0 XP
    },
    lastCheckedInAt: {
      type: Date,
      required: false,
    },
    checkInStreak: {
        type: Number,
        required: true,
        default: 0, // Default streak is 0
    },
    ownsOgNft: {
        type: Boolean,
        required: true,
        default: false, // Default to false
    },
    xpEvents: [
      {
        type: { type: String, required: true },
        amount: { type: Number, required: true },
        description: { type: String, required: true },
        date: { type: Date, default: Date.now }
      }
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Export the Mongoose model.
export default mongoose.model<IUser>('User', UserSchema); 
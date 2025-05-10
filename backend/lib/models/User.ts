import mongoose, { Schema, Document } from 'mongoose';

// Interface representing a document in MongoDB.
export interface IUser extends Document {
  walletAddress: string;
  username?: string; // Optional username
  completedQuestIds: string[]; // Array to store IDs of completed quests
  xp: number; // Experience points earned by the user
  lastCheckedInAt?: Date; // Add lastCheckedInAt field
  checkInStreak?: number; // Add checkInStreak field
  ownsOgNft?: boolean; // Add ownsOgNft field

  // Referral System Fields
  referralCode?: string; // Unique code for this user to share
  referrer?: mongoose.Types.ObjectId; // User who referred this user
  referredUsersCount?: number; // How many users this user has referred
  xpFromReferrals?: number; // XP earned from their referrals' activities

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

    // Referral System Fields
    referralCode: {
        type: String,
        unique: true,
        sparse: true, // Allows nulls if not immediately generated, but good for uniqueness
        index: true,
    },
    referrer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Not all users will have a referrer
    },
    referredUsersCount: {
        type: Number,
        default: 0,
    },
    xpFromReferrals: {
        type: Number,
        default: 0,
    }
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Export the Mongoose model.
export default mongoose.model<IUser>('User', UserSchema);

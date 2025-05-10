import mongoose, { Schema, Document } from 'mongoose';

export interface IQuest extends Document {
  id: string;             // Unique identifier for the quest
  title: string;          // Human-readable title
  description: string;    // Long description of what the user needs to do
  shortDescription: string; // Short summary for cards
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // Difficulty level
  xpReward: number;       // XP earned when completing
  path: string;           // Which learning path this belongs to
  order: number;          // Order within the path
  requirements?: string[]; // Prerequisites (IDs of quests that must be completed first)
  content?: string;       // Markdown content with detailed instructions
  verificationMethod: 'manual' | 'onchain' | 'code' | 'webhook'; // How completion is verified
  verificationParams?: Record<string, any>; // Parameters for verification
  createdAt: Date;        // When the quest was created
  updatedAt: Date;        // When the quest was last updated
}

const QuestSchema: Schema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
      default: 'beginner',
    },
    xpReward: {
      type: Number,
      required: true,
      min: 0,
    },
    path: {
      type: String,
      required: true,
      index: true,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    requirements: {
      type: [String],
      default: [],
    },
    content: {
      type: String,
    },
    verificationMethod: {
      type: String,
      enum: ['manual', 'onchain', 'code', 'webhook'],
      required: true,
    },
    verificationParams: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Quest || mongoose.model<IQuest>('Quest', QuestSchema);

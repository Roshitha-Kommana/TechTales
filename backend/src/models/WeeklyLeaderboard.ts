import mongoose, { Schema, Document } from 'mongoose';

export interface IWeeklyLeaderboard extends Document {
  userId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  weekEndDate: Date;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyLeaderboardSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weekStartDate: { type: Date, required: true },
    weekEndDate: { type: Date, required: true },
    points: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find a user's record for a specific week and enforce uniqueness
WeeklyLeaderboardSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });
// Index on points + weekStartDate for fast leaderboard queries
WeeklyLeaderboardSchema.index({ weekStartDate: 1, points: -1 });

export const WeeklyLeaderboard = mongoose.model<IWeeklyLeaderboard>('WeeklyLeaderboard', WeeklyLeaderboardSchema);

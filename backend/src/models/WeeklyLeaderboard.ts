import mongoose, { Schema, Document } from 'mongoose';

export interface IWeeklyLeaderboard extends Document {
  userId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  weeklyPoints: number;
  quizzesCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyLeaderboardSchema = new Schema<IWeeklyLeaderboard>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    weekStartDate: { type: Date, required: true },
    weeklyPoints: { type: Number, default: 0 },
    quizzesCompleted: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique user per week
WeeklyLeaderboardSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });

// Index for efficient querying
WeeklyLeaderboardSchema.index({ weekStartDate: 1, weeklyPoints: -1 });

// Helper function to get the start of the current week (Monday)
export function getWeekStartDate(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const WeeklyLeaderboard = mongoose.model<IWeeklyLeaderboard>('WeeklyLeaderboard', WeeklyLeaderboardSchema);

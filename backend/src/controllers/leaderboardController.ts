import { Request, Response } from 'express';
import { User } from '../models/User';
import { WeeklyLeaderboard } from '../models/WeeklyLeaderboard';
import { AuthRequest } from '../middleware/auth';

/**
 * Get current week bounds (Monday to Sunday)
 */
const getCurrentWeekBounds = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0); // Start at midnight
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999); // End at next Sunday 23:59:59

  return { startOfWeek, endOfWeek };
};

/**
 * Add points to a user's account and the weekly leaderboard
 */
export const addUserPoints = async (userId: string, points: number): Promise<void> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User ${userId} not found when trying to add points`);
      return;
    }

    // Add total points to user
    user.points = (user.points || 0) + points;
    await user.save();

    // Add points to current week's leaderboard
    const { startOfWeek, endOfWeek } = getCurrentWeekBounds();
    await WeeklyLeaderboard.findOneAndUpdate(
      { userId: user._id, weekStartDate: startOfWeek },
      { 
        $setOnInsert: { weekEndDate: endOfWeek },
        $inc: { points: points }
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error adding user points:', error);
    throw error;
  }
};

/**
 * Get leaderboard data
 */
export const getLeaderboardController = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { startOfWeek, endOfWeek } = getCurrentWeekBounds();
    
    // Fetch top users for the current week, sorted by weekly points
    const topWeeklyRecords = await WeeklyLeaderboard.find({ weekStartDate: startOfWeek })
      .populate('userId', 'name email points learningStreak _id')
      .sort({ points: -1 })
      .limit(100);

    const leaderboard = topWeeklyRecords
      .filter(record => record.userId != null) // Filter out deleted users
      .map((record, index) => {
        const u = record.userId as any;
        return {
          rank: index + 1,
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          points: u.points || 0, // All-time points
          weeklyPoints: record.points || 0, // Weekly points
          learningStreak: u.learningStreak || 0
        };
      });

    // Find current user's rank if requested
    let currentUser = null;
    if (authReq.userId) {
      const user = await User.findById(authReq.userId);
      if (user) {
        let rank = null;
        let weeklyPoints = 0;

        const rankIndex = leaderboard.findIndex(u => u.id === authReq.userId);
        if (rankIndex !== -1) {
          rank = rankIndex + 1;
          weeklyPoints = leaderboard[rankIndex].weeklyPoints;
        } else {
          // Check if they have a WeeklyLeaderboard entry that just didn't make top 100
          const userWeekly = await WeeklyLeaderboard.findOne({ userId: user._id, weekStartDate: startOfWeek });
          if (userWeekly) {
            weeklyPoints = userWeekly.points;
            // Best effort rank
            const betterUsersCount = await WeeklyLeaderboard.countDocuments({ 
              weekStartDate: startOfWeek, 
              points: { $gt: weeklyPoints }
            });
            rank = betterUsersCount + 1;
          }
        }
        
        currentUser = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          points: user.points || 0,
          weeklyPoints,
          learningStreak: user.learningStreak || 0,
          rank
        };
      }
    }

    res.json({
      success: true,
      leaderboard,
      currentUser,
      weekInfo: {
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString(),
        displayRange: `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`
      }
    });

  } catch (error) {
    console.error('Error in getLeaderboardController:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
};

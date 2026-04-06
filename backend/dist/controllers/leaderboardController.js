"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUserPoints = exports.resetWeeklyLeaderboard = exports.getLeaderboardController = void 0;
const User_1 = require("../models/User");
const WeeklyLeaderboard_1 = require("../models/WeeklyLeaderboard");
// Get weekly leaderboard with streaks
const getLeaderboardController = async (req, res) => {
    try {
        const authReq = req;
        // Get the current week's start date
        const weekStartDate = (0, WeeklyLeaderboard_1.getWeekStartDate)();
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 7);
        // Get top 50 users sorted by weekly points (descending), fallback to total points
        const topUsers = await User_1.User.find({})
            .select('name email points weeklyPoints learningStreak')
            .sort({ weeklyPoints: -1, points: -1 })
            .limit(50)
            .lean();
        // Get current user if authenticated
        let currentUser = null;
        let currentUserRank = null;
        if (authReq.userId) {
            currentUser = await User_1.User.findById(authReq.userId)
                .select('email name points weeklyPoints learningStreak')
                .lean();
            // Calculate current user's rank based on weekly points
            if (currentUser) {
                const usersAbove = await User_1.User.countDocuments({
                    $or: [
                        { weeklyPoints: { $gt: currentUser.weeklyPoints || 0 } },
                        {
                            weeklyPoints: currentUser.weeklyPoints || 0,
                            points: { $gt: currentUser.points || 0 }
                        }
                    ]
                });
                currentUserRank = usersAbove + 1;
            }
        }
        // Transform users to include rank
        const leaderboard = topUsers.map((user, index) => ({
            rank: index + 1,
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            points: user.points || 0,
            weeklyPoints: user.weeklyPoints || 0,
            learningStreak: user.learningStreak || 0,
        }));
        // Format week dates for display
        const weekInfo = {
            startDate: weekStartDate.toISOString(),
            endDate: weekEndDate.toISOString(),
            displayRange: `${formatDate(weekStartDate)} - ${formatDate(new Date(weekEndDate.getTime() - 1))}`,
        };
        res.json({
            success: true,
            leaderboard,
            weekInfo,
            currentUser: currentUser ? {
                id: currentUser._id.toString(),
                email: currentUser.email,
                name: currentUser.name,
                points: currentUser.points || 0,
                weeklyPoints: currentUser.weeklyPoints || 0,
                learningStreak: currentUser.learningStreak || 0,
                rank: currentUserRank,
            } : null,
        });
    }
    catch (error) {
        console.error('Error in getLeaderboardController:', error);
        res.status(500).json({
            error: 'Failed to fetch leaderboard',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.getLeaderboardController = getLeaderboardController;
// Reset weekly points for all users (should be called via scheduled job)
const resetWeeklyLeaderboard = async (req, res) => {
    try {
        // Reset all users' weekly points to 0
        await User_1.User.updateMany({}, { $set: { weeklyPoints: 0 } });
        res.json({
            success: true,
            message: 'Weekly leaderboard has been reset',
        });
    }
    catch (error) {
        console.error('Error resetting weekly leaderboard:', error);
        res.status(500).json({
            error: 'Failed to reset weekly leaderboard',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.resetWeeklyLeaderboard = resetWeeklyLeaderboard;
// Add points to user (can be called after quiz completion)
const addUserPoints = async (userId, pointsToAdd) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const user = await User_1.User.findById(userId);
        if (!user)
            return;
        // Update both total and weekly points
        user.points = (user.points || 0) + pointsToAdd;
        user.weeklyPoints = (user.weeklyPoints || 0) + pointsToAdd;
        // Update learning streak
        const lastActivity = user.lastActivityDate;
        if (lastActivity) {
            const lastActivityDate = new Date(lastActivity);
            lastActivityDate.setHours(0, 0, 0, 0);
            const dayDiff = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff === 1) {
                // Consecutive day - increment streak
                user.learningStreak = (user.learningStreak || 0) + 1;
            }
            else if (dayDiff > 1) {
                // Missed days - reset streak
                user.learningStreak = 1;
            }
            // Same day - don't change streak
        }
        else {
            // First activity
            user.learningStreak = 1;
        }
        user.lastActivityDate = today;
        await user.save();
    }
    catch (error) {
        console.error('Error adding user points:', error);
    }
};
exports.addUserPoints = addUserPoints;
// Helper function to format date as "Jan 27"
function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
}
//# sourceMappingURL=leaderboardController.js.map
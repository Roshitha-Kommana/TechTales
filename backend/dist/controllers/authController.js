"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordController = exports.updateProfileController = exports.getCurrentUserController = exports.loginController = exports.updateLearningStreakOnActivity = exports.signupController = void 0;
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const signupController = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Validation
        if (!email || !password || !name) {
            res.status(400).json({ error: 'Email, password, and name are required' });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters long' });
            return;
        }
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            res.status(409).json({ error: 'User with this email already exists' });
            return;
        }
        // Create new user
        const user = new User_1.User({
            email,
            password,
            name,
        });
        await user.save();
        // Generate token
        const token = (0, auth_1.generateToken)(user._id.toString(), user.email, user.name);
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (error) {
        console.error('Error in signupController:', error);
        res.status(500).json({
            error: 'Failed to create user',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.signupController = signupController;
// Helper function to update learning streak
const updateLearningStreak = async (user) => {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istNow = new Date(now.getTime() + istOffset);
    // Get today's date at midnight IST
    const todayIST = new Date(istNow);
    todayIST.setHours(0, 0, 0, 0);
    if (!user.lastLoginDate) {
        // First login
        user.lastLoginDate = todayIST;
        user.learningStreak = 1;
        await user.save();
        return 1;
    }
    const lastLoginIST = new Date(user.lastLoginDate);
    lastLoginIST.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((todayIST.getTime() - lastLoginIST.getTime()) / (24 * 60 * 60 * 1000));
    if (daysDiff === 0) {
        // Same day login, don't update streak
        return user.learningStreak || 0;
    }
    else if (daysDiff === 1) {
        // Consecutive day, increment streak
        user.learningStreak = (user.learningStreak || 0) + 1;
        user.lastLoginDate = todayIST;
        await user.save();
        return user.learningStreak;
    }
    else {
        // Streak broken, reset to 1
        user.learningStreak = 1;
        user.lastLoginDate = todayIST;
        await user.save();
        return 1;
    }
};
// Helper function to update learning streak based on activity (story generation)
const updateLearningStreakOnActivity = async (userId) => {
    const user = await User_1.User.findById(userId);
    if (!user) {
        return 0;
    }
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istNow = new Date(now.getTime() + istOffset);
    // Get today's date at midnight IST
    const todayIST = new Date(istNow);
    todayIST.setHours(0, 0, 0, 0);
    if (!user.lastLoginDate) {
        // First activity
        user.lastLoginDate = todayIST;
        user.learningStreak = 1;
        await user.save();
        return 1;
    }
    const lastActivityIST = new Date(user.lastLoginDate);
    lastActivityIST.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((todayIST.getTime() - lastActivityIST.getTime()) / (24 * 60 * 60 * 1000));
    if (daysDiff === 0) {
        // Same day activity, don't update streak
        return user.learningStreak || 0;
    }
    else if (daysDiff === 1) {
        // Consecutive day activity, increment streak
        user.learningStreak = (user.learningStreak || 0) + 1;
        user.lastLoginDate = todayIST;
        await user.save();
        return user.learningStreak;
    }
    else {
        // Streak broken, reset to 1
        user.learningStreak = 1;
        user.lastLoginDate = todayIST;
        await user.save();
        return 1;
    }
};
exports.updateLearningStreakOnActivity = updateLearningStreakOnActivity;
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        // Find user
        const user = await User_1.User.findOne({ email });
        if (!user) {
            console.log(`[Login] User not found for email: ${email}`);
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log(`[Login] Invalid password for email: ${email}`);
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        console.log(`[Login] Successful login for email: ${email}`);
        // Update learning streak
        const streak = await updateLearningStreak(user);
        // Generate token
        const token = (0, auth_1.generateToken)(user._id.toString(), user.email, user.name);
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                learningStreak: streak,
            },
        });
    }
    catch (error) {
        console.error('Error in loginController:', error);
        res.status(500).json({
            error: 'Failed to login',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.loginController = loginController;
const getCurrentUserController = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const user = await User_1.User.findById(authReq.userId).select('-password');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Update learning streak on page visit
        const streak = await updateLearningStreak(user);
        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                learningStreak: streak,
                points: user.points || 0,
                weeklyPoints: user.weeklyPoints || 0,
                avatarColor: user.avatarColor || '#309898',
                bio: user.bio || '',
                preferredDifficulty: user.preferredDifficulty || 'medium',
                notificationsEnabled: user.notificationsEnabled !== false,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Error in getCurrentUserController:', error);
        res.status(500).json({
            error: 'Failed to get user',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.getCurrentUserController = getCurrentUserController;
const updateProfileController = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const { name, avatarColor, bio, preferredDifficulty, notificationsEnabled } = req.body;
        const user = await User_1.User.findById(authReq.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Update only provided fields
        if (name !== undefined && name.trim().length > 0) {
            user.name = name.trim();
        }
        if (avatarColor !== undefined) {
            user.avatarColor = avatarColor;
        }
        if (bio !== undefined) {
            user.bio = bio.substring(0, 200); // Limit to 200 chars
        }
        if (preferredDifficulty !== undefined && ['easy', 'medium', 'hard'].includes(preferredDifficulty)) {
            user.preferredDifficulty = preferredDifficulty;
        }
        if (notificationsEnabled !== undefined) {
            user.notificationsEnabled = notificationsEnabled;
        }
        await user.save();
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                learningStreak: user.learningStreak || 0,
                points: user.points || 0,
                weeklyPoints: user.weeklyPoints || 0,
                avatarColor: user.avatarColor || '#309898',
                bio: user.bio || '',
                preferredDifficulty: user.preferredDifficulty || 'medium',
                notificationsEnabled: user.notificationsEnabled !== false,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Error in updateProfileController:', error);
        res.status(500).json({
            error: 'Failed to update profile',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.updateProfileController = updateProfileController;
const changePasswordController = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: 'Current password and new password are required' });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({ error: 'New password must be at least 6 characters' });
            return;
        }
        const user = await User_1.User.findById(authReq.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Current password is incorrect' });
            return;
        }
        user.password = newPassword;
        await user.save();
        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    }
    catch (error) {
        console.error('Error in changePasswordController:', error);
        res.status(500).json({
            error: 'Failed to change password',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.changePasswordController = changePasswordController;
//# sourceMappingURL=authController.js.map
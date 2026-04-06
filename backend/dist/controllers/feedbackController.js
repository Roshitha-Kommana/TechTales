"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFeedbackController = void 0;
const feedbackGenerator_1 = require("../services/feedbackGenerator");
const User_1 = require("../models/User");
const generateFeedbackController = async (req, res) => {
    try {
        const authReq = req;
        const { score, topic, totalQuestions } = req.body;
        console.log('📝 Feedback generation request:', { score, topic, totalQuestions, userId: authReq.userId });
        if (!authReq.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (score === undefined || score === null) {
            console.error('❌ Missing score:', { score, topic, totalQuestions });
            res.status(400).json({ error: 'Score is required', received: { score, topic, totalQuestions } });
            return;
        }
        if (!topic || topic.trim() === '' || topic === 'undefined') {
            console.error('❌ Invalid topic:', { score, topic, totalQuestions });
            res.status(400).json({ error: 'Topic is required and cannot be empty', received: { score, topic, totalQuestions } });
            return;
        }
        // Generate personalized feedback
        const feedback = await (0, feedbackGenerator_1.generatePersonalizedFeedback)({
            score: Number(score),
            topic: String(topic),
            totalQuestions: totalQuestions ? Number(totalQuestions) : 5,
        });
        // Update user points (score * 10)
        const pointsEarned = Number(score) * 10;
        const user = await User_1.User.findById(authReq.userId);
        if (user) {
            user.points = (user.points || 0) + pointsEarned;
            // Update weak areas if score < 80
            if (Number(score) < 80 && feedback.areasOfConcern.length > 0) {
                const existingWeakAreas = user.weakAreas || [];
                const newWeakAreas = [...new Set([...existingWeakAreas, ...feedback.areasOfConcern])];
                user.weakAreas = newWeakAreas;
            }
            await user.save();
        }
        res.json({
            success: true,
            feedback: {
                ...feedback,
                pointsEarned,
            },
        });
    }
    catch (error) {
        console.error('Error in generateFeedbackController:', error);
        res.status(500).json({
            error: 'Failed to generate feedback',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.generateFeedbackController = generateFeedbackController;
//# sourceMappingURL=feedbackController.js.map
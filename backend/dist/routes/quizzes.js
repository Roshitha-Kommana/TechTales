"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quizController_1 = require("../controllers/quizController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Analytics routes must come before /:quizId to avoid route conflicts
router.get('/analytics/comprehensive', auth_1.authenticateToken, quizController_1.getComprehensiveAnalyticsController);
router.get('/analytics', auth_1.authenticateToken, quizController_1.getQuizAnalyticsController);
router.get('/analytics/:studentId', auth_1.authenticateToken, quizController_1.getQuizAnalyticsController);
// Story-specific routes
router.post('/story/:storyId/generate', auth_1.authenticateToken, quizController_1.generateQuizController);
router.get('/story/:storyId', auth_1.authenticateToken, quizController_1.getQuizByStoryController);
// Quiz-specific routes (must come after analytics)
router.get('/:quizId', auth_1.authenticateToken, quizController_1.getQuizController);
router.post('/:quizId/submit', auth_1.authenticateToken, quizController_1.submitQuizController);
exports.default = router;
//# sourceMappingURL=quizzes.js.map
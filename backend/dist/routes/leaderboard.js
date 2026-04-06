"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaderboardController_1 = require("../controllers/leaderboardController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get leaderboard (requires authentication)
router.get('/', auth_1.authenticateToken, leaderboardController_1.getLeaderboardController);
// Reset weekly leaderboard (typically called by a scheduled job or admin)
// In production, this should be protected with admin authentication
router.post('/reset-weekly', leaderboardController_1.resetWeeklyLeaderboard);
exports.default = router;
//# sourceMappingURL=leaderboard.js.map
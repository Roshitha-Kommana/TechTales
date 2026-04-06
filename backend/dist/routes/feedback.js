"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedbackController_1 = require("../controllers/feedbackController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/generate', auth_1.authenticateToken, feedbackController_1.generateFeedbackController);
exports.default = router;
//# sourceMappingURL=feedback.js.map
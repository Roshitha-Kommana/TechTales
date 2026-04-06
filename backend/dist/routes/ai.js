"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const aiController_1 = require("../controllers/aiController");
const router = (0, express_1.Router)();
router.post('/chat', auth_1.authenticateToken, aiController_1.chatWithAI);
exports.default = router;
//# sourceMappingURL=ai.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Debug middleware to log all requests
router.use((req, res, next) => {
    console.log(`[Auth Route] ${req.method} ${req.path}`);
    next();
});
router.post('/signup', authController_1.signupController);
router.post('/login', authController_1.loginController);
router.get('/me', auth_1.authenticateToken, authController_1.getCurrentUserController);
router.put('/profile', auth_1.authenticateToken, authController_1.updateProfileController);
router.put('/password', auth_1.authenticateToken, authController_1.changePasswordController);
exports.default = router;
//# sourceMappingURL=auth.js.map
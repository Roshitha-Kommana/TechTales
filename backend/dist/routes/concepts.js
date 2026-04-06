"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const conceptController_1 = require("../controllers/conceptController");
const router = (0, express_1.Router)();
router.get('/', conceptController_1.getAllConceptsController);
router.post('/', conceptController_1.createConceptController);
exports.default = router;
//# sourceMappingURL=concepts.js.map
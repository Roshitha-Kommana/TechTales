"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const noteController_1 = require("../controllers/noteController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticateToken, noteController_1.createNoteController);
router.get('/', auth_1.authenticateToken, noteController_1.getAllNotesController);
router.get('/:id', auth_1.authenticateToken, noteController_1.getNoteController);
router.put('/:id', auth_1.authenticateToken, noteController_1.updateNoteController);
router.delete('/:id', auth_1.authenticateToken, noteController_1.deleteNoteController);
exports.default = router;
//# sourceMappingURL=notes.js.map
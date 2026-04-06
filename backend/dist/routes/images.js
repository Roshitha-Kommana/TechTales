"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imageGenerator_1 = require("../services/imageGenerator");
const router = (0, express_1.Router)();
router.post('/generate', async (req, res) => {
    try {
        const { storyText, concept, pageNumber, ageGroup } = req.body;
        if (!storyText || !concept) {
            res.status(400).json({ error: 'storyText and concept are required' });
            return;
        }
        const prompt = await (0, imageGenerator_1.generateImagePrompt)(storyText, concept, pageNumber || 1, ageGroup || '8-12');
        const imageUrl = await (0, imageGenerator_1.generateImage)(prompt);
        res.json({ success: true, imageUrl, prompt });
    }
    catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({
            error: 'Failed to generate image',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=images.js.map
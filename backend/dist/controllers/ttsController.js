"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTTS = void 0;
const deepgramService_1 = require("../services/deepgramService");
const generateTTS = async (req, res) => {
    try {
        const { text, model } = req.body;
        if (!text) {
            return res.status(400).json({ success: false, error: 'Text is required for TTS' });
        }
        const audioBuffer = await deepgramService_1.deepgramService.generateAudio(text, model);
        res.set({
            'Content-Type': 'audio/wav',
            'Content-Length': audioBuffer.length,
        });
        res.status(200).send(audioBuffer);
    }
    catch (error) {
        console.error('Error generating TTS:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to generate TTS' });
    }
};
exports.generateTTS = generateTTS;
//# sourceMappingURL=ttsController.js.map
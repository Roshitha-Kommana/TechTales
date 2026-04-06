import { Request, Response } from 'express';
import { deepgramService } from '../services/deepgramService';

export const generateTTS = async (req: Request, res: Response) => {
  try {
    const { text, model } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required for TTS' });
    }

    const audioBuffer = await deepgramService.generateAudio(text, model);

    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': audioBuffer.length,
    });

    res.status(200).send(audioBuffer);
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate TTS' });
  }
};

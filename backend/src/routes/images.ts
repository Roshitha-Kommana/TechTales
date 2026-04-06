import { Router } from 'express';
import { generateImage, generateImagePrompt } from '../services/imageGenerator';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const { storyText, concept, pageNumber, ageGroup } = req.body;

    if (!storyText || !concept) {
      res.status(400).json({ error: 'storyText and concept are required' });
      return;
    }

    const prompt = await generateImagePrompt(
      storyText,
      concept,
      pageNumber || 1,
      ageGroup || '8-12'
    );

    const imageUrl = await generateImage(prompt);

    res.json({ success: true, imageUrl, prompt });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({
      error: 'Failed to generate image',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;



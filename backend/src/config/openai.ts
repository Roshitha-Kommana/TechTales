import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const OPENAI_CONFIG = {
  storyModel: 'gpt-4-turbo-preview',
  imageModel: 'dall-e-3',
  imageSize: '1024x1024' as const,
  imageQuality: 'standard' as const,
};



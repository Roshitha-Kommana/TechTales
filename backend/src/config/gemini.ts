import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// API Key 1: For story generation and image prompt generation
const GEMINI_API_KEY_1 = process.env.GEMINI_API_KEY_1;

// API Key 2: For quiz generation (can be used as fallback)
const GEMINI_API_KEY_2 = process.env.GEMINI_API_KEY_2;

// API Key 3: For image generation
const GEMINI_API_KEY_3 = process.env.GEMINI_API_KEY_3;

// API Key 4: Additional key for increased quota capacity
const GEMINI_API_KEY_4 = process.env.GEMINI_API_KEY_4;

if (!GEMINI_API_KEY_1 || !GEMINI_API_KEY_2 || !GEMINI_API_KEY_3) {
  throw new Error('GEMINI_API_KEY_1, GEMINI_API_KEY_2, and GEMINI_API_KEY_3 must be set in environment variables. Do not hardcode API keys.');
}

// Create clients for all keys
const client1 = new GoogleGenerativeAI(GEMINI_API_KEY_1);
const client2 = new GoogleGenerativeAI(GEMINI_API_KEY_2);
const client3 = new GoogleGenerativeAI(GEMINI_API_KEY_3);
const client4 = GEMINI_API_KEY_4 ? new GoogleGenerativeAI(GEMINI_API_KEY_4) : null;

// Track which key to use (for rotation)
let currentStoryKey = 2; // Start with Key 2 since Key 1 quota is exhausted
let currentQuizKey = 2; // Start with Key 2 for quizzes
let currentImageKey = 2; // Start with Key 2 for image prompt generation

// Helper function to get story client with automatic key rotation on quota errors
export const getStoryClient = () => {
  if (currentStoryKey === 1) return client1;
  if (currentStoryKey === 2) return client2;
  if (currentStoryKey === 3) return client3;
  if (currentStoryKey === 4 && client4) return client4;
  return client3; // Fallback to key 3 if key 4 not available
};

// Helper function to rotate story API key (cycles through all available keys: 1 -> 2 -> 3 -> 4 -> 1)
export const rotateStoryKey = () => {
  if (currentStoryKey === 1) {
    currentStoryKey = 2;
  } else if (currentStoryKey === 2) {
    currentStoryKey = 3;
  } else if (currentStoryKey === 3) {
    currentStoryKey = client4 ? 4 : 1; // Use key 4 if available, otherwise cycle back
  } else {
    currentStoryKey = 1; // Cycle back to first key
  }
  console.log(`🔄 Rotated to API Key ${currentStoryKey} for story generation`);
};

// Helper function to get quiz client with automatic key rotation
export const getQuizClient = () => {
  if (currentQuizKey === 1) return client1;
  if (currentQuizKey === 2) return client2;
  if (currentQuizKey === 3) return client3;
  if (currentQuizKey === 4 && client4) return client4;
  return client3; // Fallback to key 3 if key 4 not available
};

// Helper function to rotate quiz API key (cycles through all available keys: 1 -> 2 -> 3 -> 4 -> 1)
export const rotateQuizKey = () => {
  if (currentQuizKey === 1) {
    currentQuizKey = 2;
  } else if (currentQuizKey === 2) {
    currentQuizKey = 3;
  } else if (currentQuizKey === 3) {
    currentQuizKey = client4 ? 4 : 1; // Use key 4 if available, otherwise cycle back
  } else {
    currentQuizKey = 1; // Cycle back to first key
  }
  console.log(`🔄 Rotated to API Key ${currentQuizKey} for quiz generation`);
};

// Gemini client for story and image prompts (with rotation support)
export const geminiStory = {
  getGenerativeModel: (config: any) => {
    return getStoryClient().getGenerativeModel(config);
  }
};

// Gemini client for quiz generation (with rotation support)
export const geminiQuiz = {
  getGenerativeModel: (config: any) => {
    return getQuizClient().getGenerativeModel(config);
  }
};

// Helper function to get image client with automatic key rotation
export const getImageClient = () => {
  if (currentImageKey === 1) return client1;
  if (currentImageKey === 2) return client2;
  return client3;
};

// Helper function to rotate image API key
export const rotateImageKey = () => {
  if (currentImageKey === 3) {
    currentImageKey = 1;
  } else if (currentImageKey === 1) {
    currentImageKey = 2;
  } else {
    currentImageKey = 3;
  }
  console.log(`🔄 Rotated to API Key ${currentImageKey} for image generation`);
};

// Gemini client for image generation (with rotation support)
export const geminiImage = {
  getGenerativeModel: (config: any) => {
    return getImageClient().getGenerativeModel(config);
  }
};

export const GEMINI_CONFIG = {
  storyModel: 'gemini-3-flash-preview',
  quizModel: 'gemini-3-flash-preview',
  imageModel: 'gemini-3-flash-preview',
  fallbackModel: 'gemini-3.1-flash-lite-preview',
  temperature: {
    story: 0.8,
    quiz: 0.7,
    prompt: 0.7,
    image: 0.8,
  },
};



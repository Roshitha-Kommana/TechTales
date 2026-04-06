import { geminiQuiz, GEMINI_CONFIG, rotateQuizKey } from '../config/gemini';
import { IQuizQuestion } from '../models/Quiz';

interface QuizGenerationOptions {
  concept: string;
  storyText: string;
  numberOfQuestions?: number;
  difficulty?: string;
}

export interface GeneratedQuiz {
  questions: IQuizQuestion[];
}

export async function generateQuiz(
  options: QuizGenerationOptions
): Promise<GeneratedQuiz> {
  const { concept, storyText, numberOfQuestions = 5, difficulty = 'medium' } = options;

  const prompt = `You are an expert educational quiz creator. Create multiple-choice questions that test understanding of the concept through the story. Questions should be:
- Based on the story content and concept with appropriate depth
- ${difficulty} difficulty level
- Clear and unambiguous
- Have exactly 4 options each
- Test comprehension, not just memorization
- Include detailed explanations for why the correct answer is correct

Create ${numberOfQuestions} multiple-choice questions based on this story about "${concept}":

Story: ${storyText}

The questions should test the student's understanding of the concept explained in the story. Analyze the story content deeply and create questions that assess comprehension at different levels. Make sure the correct answer is clearly the best option.

IMPORTANT: Format your response as JSON with this EXACT structure (no markdown, no code blocks, just pure JSON):
{
  "questions": [
    {
      "questionNumber": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Clear explanation (2-3 sentences) for why the correct answer is correct, referencing the story content and concept."
    },
    {
      "questionNumber": 2,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1,
      "explanation": "Clear explanation (2-3 sentences) for why the correct answer is correct, referencing the story content and concept."
    }
  ]
}

Return ONLY the JSON object, nothing else.`;

  let lastError: Error | null = null;
  const maxRetries = 8; // Try all 4 API keys with both models (4 keys × 2 models)
  let useFallbackModel = false;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Use fallback model if we've exhausted primary model attempts
      const modelName = useFallbackModel ? GEMINI_CONFIG.fallbackModel : GEMINI_CONFIG.quizModel;

      if (attempt === 2) {
        // After trying both keys with primary model, switch to fallback
        useFallbackModel = true;
        console.log(`🔄 Switching to fallback model: ${GEMINI_CONFIG.fallbackModel}`);
      }

      const model = geminiQuiz.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: GEMINI_CONFIG.temperature.quiz,
        },
      });

      console.log(`📝 Generating quiz with model: ${modelName} (attempt ${attempt + 1}/${maxRetries})`);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new Error('No response from Gemini');
      }

      // Clean the content - remove markdown code blocks if present
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      // Try to extract JSON if there's extra text
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }

      let quizData: GeneratedQuiz;
      try {
        quizData = JSON.parse(cleanedContent) as GeneratedQuiz;
      } catch (parseError: any) {
        console.error(`❌ JSON parse error: ${parseError.message}`);
        console.error(`❌ Content preview (first 500 chars): ${cleanedContent.substring(0, 500)}`);
        throw new Error(`Failed to parse quiz JSON from AI response: ${parseError.message}`);
      }

      // Validate the structure
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Invalid quiz structure from AI');
      }

      // Validate each question
      for (const question of quizData.questions) {
        if (!question.question || !question.options || question.options.length !== 4) {
          throw new Error('Invalid question structure');
        }
        if (question.correctAnswer < 0 || question.correctAnswer >= 4) {
          throw new Error('Invalid correct answer index');
        }
        if (!question.explanation || question.explanation.trim().length === 0) {
          throw new Error('Missing explanation for question');
        }
      }

      console.log(`✅ Successfully generated quiz with ${quizData.questions.length} questions using model: ${modelName}`);
      return quizData;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || '';

      // Check if it's a quota/rate limit error (429)
      const isQuotaError = errorMessage.includes('429') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('Quota exceeded') ||
        errorMessage.includes('exceeded your current quota') ||
        (error?.status === 429) ||
        (error?.response?.status === 429);

      if (isQuotaError) {
        console.warn(`⚠️  API Key quota exceeded for quiz (attempt ${attempt + 1}/${maxRetries})`);

        if (attempt < maxRetries - 1) {
          // If we haven't tried fallback model yet, switch to it after trying 2 keys
          if (!useFallbackModel && attempt === 3) {
            useFallbackModel = true;
            console.log(`🔄 Switching to fallback model: ${GEMINI_CONFIG.fallbackModel}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }

          // Rotate to the next API key
          rotateQuizKey();
          console.log(`🔄 Retrying quiz with next API key...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        } else {
          throw new Error('All API keys and models have exceeded their quota limits for quiz generation. Please wait until tomorrow or upgrade your Google AI plan.');
        }
      }

      // Check if it's a network/fetch error
      if (errorMessage.includes('fetch failed') ||
        errorMessage.includes('network') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('ETIMEDOUT')) {
        console.warn(`⚠️  Network error for quiz (attempt ${attempt + 1}/${maxRetries})`);

        if (attempt < maxRetries - 1) {
          rotateQuizKey();
          console.log(`🔄 Retrying quiz with alternate API key after network error...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        } else {
          throw new Error('Network connection failed for quiz generation. Please check your internet connection and try again.');
        }
      }

      // Check if it's a model not found error
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        throw new Error(`Model not found for quiz generation. Error: ${errorMessage.substring(0, 200)}`);
      }

      // Other error, don't retry but log it
      console.error('Unexpected error generating quiz:', error);
      throw error;
    }
  }

  // If we get here, all retries failed
  throw new Error(`Failed to generate quiz after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}

export function calculateQuizAnalytics(
  questions: IQuizQuestion[],
  results: Array<{ questionNumber: number; selectedAnswer: number; isCorrect: boolean }>
): {
  score: number;
  areasOfConcern: string[];
  strengths: string[];
} {
  const totalQuestions = questions.length;
  const correctAnswers = results.filter(r => r.isCorrect).length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  // Helper: Extract a meaningful topic summary from a question
  const extractTopicFromQuestion = (q: IQuizQuestion): string => {
    const questionText = q.question;

    // Try to extract the core topic from common question patterns
    // Pattern: "What is/are ...?" -> extract the subject
    let match = questionText.match(/(?:What|How|Why|Which|When|Where)\s+(?:is|are|does|do|did|was|were|can|could|would|should|has|have|had)\s+(.+?)(?:\?|$)/i);
    if (match && match[1]) {
      let topic = match[1].trim();
      // Clean up: remove trailing question marks, limit length
      topic = topic.replace(/\?$/, '').trim();
      // Capitalize first letter
      topic = topic.charAt(0).toUpperCase() + topic.slice(1);
      // Limit to reasonable length
      if (topic.length > 80) {
        topic = topic.substring(0, 77) + '...';
      }
      return topic;
    }

    // Pattern: "According to the story, ..." -> take core part
    match = questionText.match(/(?:According to|Based on|In the story|From the story)[,\s]+(.+?)(?:\?|$)/i);
    if (match && match[1]) {
      let topic = match[1].trim().replace(/\?$/, '').trim();
      topic = topic.charAt(0).toUpperCase() + topic.slice(1);
      if (topic.length > 80) {
        topic = topic.substring(0, 77) + '...';
      }
      return topic;
    }

    // Fallback: Use the question itself but cleaned up
    let fallback = questionText.replace(/\?$/, '').trim();
    // Remove leading question words for cleaner display
    fallback = fallback.replace(/^(What|How|Why|Which|When|Where|Who)\s+(is|are|does|do|did|was|were|can|could|would|should|has|have|had)\s+/i, '');
    fallback = fallback.charAt(0).toUpperCase() + fallback.slice(1);
    if (fallback.length > 80) {
      fallback = fallback.substring(0, 77) + '...';
    }
    return fallback;
  };

  // Identify areas of concern from incorrect answers
  const incorrectQuestions = results
    .filter(r => !r.isCorrect)
    .map(r => questions.find(q => q.questionNumber === r.questionNumber))
    .filter((q): q is IQuizQuestion => q !== undefined);

  const areasOfConcern: string[] = incorrectQuestions.map(q => extractTopicFromQuestion(q));
  // Remove duplicates
  const uniqueConcerns = [...new Set(areasOfConcern)].slice(0, 5);

  // Identify strengths from correctly answered questions
  const correctQuestions = results
    .filter(r => r.isCorrect)
    .map(r => questions.find(q => q.questionNumber === r.questionNumber))
    .filter((q): q is IQuizQuestion => q !== undefined);

  const strengths: string[] = correctQuestions.map(q => extractTopicFromQuestion(q));
  const uniqueStrengths = [...new Set(strengths)].slice(0, 5);

  return {
    score,
    areasOfConcern: uniqueConcerns,
    strengths: uniqueStrengths,
  };
}

export async function generateQuizExplanations(
  questions: IQuizQuestion[],
  concept: string
): Promise<IQuizQuestion[]> {
  // Explanations are now generated with the quiz, so just return questions as-is
  // This function is kept for backward compatibility
  return questions;
}

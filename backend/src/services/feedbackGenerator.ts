import { geminiStory, GEMINI_CONFIG } from '../config/gemini';

interface FeedbackOptions {
  score: number;
  topic: string;
  totalQuestions: number;
}

export interface PersonalizedFeedback {
  encouragementMessage: string;
  nextTopics: string[];
  areasOfConcern: string[];
}

export async function generatePersonalizedFeedback(
  options: FeedbackOptions
): Promise<PersonalizedFeedback> {
  const { score, topic, totalQuestions } = options;

  const prompt = `You are a personalized learning guide. A student just scored ${score}% on a quiz about the story topic "${topic}".
Provide meaningful feedback that helps the user grow. Recommend what they should learn next, deep dive into concepts related to the story, and identify areas to review.

Return ONLY a valid JSON object with the following structure:
{
  "encouragementMessage": "A personalized, encouraging 2-sentence message. Be warm and specific to their performance level.",
  "nextTopics": ["3 specific, highly meaningful related topics or deep-dive concepts they should explore next to grow their understanding"],
  "areasOfConcern": [${score < 80 ? '"2-3 specific areas they need to review based on their score"' : '"leave this array empty"'}]
}`;

  let lastError: any = null;
  const maxRetries = 3;
  let useFallbackModel = false;
  let modelName = GEMINI_CONFIG.storyModel;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      modelName = useFallbackModel ? GEMINI_CONFIG.fallbackModel : GEMINI_CONFIG.storyModel;
      console.log(`📝 Generating feedback with model: ${modelName} (attempt ${attempt + 1}/${maxRetries})`);

      const model = geminiStory.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let content = response.text().trim();

      // Clean markdown if present
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\n?/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\w*\n?/, '');
      }
      content = content.replace(/\n?```$/, '');

      // Safely extract just the JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to extract JSON from AI response");
      }

      const data = JSON.parse(jsonMatch[0]);

      console.log(`✅ Successfully generated feedback using model: ${modelName}`);

      return {
        encouragementMessage: data.encouragementMessage || `You scored ${score}% on ${topic}. Keep practicing!`,
        nextTopics: Array.isArray(data.nextTopics) && data.nextTopics.length > 0 
          ? data.nextTopics 
          : [`Deep dive into ${topic}`, `Advanced applications of ${topic}`, `Real-world impact of ${topic}`],
        areasOfConcern: Array.isArray(data.areasOfConcern) ? data.areasOfConcern : [],
      };
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || String(error);

      // Check if it's a quota or service unavailable error
      const isRetryableError = errorMessage.includes('429') || 
        errorMessage.includes('quota') || 
        errorMessage.includes('Too Many Requests') ||
        errorMessage.includes('503') ||
        errorMessage.includes('overloaded') ||
        errorMessage.includes('Service Unavailable');

      if (isRetryableError) {
        console.warn(`⚠️ Feedback API error (attempt ${attempt + 1}/${maxRetries}): ${errorMessage.substring(0, 150)}`);
        
        if (attempt < maxRetries - 1) {
          if (!useFallbackModel && attempt === 0) {
            useFallbackModel = true;
            console.log(`🔄 Switching to fallback model: ${GEMINI_CONFIG.fallbackModel}`);
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
      } else {
        // Log other errors but don't immediately crash if there are retries left
        console.error(`Error in feedback generation attempt ${attempt + 1}:`, errorMessage);
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }
    }
  }

  console.error(`❌ All ${maxRetries} API attempts failed for feedback generation. Using static fallback. Last error: ${lastError?.message?.substring(0, 200)}`);
  // Return fallback feedback
    return {
      encouragementMessage: score >= 80
        ? `Great job on your quiz! You scored ${score}% on ${topic}. Keep up the excellent work!`
        : `You scored ${score}% on ${topic}. Keep practicing and you'll improve!`,
      nextTopics: [
        `Deep dive into concepts related to ${topic}`,
        `Advanced applications of ${topic}`,
        `Real-world examples of ${topic}`,
      ],
      areasOfConcern: score < 80 ? [`Review ${topic} fundamentals`] : [],
    };
}

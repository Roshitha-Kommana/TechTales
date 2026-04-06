import { geminiStory, GEMINI_CONFIG, rotateStoryKey } from '../config/gemini';
import { IStoryPage } from '../models/Story';
import { isImageFile } from './fileProcessor';

interface StoryGenerationOptions {
  concept: string;
  characterName?: string;
  adventureStyle?: string;
  difficulty?: string;
  numberOfPages?: number;
  sourceFileContent?: string; // Extracted text content from file
  sourceFileMimeType?: string; // MIME type of the source file
  sourceFileBase64?: string; // Base64 encoded file (for images)
}

export interface GeneratedStory {
  title: string;
  pages: Omit<IStoryPage, 'imageUrl' | 'imagePrompt'>[];
  keyConcepts?: string[];
}

export async function generateStory(
  options: StoryGenerationOptions
): Promise<GeneratedStory> {
  const {
    concept,
    characterName = 'Adventurer',
    adventureStyle = 'adventure',
    difficulty = 'beginner',
    numberOfPages = 5,
    sourceFileContent,
    sourceFileMimeType,
    sourceFileBase64,
  } = options;

  // Log config on first call to debug
  console.log('🔧 GEMINI_CONFIG:', {
    storyModel: GEMINI_CONFIG.storyModel,
    fallbackModel: GEMINI_CONFIG.fallbackModel,
    hasStoryModel: !!GEMINI_CONFIG.storyModel,
    hasFallbackModel: !!GEMINI_CONFIG.fallbackModel,
  });

  // Map adventure styles to descriptions
  const adventureStyleDescriptions: Record<string, string> = {
    fantasy: 'magical and mythical, with wizards, magical creatures, and enchanted worlds',
    'sci-fi': 'futuristic and technological, set in space or advanced civilizations',
    mystery: 'mysterious and puzzling, with detective work and solving mysteries',
    superhero: 'heroic and empowering, with superpowers and saving the day',
    historical: 'set in the past, exploring real historical events and civilizations',
    adventure: 'exciting and exploratory, with quests and discovering new places',
  };

  const styleDescription = adventureStyleDescriptions[adventureStyle] || adventureStyleDescriptions.adventure;

  // Map difficulty to descriptions
  const difficultyDescriptions: Record<string, string> = {
    beginner: 'simple and easy to understand, with basic concepts explained clearly',
    intermediate: 'moderately challenging, with some complex ideas but still accessible',
    advanced: 'complex and detailed, with deep understanding required',
  };

  const difficultyDescription = difficultyDescriptions[difficulty] || difficultyDescriptions.beginner;

  // Build prompt based on whether source file is provided
  let basePrompt = '';

  if (adventureStyle === 'none') {
    basePrompt = `You are an expert educational tutor. Your goal is to explain the concept: "${concept}" clearly and simply to a student.
    
    Do NOT tell a story. Instead, provide a step-by-step explanation or a structured lesson.
    
    The explanation should be:
    - Accurate and educational
    - Simple and easy to understand for ${difficultyDescription} level
    - Split into ${numberOfPages} parts/topics (one per page)
    - Each part should focus on a specific aspect of the concept
    - Use clear examples and analogies where appropriate
    - 2-4 sentences per page maximum (concise)
    `;
  } else {
    basePrompt = `You are an expert educational storyteller who creates engaging stories that help students understand complex concepts through narrative. Your stories should be:
    - Educational and accurate
    - Written in a ${styleDescription} style
    - ${difficultyDescription} difficulty level
    - Engaging and memorable
    - Split into ${numberOfPages} pages, each with a clear narrative segment
    - Feature a main character named "${characterName}" who learns about the concept
    - Each page should have SHORT, CONCISE text (2-4 sentences maximum, approximately 50-100 words per page)
    - If the concept is complex, use MORE pages rather than longer text on fewer pages
    - Keep text readable and appropriate for a children's book format
    `;
  }

  // If source file is provided, use it as context
  if (sourceFileContent || sourceFileBase64) {
    if (sourceFileBase64 && sourceFileMimeType && isImageFile(sourceFileMimeType)) {
      // For images, we'll include the image in the content parts
      basePrompt += `Based on the provided source material (an image), create an educational story that explains the concept: "${concept}"

The story should be based on the information visible in the provided image. Use the image as a reference to understand the topic and create a narrative that helps students understand this concept. Make it engaging, use characters if appropriate, and ensure each page builds on the previous one to create a complete understanding of the concept.`;
    } else if (sourceFileContent) {
      // For text-based files (PDF, text files)
      basePrompt += `Based on the following source material, create an educational story that explains the concept: "${concept}"

SOURCE MATERIAL:
${sourceFileContent}

The story should be based on the information from the source material above. Use the source material as the primary reference to create an accurate and educational narrative that helps students understand this concept. Make it engaging, use characters if appropriate, and ensure each page builds on the previous one to create a complete understanding of the concept.`;
    }
  } else {
    // No source file, use general knowledge
    basePrompt += `Create an educational story that explains the concept: "${concept}"

The story should help students understand this concept through a narrative. Make it engaging, use characters if appropriate, and ensure each page builds on the previous one to create a complete understanding of the concept.`;
  }

  const prompt = basePrompt + `

IMPORTANT: Format your response as JSON with this EXACT structure (no markdown, no code blocks, just pure JSON):
{
  "title": "Story Title",
  "pages": [
    {
      "pageNumber": 1,
      "text": "Page text content here...",
      "keyPoints": ["Key definition or formula relevant to this page", "Important fact from this page"]
    },
    {
      "pageNumber": 2,
      "text": "Page text content here...",
      "keyPoints": ["Another key point", "Definition or fact"]
    }
  ],
  "keyConcepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"]
}

CRITICAL REQUIREMENTS FOR keyPoints:
- Each page MUST have 1-3 keyPoints specific to that page's content
- keyPoints should include: definitions, formulas, important dates, key vocabulary, scientific terms, or memorable facts
- Keep each keyPoint SHORT (under 50 words) and easy to understand
- For academic topics (history, science, math): include relevant formulas, dates, definitions
- For non-academic topics: include interesting facts, vocabulary, or important takeaways
- These will be displayed as study notes for students, so make them educational and memorable

The keyConcepts array should contain 3-5 important concepts or topics that students will learn from this story. These should be specific, educational concepts related to "${concept}".

Return ONLY the JSON object, nothing else.`;


  let lastError: Error | null = null;
  const maxRetries = 8; // Try all 4 API keys with both models (4 keys × 2 models)
  let useFallbackModel = false;
  let modelName = GEMINI_CONFIG.storyModel; // Declare outside loop for error handling

  // Validate model configuration
  if (!GEMINI_CONFIG.storyModel || !GEMINI_CONFIG.fallbackModel) {
    throw new Error('Gemini model configuration is missing. Please check backend/src/config/gemini.ts');
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Use fallback model if we've exhausted primary model attempts
      modelName = useFallbackModel ? GEMINI_CONFIG.fallbackModel : GEMINI_CONFIG.storyModel;

      // Validate model name
      if (!modelName || typeof modelName !== 'string' || modelName.trim() === '') {
        throw new Error(`Invalid model name: ${modelName}. Expected a non-empty string.`);
      }

      if (attempt === 4) {
        // After trying all 4 keys with primary model, switch to fallback
        useFallbackModel = true;
        console.log(`🔄 Switching to fallback model: ${GEMINI_CONFIG.fallbackModel}`);
      }

      console.log(`📝 Generating story with model: ${modelName} (attempt ${attempt + 1}/${maxRetries})`);

      // Validate temperature exists
      const temperature = GEMINI_CONFIG.temperature?.story ?? 0.8;

      // Create model config object
      const modelConfig: any = {
        model: modelName.trim(),
      };

      // Add generation config if temperature is defined
      if (temperature !== undefined && temperature !== null) {
        modelConfig.generationConfig = {
          temperature: temperature,
        };
      }

      console.log(`📝 Model config:`, JSON.stringify(modelConfig, null, 2));

      const model = geminiStory.getGenerativeModel(modelConfig);

      if (!model) {
        throw new Error(`Failed to create model instance. Model name: ${modelName}`);
      }
      if (sourceFileContent || sourceFileBase64) {
        console.log(`📄 Using source file content for story generation`);
      }

      // Prepare content parts - include image if provided
      let contentParts: any[] = [{ text: prompt }];

      // Note: gemini-1.5-flash supports images, but we'll use text extraction for now
      // If image is provided, we'll just mention it in the prompt
      if (sourceFileBase64 && sourceFileMimeType && isImageFile(sourceFileMimeType)) {
        // For images, add a note in the prompt instead of inline data
        // This avoids model compatibility issues
        contentParts[0].text = prompt + '\n\nNote: An image file has been provided as source material. Please analyze the image content and incorporate it into the story.';

        // Try to include image if model supports it
        try {
          contentParts.push({
            inlineData: {
              mimeType: sourceFileMimeType,
              data: sourceFileBase64,
            },
          });
        } catch (imageError) {
          console.warn('Could not include image inline, using text-only mode');
          // Continue without image in parts
        }
      }

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: contentParts }],
      });
      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new Error('No response from Gemini');
      }

      console.log('Raw Gemini response:', content.substring(0, 200));

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

      console.log('Cleaned content:', cleanedContent.substring(0, 200));

      let storyData: GeneratedStory;
      try {
        storyData = JSON.parse(cleanedContent) as GeneratedStory;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Content that failed to parse:', cleanedContent);
        throw new Error(`Failed to parse JSON response from Gemini: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }

      // Validate the structure
      if (!storyData.title || !storyData.pages || !Array.isArray(storyData.pages)) {
        console.error('Invalid story structure:', storyData);
        throw new Error('Invalid story structure from AI - missing title or pages array');
      }

      // Ensure all pages have pageNumber
      storyData.pages = storyData.pages.map((page, index) => ({
        ...page,
        pageNumber: page.pageNumber || index + 1,
      }));

      console.log(`✅ Successfully generated story: "${storyData.title}" with ${storyData.pages.length} pages using model: ${modelName}`);

      return storyData;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || '';

      // Check if it's a service unavailable/overloaded error (503)
      const isServiceUnavailable = errorMessage.includes('503') ||
        errorMessage.includes('overloaded') ||
        errorMessage.includes('Service Unavailable') ||
        (error?.status === 503) ||
        (error?.response?.status === 503);

      if (isServiceUnavailable) {
        console.warn(`⚠️  Service overloaded (503) - retrying with exponential backoff (attempt ${attempt + 1}/${maxRetries})`);

        if (attempt < maxRetries - 1) {
          // Exponential backoff: 2s, 4s, 8s, 16s, etc.
          const backoffDelay = Math.min(2000 * Math.pow(2, attempt), 30000); // Max 30 seconds
          console.log(`⏳ Waiting ${backoffDelay / 1000}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));

          // Try rotating key after a few attempts
          if (attempt > 1 && attempt % 2 === 0) {
            rotateStoryKey();
            console.log(`🔄 Rotating to alternate API key...`);
          }

          continue; // Retry
        } else {
          throw new Error('Service is temporarily overloaded. Please try again in a few moments.');
        }
      }

      // Check if it's a quota/rate limit error (429) - check this FIRST
      // Sometimes quota errors appear as "fetch failed" in the SDK
      const isQuotaError = errorMessage.includes('429') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('Quota exceeded') ||
        errorMessage.includes('exceeded your current quota') ||
        (error?.status === 429) ||
        (error?.response?.status === 429);

      if (isQuotaError) {
        console.warn(`⚠️  API Key quota exceeded (attempt ${attempt + 1}/${maxRetries})`);

        if (attempt < maxRetries - 1) {
          // If we've tried all 4 keys with primary model, switch to fallback
          if (!useFallbackModel && attempt === 3) {
            useFallbackModel = true;
            console.log(`🔄 Switching to fallback model: ${GEMINI_CONFIG.fallbackModel}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }

          // Rotate to the next API key (cycles through all 4 keys: 1 -> 2 -> 3 -> 4 -> 1)
          rotateStoryKey();
          console.log(`🔄 Retrying with alternate API key (will try all 4 keys)...`);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue; // Retry with new key
        } else {
          // All attempts exhausted
          console.error('❌ All API keys exhausted after trying:', {
            attempts: attempt + 1,
            totalKeys: 4, // Now supports up to 4 keys
            modelsTried: [GEMINI_CONFIG.storyModel, GEMINI_CONFIG.fallbackModel],
            lastError: lastError?.message
          });
          throw new Error('All Gemini API keys have exceeded their daily quota limits (typically 20 requests per key per day). The quota resets daily. Please try again tomorrow or add more API keys (GEMINI_API_KEY_4, GEMINI_API_KEY_5, etc.) to your environment variables.');
        }
      }

      // Check if it's a network/fetch error (but not quota)
      if (errorMessage.includes('fetch failed') ||
        errorMessage.includes('network') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('ETIMEDOUT') ||
        errorMessage.includes('timeout')) {
        console.warn(`⚠️  Network error (attempt ${attempt + 1}/${maxRetries}): ${errorMessage.substring(0, 100)}`);

        if (attempt < maxRetries - 1) {
          // Try rotating key and retry
          rotateStoryKey();
          console.log(`🔄 Retrying with alternate API key after network error...`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait longer for network issues
          continue;
        } else {
          throw new Error('Network connection failed. Please check your internet connection and try again. If the problem persists, the API service might be temporarily unavailable.');
        }
      }

      // Check if it's a model not found error
      if (errorMessage.includes('404') ||
        errorMessage.includes('not found') ||
        errorMessage.includes('model') ||
        errorMessage.includes('Model') ||
        errorMessage.includes('Invalid model')) {
        console.error(`❌ Model error: ${errorMessage}`);
        console.error(`Attempted model: ${modelName}`);
        throw new Error(`Model "${modelName}" not found or not available. Please check your API key permissions and model name. Error: ${errorMessage.substring(0, 300)}`);
      }

      // Other error, don't retry but log it
      console.error('Unexpected error:', error);
      throw error;
    }
  }

  // If we get here, all retries failed
  throw new Error(`Failed to generate story after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}

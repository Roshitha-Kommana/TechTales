import { geminiStory, GEMINI_CONFIG, rotateStoryKey } from '../config/gemini';
import axios from 'axios';

console.log('[imageGenerator] Module loading...');

export interface ImageGenerationOptions {
  storyText: string;
  pageNumber: number;
  concept: string;
  ageGroup?: string;
  storyTitle?: string;
}

export async function generateImagePrompt(
  storyText: string,
  concept: string,
  pageNumber: number,
  ageGroup: string = '8-12',
  storyTitle?: string,
  adventureStyle: string = 'adventure'
): Promise<string> {
  const fullStoryText = storyText.trim();
  console.log(`📝 Generating image prompt for Page ${pageNumber} [Style: ${adventureStyle}]`);

  // 1. Construct the Base Prompt for Gemini
  let prompt = '';
  let sceneType = "scene";

  if (adventureStyle === 'none') {
    prompt = `You are an expert educational illustrator creating clear, simple block diagrams, flowcharts, or infographics to explain concepts to ${ageGroup} year olds.
    
    Create a precise description for a simple DIAGRAM or ILLUSTRATION that explains the content below.
    
    Topic: "${storyTitle || concept}"
    Page Content:
    ${fullStoryText}
    
    CRITICAL REQUIREMENTS:
    - Create a prompt for a VISUAL DIAGRAM, SCHEMATIC, or INFOGRAPHIC.
    - Do NOT ask for complex scenes, characters, or storybook illustrations.
    - Focus on arrows, boxes, labeled parts, simple icons, and flow.
    - If the text explains a process (e.g. CPU scheduling), ask for a timeline or queue diagram.
    - If the text explains a structure (e.g. cell), ask for a labeled diagram.
    - Keep it simple, clean, and colorful but educational.
    - This image will help a student understand the specific concept explained on this page.
    
    IMPORTANT TEXT RENDERING RULE:
    If the image needs to display readable text, signs, labels, or writing of any kind, you MUST format your ENTIRE output using exactly this structural template:
    'A high-resolution [STYLE] image of [SCENE]. Central focus: a [OBJECT] that displays the exact text "[TEXT]" in a clean, bold [FONT TYPE]. The spelling of "[TEXT]" must be literal, with no extra characters or stylistic distortions. Ensure high contrast between the text and the background for maximum legibility.'
    Replace the bracketed placeholders with the appropriate details. Do not add any other sentences.
    
    Return ONLY the prompt description. No markdown.`;
  } else {
    // Analyze content for scene type
    const hasAction = /discover|find|explore|search|journey|travel|adventure/i.test(fullStoryText);
    const hasLearning = /learn|understand|know|discover|realize|knowledge/i.test(fullStoryText);
    const hasTriumph = /succeed|triumph|defeat|win|achieved|master/i.test(fullStoryText);

    if (hasAction) sceneType = "action-packed scene";
    if (hasLearning) sceneType = "learning/discovery scene";
    if (hasTriumph) sceneType = "triumphant scene";

    prompt = `You are an expert at creating detailed image prompts for children's book illustrations. 
    
    Create a precise, detailed image prompt that EXACTLY matches the story text below. The image must visually represent every key element, character, action, and setting described in the story.
    
    Story Title: "${storyTitle || concept}"
    Page Number: ${pageNumber}
    Story Text (EXACT content to depict - use ALL of this text):
    ${fullStoryText}
    
    CRITICAL REQUIREMENTS:
    - The image prompt MUST include specific details from the story text above
    - Name and describe ALL characters mentioned in the story text
    - Include ALL actions, events, and moments described
    - Describe the exact setting, environment, and background from the story
    - Include specific objects, items, or elements mentioned in the text
    - Style: Colorful, engaging, detailed, whimsical characters, vibrant colors, perfect for educational children's book for ${ageGroup} year olds
    - This is a ${sceneType} from the story
    - The image prompt should be detailed enough that someone reading it would create the exact scene from the story
    
    IMPORTANT TEXT RENDERING RULE:
    If the image requires displaying readable text, words, signs, or any writing, you MUST format your ENTIRE response using exactly this structural template:
    'A high-resolution [STYLE] image of [SCENE]. Central focus: a [OBJECT] that displays the exact text "[TEXT]" in a clean, bold [FONT TYPE]. The spelling of "[TEXT]" must be literal, with no extra characters or stylistic distortions. Ensure high contrast between the text and the background for maximum legibility.'
    Replace the bracketed placeholders with your generated details. Do not include any other sentences if text is required in the image.
    
    IMPORTANT: Do NOT create a generic prompt. Use specific details, character names, actions, and settings from the story text above. The prompt should directly reference the story content.
    
    Return ONLY the detailed image prompt that will generate an image matching the story text exactly. No markdown, no code blocks, just the prompt text.`;
  }

  // 2. Try to generate prompt with Gemini
  const maxRetries = 3;
  let useFallbackModel = false;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const modelName = useFallbackModel ? GEMINI_CONFIG.fallbackModel : GEMINI_CONFIG.storyModel;
      console.log(`🔹 (Attempt ${attempt + 1}) Generating prompt with ${modelName}...`);

      const model = geminiStory.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let generatedPrompt = response.text().trim();

      // Clean
      if (generatedPrompt.startsWith('```')) {
        generatedPrompt = generatedPrompt.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
      }

      if (generatedPrompt) {
        console.log(`✅ Generated prompt: ${generatedPrompt.substring(0, 50)}...`);
        return generatedPrompt;
      }
    } catch (error: any) {
      console.warn(`⚠️ Error generating image prompt (Attempt ${attempt + 1}): ${error?.message || error}`);

      const isQuota = error?.message?.includes('429') || error?.message?.includes('quota');
      const isServer = error?.message?.includes('502') || error?.message?.includes('500');

      if (isQuota || isServer) {
        if (attempt === 0) {
          useFallbackModel = true; // Try fallback model next
          console.log('🔄 Switching to fallback model');
        } else {
          rotateStoryKey(); // Try rotating key
          console.log('🔄 Rotating API key');
        }
        await new Promise(r => setTimeout(r, 1000));
      } else {
        // Unknown error, try once more then break
        if (attempt > 0) break;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  console.warn('⚠️ All attempts failed. Using fallback prompt.');

  // 3. Fallback Prompt
  return `A detailed children's book illustration for "${storyTitle || concept}" - Page ${pageNumber}. This is a ${sceneType} that EXACTLY depicts the following story content: "${fullStoryText}". Style: Colorful, engaging, detailed, whimsical characters, vibrant colors, perfect for educational children's book for ${ageGroup} year olds.`;
}

export async function generateImage(imagePrompt: string, storyContext?: { text?: string; title?: string; pageNumber?: number; adventureStyle?: string }): Promise<string> {
  try {
    if (!imagePrompt || imagePrompt.length === 0) {
      throw new Error('Image prompt is required');
    }

    const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY;
    if (!POLLINATIONS_API_KEY) {
      throw new Error('POLLINATIONS_API_KEY must be set in environment variables. Do not hardcode API keys.');
    }
    const MAX_RETRIES = 3;

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        console.log(`🖼️  Generating image (Attempt ${i + 1}/${MAX_RETRIES})`);

        // Re-construct prompt/URL each time
        let prompt = imagePrompt.trim();
        const storyPrefix = storyContext?.title
          ? `Children's book illustration for "${storyContext.title}" Page ${storyContext.pageNumber || 1}. `
          : 'Children\'s book illustration. ';

        let styleSuffix = ' Colorful digital art, children\'s book style, warm lighting, detailed background, expressive characters, storybook illustration, Pixar-inspired, whimsical, magical atmosphere.';

        if (storyContext?.adventureStyle === 'none') {
          styleSuffix = ' Clear educational diagram, infographic style, clean lines, colorful flat design, labeled vector illustration, white background, high contrast, easy to understand.';
        }

        prompt = storyPrefix + prompt + styleSuffix;
        if (prompt.length > 1500) prompt = prompt.substring(0, 1500);

        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 1000000) + i;
        const model = i > 1 ? 'turbo' : 'flux';

        // Use user-provided endpoint format
        const POLLINATIONS_API_URL = `https://gen.pollinations.ai/image/${encodedPrompt}?model=${model}&width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;

        console.log(`📡 Fetching from Pollinations (Model: ${model})...`);
        console.log(`🔗 URL: ${POLLINATIONS_API_URL.substring(0, 100)}...`);

        const headers: any = {
          'Accept': 'image/*',
          'User-Agent': 'TechTales/1.0',
        };
        if (POLLINATIONS_API_KEY) headers['Authorization'] = `Bearer ${POLLINATIONS_API_KEY}`;

        const response = await axios.get(POLLINATIONS_API_URL, {
          responseType: 'arraybuffer',
          timeout: 60000,
          headers: headers
        });

        if (response.status === 200) {
          const buffer = Buffer.from(response.data);

          // Check for HTML response (starts with <!)
          if (buffer.toString('utf-8', 0, 50).trim().startsWith('<')) {
            console.warn(`⚠️ Received HTML response instead of image on attempt ${i + 1}`);
            if (i === MAX_RETRIES - 1) throw new Error('Received HTML instead of image');
            continue; // Try next retry
          }

          if (buffer.length > 1024) {
            const base64 = buffer.toString('base64');
            let mime = 'image/jpeg';
            if (buffer[0] === 0x89 && buffer[1] === 0x50) mime = 'image/png';
            else if (buffer[0] === 0x52 && buffer[1] === 0x49) mime = 'image/webp';

            console.log(`✅ Image generated successfully!`);
            return `data:${mime};base64,${base64}`;
          }
        }
      } catch (err: any) {
        console.warn(`⚠️ Pollinations attempt ${i + 1} failed: ${err.message}`);
        if (i === MAX_RETRIES - 1) throw err;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    throw new Error('All image generation attempts failed');
  } catch (error: any) {
    console.error(`❌ Image generation failed: ${error?.message || error}`);
    throw new Error(`Image generation failed: ${error?.message || error}`);
  }
}

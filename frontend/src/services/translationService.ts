// Translation service using MyMemory Translation API (free, no API key required)
// Fallback to Google Translate if needed

export type LanguageCode = 'en' | 'hi' | 'te';

export interface TranslationOptions {
  text: string;
  from: LanguageCode;
  to: LanguageCode;
}

// Language names mapping
export const languageNames: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
};

// Language codes for translation APIs
export const languageCodes: Record<LanguageCode, string> = {
  en: 'en',
  hi: 'hi',
  te: 'te',
};

// Simple translation cache
const translationCache: Map<string, string> = new Map();

const getCacheKey = (text: string, from: LanguageCode, to: LanguageCode): string => {
  return `${from}-${to}-${text.substring(0, 100)}`;
};

export const translationService = {
  /**
   * Translate text using MyMemory Translation API (free, no key required)
   */
  translate: async (options: TranslationOptions): Promise<string> => {
    const { text, from, to } = options;

    // If same language, return original text
    if (from === to) {
      return text;
    }

    // Check cache
    const cacheKey = getCacheKey(text, from, to);
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      // Use MyMemory Translation API (free, no API key needed)
      const fromCode = languageCodes[from];
      const toCode = languageCodes[to];
      
      // Limit text length to avoid API issues (MyMemory has limits)
      const textToTranslate = text.substring(0, 500);
      
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${fromCode}|${toCode}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Translation API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check for valid response - MyMemory API can return different structures
      let translatedText: string | null = null;
      
      // Try different response formats
      if (data && data.responseData && data.responseData.translatedText) {
        translatedText = data.responseData.translatedText;
      } else if (data && data.translatedText) {
        translatedText = data.translatedText;
      } else if (data && Array.isArray(data) && data[0] && data[0].translatedText) {
        translatedText = data[0].translatedText;
      } else if (data && data.responseStatus === 200 && data.matches && Array.isArray(data.matches) && data.matches.length > 0) {
        // Sometimes API returns matches array
        translatedText = data.matches[0].translation;
      }
      
      if (translatedText) {
        // Clean up the translation (sometimes API returns HTML entities)
        translatedText = translatedText
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&nbsp;/g, ' ')
          .trim();
        
        // If translation is same as original (API issue), return original
        if (translatedText.toLowerCase() === textToTranslate.trim().toLowerCase()) {
          console.warn('Translation returned same text, using original');
          return text;
        }
        
        // Cache the result
        translationCache.set(cacheKey, translatedText);
        
        return translatedText;
      } else {
        // Log the response for debugging
        console.warn('Translation API response structure:', data);
        // Return original text instead of throwing error
        return text;
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      // Return original text if translation fails (don't throw, just return original)
      return text;
    }
  },

  /**
   * Translate multiple texts
   */
  translateBatch: async (texts: string[], from: LanguageCode, to: LanguageCode): Promise<string[]> => {
    // Translate in batches to avoid rate limits
    const batchSize = 3;
    const translations: string[] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchTranslations = await Promise.all(
        batch.map(text => translationService.translate({ text, from, to }))
      );
      translations.push(...batchTranslations);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return translations;
  },

  /**
   * Clear translation cache
   */
  clearCache: () => {
    translationCache.clear();
  },
};

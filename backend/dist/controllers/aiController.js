"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithAI = void 0;
const gemini_1 = require("../config/gemini");
const chatWithAI = async (req, res) => {
    try {
        const { message, context, conversationHistory = [] } = req.body;
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }
        // Build context-aware prompt
        let systemPrompt = `You are a friendly and helpful AI assistant for a children's story application called StoryWizard.

RESPONSE STYLE:
- Write in a natural, conversational tone like you're chatting with a friend
- DO NOT use markdown formatting (no ##, **, *, -, or bullet points)
- DO NOT use headers or section titles
- Keep responses concise but helpful
- Use simple paragraphs with line breaks between ideas
- For lists, just write them naturally in sentences or use simple numbering like "1." "2." etc.
- For math formulas, write them in plain text (e.g., "sin(x)/cos(x) = tan(x)")

You can answer ANY question the user asks - whether it's about:
- The story they're reading
- Mathematics, science, history, or any school subject
- General knowledge questions
- Creative writing help

Be warm, encouraging, and helpful. Keep your tone friendly and age-appropriate.`;
        if (context) {
            systemPrompt += `\n\nCurrent Story Context:
- Title: ${context.title || 'N/A'}
- Concept: ${context.concept || 'N/A'}`;
            if (context.currentPage !== undefined) {
                systemPrompt += `\n- Current Page: ${context.currentPage + 1}`;
            }
            if (context.currentText) {
                systemPrompt += `\n- Current Page Text: ${context.currentText.substring(0, 200)}...`;
            }
        }
        // Build conversation history
        const conversationParts = [];
        // Add conversation history if available
        if (conversationHistory && conversationHistory.length > 0) {
            conversationHistory
                .slice(-10) // Keep last 10 messages for context
                .forEach((msg) => {
                conversationParts.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }],
                });
            });
        }
        // Add current message
        conversationParts.push({
            role: 'user',
            parts: [{ text: message }],
        });
        let lastError = null;
        const maxRetries = 3;
        let modelName = gemini_1.GEMINI_CONFIG.storyModel;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const model = gemini_1.geminiStory.getGenerativeModel({
                    model: modelName,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048, // Increased to allow longer, complete responses
                    },
                });
                // Combine system prompt with conversation
                const allContents = [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    ...conversationParts,
                ];
                const result = await model.generateContent({
                    contents: allContents,
                });
                const response = await result.response;
                let responseText = '';
                // Get full response text - handle both single and streaming responses
                try {
                    responseText = response.text();
                }
                catch (error) {
                    // If text() fails, try to get text from candidates
                    const candidates = response.candidates;
                    if (candidates && candidates.length > 0) {
                        const candidate = candidates[0];
                        if (candidate.content && candidate.content.parts) {
                            responseText = candidate.content.parts
                                .map((part) => part.text || '')
                                .join('');
                        }
                    }
                }
                if (!responseText || responseText.trim().length === 0) {
                    throw new Error('No response from AI');
                }
                // Log response length for debugging
                console.log(`AI Response length: ${responseText.length} characters`);
                res.json({
                    success: true,
                    response: responseText,
                });
                return;
            }
            catch (error) {
                lastError = error;
                const errorMessage = error?.message || '';
                // Check for quota errors
                const isQuotaError = errorMessage.includes('429') ||
                    errorMessage.includes('quota') ||
                    errorMessage.includes('Quota exceeded');
                if (isQuotaError && attempt < maxRetries - 1) {
                    (0, gemini_1.rotateStoryKey)();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }
                // Check for network errors
                if ((errorMessage.includes('fetch failed') ||
                    errorMessage.includes('network')) &&
                    attempt < maxRetries - 1) {
                    (0, gemini_1.rotateStoryKey)();
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
                throw error;
            }
        }
        throw lastError || new Error('Failed to get AI response');
    }
    catch (error) {
        console.error('Error in chatWithAI:', error);
        res.status(500).json({
            error: 'Failed to get AI response',
            message: error?.message || 'Unknown error',
        });
    }
};
exports.chatWithAI = chatWithAI;
//# sourceMappingURL=aiController.js.map
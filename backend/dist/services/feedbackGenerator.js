"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePersonalizedFeedback = generatePersonalizedFeedback;
const gemini_1 = require("../config/gemini");
async function generatePersonalizedFeedback(options) {
    const { score, topic, totalQuestions } = options;
    const prompt = `You are a personalized learning guide. A student just scored ${score}% on a quiz about the story topic "${topic}".
Provide meaningful feedback that helps the user grow. Recommend what they should learn next, deep dive into concepts related to the story, and identify areas to review.

Return ONLY a valid JSON object with the following structure:
{
  "encouragementMessage": "A personalized, encouraging 2-sentence message. Be warm and specific to their performance level.",
  "nextTopics": ["3 specific, highly meaningful related topics or deep-dive concepts they should explore next to grow their understanding"],
  "areasOfConcern": [${score < 80 ? '"2-3 specific areas they need to review based on their score"' : '"leave this array empty"'}]
}`;
    try {
        const model = gemini_1.geminiStory.getGenerativeModel({
            model: gemini_1.GEMINI_CONFIG.storyModel,
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
        }
        else if (content.startsWith('```')) {
            content = content.replace(/^```\w*\n?/, '');
        }
        content = content.replace(/\n?```$/, '');
        // Safely extract just the JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Failed to extract JSON from AI response");
        }
        const data = JSON.parse(jsonMatch[0]);
        return {
            encouragementMessage: data.encouragementMessage || `You scored ${score}% on ${topic}. Keep practicing!`,
            nextTopics: Array.isArray(data.nextTopics) && data.nextTopics.length > 0
                ? data.nextTopics
                : [`Deep dive into ${topic}`, `Advanced applications of ${topic}`, `Real-world impact of ${topic}`],
            areasOfConcern: Array.isArray(data.areasOfConcern) ? data.areasOfConcern : [],
        };
    }
    catch (error) {
        console.error('Error generating personalized feedback:', error);
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
}
//# sourceMappingURL=feedbackGenerator.js.map
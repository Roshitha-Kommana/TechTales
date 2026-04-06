import { GoogleGenerativeAI } from '@google/generative-ai';
export declare const getStoryClient: () => GoogleGenerativeAI;
export declare const rotateStoryKey: () => void;
export declare const getQuizClient: () => GoogleGenerativeAI;
export declare const rotateQuizKey: () => void;
export declare const geminiStory: {
    getGenerativeModel: (config: any) => import("@google/generative-ai").GenerativeModel;
};
export declare const geminiQuiz: {
    getGenerativeModel: (config: any) => import("@google/generative-ai").GenerativeModel;
};
export declare const getImageClient: () => GoogleGenerativeAI;
export declare const rotateImageKey: () => void;
export declare const geminiImage: {
    getGenerativeModel: (config: any) => import("@google/generative-ai").GenerativeModel;
};
export declare const GEMINI_CONFIG: {
    storyModel: string;
    quizModel: string;
    imageModel: string;
    fallbackModel: string;
    temperature: {
        story: number;
        quiz: number;
        prompt: number;
        image: number;
    };
};
//# sourceMappingURL=gemini.d.ts.map
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
export declare function generateQuiz(options: QuizGenerationOptions): Promise<GeneratedQuiz>;
export declare function calculateQuizAnalytics(questions: IQuizQuestion[], results: Array<{
    questionNumber: number;
    selectedAnswer: number;
    isCorrect: boolean;
}>): {
    score: number;
    areasOfConcern: string[];
    strengths: string[];
};
export declare function generateQuizExplanations(questions: IQuizQuestion[], concept: string): Promise<IQuizQuestion[]>;
export {};
//# sourceMappingURL=quizGenerator.d.ts.map
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
export declare function generatePersonalizedFeedback(options: FeedbackOptions): Promise<PersonalizedFeedback>;
export {};
//# sourceMappingURL=feedbackGenerator.d.ts.map
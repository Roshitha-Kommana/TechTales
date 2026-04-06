import mongoose, { Document } from 'mongoose';
export interface IQuizQuestion {
    questionNumber: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}
export interface IQuizResult {
    questionNumber: number;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent?: number;
}
export interface IQuiz extends Document {
    storyId: mongoose.Types.ObjectId;
    concept: string;
    questions: IQuizQuestion[];
    results?: IQuizResult[];
    score?: number;
    completedAt?: Date;
    areasOfConcern?: string[];
    userId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Quiz: mongoose.Model<IQuiz, {}, {}, {}, mongoose.Document<unknown, {}, IQuiz, {}, {}> & IQuiz & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Quiz.d.ts.map
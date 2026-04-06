import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizQuestion {
  questionNumber: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation?: string;
}

export interface IQuizResult {
  questionNumber: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent?: number; // in seconds
}

export interface IQuiz extends Document {
  storyId: mongoose.Types.ObjectId;
  concept: string;
  questions: IQuizQuestion[];
  results?: IQuizResult[];
  score?: number; // Percentage
  completedAt?: Date;
  areasOfConcern?: string[]; // Topics that need improvement
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  questionNumber: { type: Number, required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
});

const QuizResultSchema = new Schema<IQuizResult>({
  questionNumber: { type: Number, required: true },
  selectedAnswer: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  timeSpent: { type: Number },
});

const QuizSchema = new Schema<IQuiz>(
  {
    storyId: { type: Schema.Types.ObjectId, ref: 'Story', required: true },
    concept: { type: String, required: true },
    questions: [QuizQuestionSchema],
    results: [QuizResultSchema],
    score: { type: Number },
    completedAt: { type: Date },
    areasOfConcern: [{ type: String }],
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);


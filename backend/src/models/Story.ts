import mongoose, { Schema, Document } from 'mongoose';

export interface IStoryPage {
  pageNumber: number;
  text: string;
  imageUrl?: string;
  imagePrompt?: string;
  keyPoints?: string[]; // Educational key points, definitions, formulas for this page
}


export interface IStory extends Document {
  title: string;
  concept: string;
  pages: IStoryPage[];
  ageGroup?: string;
  difficulty?: string;
  adventureStyle?: string;
  keyConcepts?: string[];
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StoryPageSchema = new Schema<IStoryPage>({
  pageNumber: { type: Number, required: true },
  text: { type: String, required: true },
  imageUrl: { type: String },
  imagePrompt: { type: String },
  keyPoints: [{ type: String }],
});


const StorySchema = new Schema<IStory>(
  {
    title: { type: String, required: true },
    concept: { type: String, required: true },
    pages: [StoryPageSchema],
    ageGroup: { type: String, default: '8-12' },
    difficulty: { type: String, default: 'medium' },
    adventureStyle: { type: String, default: 'adventure' },
    keyConcepts: [{ type: String }],
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

export const Story = mongoose.model<IStory>('Story', StorySchema);


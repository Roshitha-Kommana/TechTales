import mongoose, { Document } from 'mongoose';
export interface IStoryPage {
    pageNumber: number;
    text: string;
    imageUrl?: string;
    imagePrompt?: string;
    keyPoints?: string[];
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
export declare const Story: mongoose.Model<IStory, {}, {}, {}, mongoose.Document<unknown, {}, IStory, {}, {}> & IStory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Story.d.ts.map
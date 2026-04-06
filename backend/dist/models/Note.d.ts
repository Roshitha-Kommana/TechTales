import mongoose, { Document } from 'mongoose';
export interface INote extends Document {
    title: string;
    content: string;
    storyId?: mongoose.Types.ObjectId;
    storyTitle?: string;
    pageNumber?: number;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Note: mongoose.Model<INote, {}, {}, {}, mongoose.Document<unknown, {}, INote, {}, {}> & INote & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Note.d.ts.map
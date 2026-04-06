import mongoose, { Document } from 'mongoose';
export interface IConcept extends Document {
    name: string;
    description: string;
    category: string;
    difficulty: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Concept: mongoose.Model<IConcept, {}, {}, {}, mongoose.Document<unknown, {}, IConcept, {}, {}> & IConcept & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Concept.d.ts.map
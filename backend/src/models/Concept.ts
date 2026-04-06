import mongoose, { Schema, Document } from 'mongoose';

export interface IConcept extends Document {
  name: string;
  description: string;
  category: string;
  difficulty: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConceptSchema = new Schema<IConcept>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, default: 'medium' },
  },
  {
    timestamps: true,
  }
);

export const Concept = mongoose.model<IConcept>('Concept', ConceptSchema);



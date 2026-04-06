import mongoose, { Schema, Document } from 'mongoose';

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

const NoteSchema = new Schema<INote>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    storyId: { type: Schema.Types.ObjectId, ref: 'Story' },
    storyTitle: { type: String },
    pageNumber: { type: Number },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
NoteSchema.index({ userId: 1, createdAt: -1 });

export const Note = mongoose.model<INote>('Note', NoteSchema);

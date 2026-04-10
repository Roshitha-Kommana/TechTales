import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  learningStreak?: number;
  lastLoginDate?: Date;
  lastActivityDate?: Date;
  points?: number;
  weakAreas?: string[];
  // Profile customization
  avatarColor?: string;
  bio?: string;
  preferredDifficulty?: string;
  notificationsEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: true, trim: true },
    learningStreak: { type: Number, default: 0 },
    lastLoginDate: { type: Date },
    lastActivityDate: { type: Date },
    points: { type: Number, default: 0 },
    weakAreas: [{ type: String }],
    // Profile customization
    avatarColor: { type: String, default: '#309898' },
    bio: { type: String, maxlength: 200, default: '' },
    preferredDifficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    notificationsEnabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);



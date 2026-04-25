import mongoose, { Schema, Document, Model } from 'mongoose';
import './Branch';

export interface ICoach extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  photo?: string;
  title: string;
  bio: string;
  experience: number;
  achievements: string[];
  specialization: string[];
  branch: mongoose.Types.ObjectId;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CoachSchema = new Schema<ICoach>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    photo: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    bio: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0 },
    achievements: { type: [{ type: String, trim: true }], default: [] },
    specialization: { type: [{ type: String, trim: true }], default: [] },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

const Coach: Model<ICoach> = mongoose.models.Coach || mongoose.model<ICoach>('Coach', CoachSchema);
export default Coach;

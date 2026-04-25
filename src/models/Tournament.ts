import mongoose, { Schema, Document, Model } from 'mongoose';
import './Branch';
import './User';

export interface ITournamentPlace {
  place: 1 | 2 | 3;
  name: string;
  photo?: string;
}

export interface ITournament extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  gallery: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  startDate: Date;
  endDate?: Date;
  branch: mongoose.Types.ObjectId;
  location?: string;
  prizes: ITournamentPlace[];
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TournamentSchema = new Schema<ITournament>(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true, trim: true },
    coverImage: { type: String, trim: true },
    gallery: { type: [{ type: String, trim: true }], default: [] },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: {
      type: Date,
      validate: {
        validator(this: ITournament, value?: Date) {
          return !value || !this.startDate || value >= this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    location: { type: String, trim: true },
    prizes: [
      {
        place: { type: Number, enum: [1, 2, 3], required: true },
        name: { type: String, trim: true, required: true },
        photo: { type: String, trim: true },
      },
    ],
    isPublished: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

TournamentSchema.index({ status: 1, startDate: -1 });
TournamentSchema.index({ branch: 1, status: 1 });

const Tournament: Model<ITournament> =
  mongoose.models.Tournament || mongoose.model<ITournament>('Tournament', TournamentSchema);
export default Tournament;

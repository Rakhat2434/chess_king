import mongoose, { Schema, Document, Model } from 'mongoose';
import './Branch';
import './Coach';
import './Tournament';
import './User';

// ─── TournamentComment ───────────────────────────────────────────
export interface ITournamentComment extends Document {
  _id: mongoose.Types.ObjectId;
  tournament: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  text: string;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TournamentCommentSchema = new Schema<ITournamentComment>(
  {
    tournament: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
    isVisible: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const TournamentComment: Model<ITournamentComment> =
  mongoose.models.TournamentComment ||
  mongoose.model<ITournamentComment>('TournamentComment', TournamentCommentSchema);

// ─── Enrollment (Записи на уроки) ────────────────────────────────
export interface IEnrollment extends Document {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  parentName: string;
  studentName?: string;
  age?: number;
  phone: string;
  branch: mongoose.Types.ObjectId;
  coach?: mongoose.Types.ObjectId;
  preferredTime: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  comment?: string;
  status: 'new' | 'processing' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    parentName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    studentName: { type: String, trim: true, maxlength: 100 },
    age: { type: Number, min: 4, max: 99 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    coach: { type: Schema.Types.ObjectId, ref: 'Coach' },
    preferredTime: { type: String, required: true, trim: true, maxlength: 120 },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    comment: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['new', 'processing', 'confirmed', 'cancelled'],
      default: 'new',
      index: true,
    },
  },
  { timestamps: true }
);

export const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);

// ─── Champion ────────────────────────────────────────────────────
export interface IChampion extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  photo?: string;
  achievement: string;
  year: number;
  branch?: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChampionSchema = new Schema<IChampion>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    photo: { type: String, trim: true },
    achievement: { type: String, required: true, trim: true, minlength: 2, maxlength: 300 },
    year: { type: Number, required: true, min: 1900, max: 2100 },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

export const Champion: Model<IChampion> =
  mongoose.models.Champion || mongoose.model<IChampion>('Champion', ChampionSchema);

// ─── TournamentVisit ─────────────────────────────────────────────
export interface ITournamentVisit extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  tournament: mongoose.Types.ObjectId;
  visitedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TournamentVisitSchema = new Schema<ITournamentVisit>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tournament: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true, index: true },
    visitedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TournamentVisitSchema.index({ user: 1, tournament: 1 }, { unique: true });

export const TournamentVisit: Model<ITournamentVisit> =
  mongoose.models.TournamentVisit ||
  mongoose.model<ITournamentVisit>('TournamentVisit', TournamentVisitSchema);

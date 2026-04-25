import mongoose, { Schema, Document, Model } from 'mongoose';
import './User';

export interface INews extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt: { type: String, required: true, trim: true, maxlength: 400 },
    content: { type: String, required: true, trim: true },
    coverImage: { type: String, trim: true },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    views: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

NewsSchema.index({ isPublished: 1, publishedAt: -1 });

const News: Model<INews> = mongoose.models.News || mongoose.model<INews>('News', NewsSchema);
export default News;

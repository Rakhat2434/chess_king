import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBranch extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  whatsapp?: string;
  mapEmbed?: string;
  mapUrl?: string;
  schedule: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, default: 'Астана' },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    whatsapp: { type: String, trim: true, maxlength: 40 },
    mapEmbed: { type: String, trim: true },
    mapUrl: { type: String, trim: true },
    schedule: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

const Branch: Model<IBranch> = mongoose.models.Branch || mongoose.model<IBranch>('Branch', BranchSchema);
export default Branch;

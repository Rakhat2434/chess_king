import mongoose, { Schema, Document, Model } from 'mongoose';
import { isValidEmailAddress } from '@/lib/validators';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^\S+@\S+\.\S+$/,
      validate: {
        validator(this: IUser, value: string) {
          return this.role !== 'user' || isValidEmailAddress(value);
        },
        message: 'User email must be a valid email address',
      },
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user', required: true, index: true },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      match: /^\+7\d{10}$/,
      required(this: IUser) {
        return this.role === 'user';
      },
    },
    avatar: { type: String, trim: true },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;

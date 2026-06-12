import mongoose, { Schema, Document, Model } from 'mongoose';
import type { Language } from '@/lib/i18n';

export interface ITranslationCache extends Document {
  key: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  sourceHash: string;
  sourceText: string;
  translatedText: string;
  provider: string;
  providerModel: string;
  usageCount: number;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TranslationCacheSchema = new Schema<ITranslationCache>(
  {
    key: { type: String, required: true, unique: true, index: true },
    sourceLanguage: { type: String, enum: ['ru', 'kz'], required: true, default: 'ru' },
    targetLanguage: { type: String, enum: ['ru', 'kz'], required: true, index: true },
    sourceHash: { type: String, required: true, index: true },
    sourceText: { type: String, required: true },
    translatedText: { type: String, required: true },
    provider: { type: String, required: true, default: 'openai' },
    providerModel: { type: String, required: true },
    usageCount: { type: Number, required: true, min: 0, default: 0 },
    lastUsedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: true }
);

TranslationCacheSchema.index({ sourceLanguage: 1, targetLanguage: 1, sourceHash: 1 });
TranslationCacheSchema.index({ updatedAt: -1 });

const TranslationCache: Model<ITranslationCache> =
  mongoose.models.TranslationCache ||
  mongoose.model<ITranslationCache>('TranslationCache', TranslationCacheSchema);

export default TranslationCache;

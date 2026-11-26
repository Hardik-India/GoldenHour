import { Document, Schema, model } from 'mongoose';

export interface IGuideStep {
  order: number;
  title: string;
  text: string;
}

export interface IFirstAidGuide extends Document {
  slug: string;
  locale: string;
  title: string;
  category: string;
  summary: string;
  steps: IGuideStep[];
  warnings: string[];
  dontDo: string[];
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const guideSchema = new Schema<IFirstAidGuide>(
  {
    slug: { type: String, required: true, trim: true },
    locale: { type: String, default: 'en' },
    title: { type: String, required: true },
    category: { type: String, default: 'general' },
    summary: { type: String, default: '' },
    steps: {
      type: [
        new Schema(
          { order: Number, title: String, text: String },
          { _id: false }
        ),
      ],
      default: [],
    },
    warnings: { type: [String], default: [] },
    dontDo: { type: [String], default: [] },
    reviewedBy: String,
  },
  { timestamps: true }
);

guideSchema.index({ slug: 1, locale: 1 }, { unique: true });

export const FirstAidGuide = model<IFirstAidGuide>('FirstAidGuide', guideSchema);

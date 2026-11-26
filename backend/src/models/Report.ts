import { Document, Schema, Types, model } from 'mongoose';

export interface IReport extends Document {
  reporter: Types.ObjectId;
  targetUser?: Types.ObjectId;
  incident?: Types.ObjectId;
  bloodRequest?: Types.ObjectId;
  reason: 'false_alarm' | 'abuse' | 'spam' | 'unsafe_behaviour' | 'other';
  details: string;
  status: 'open' | 'reviewed' | 'dismissed';
  createdAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetUser: { type: Schema.Types.ObjectId, ref: 'User' },
    incident: { type: Schema.Types.ObjectId, ref: 'Incident' },
    bloodRequest: { type: Schema.Types.ObjectId, ref: 'BloodRequest' },
    reason: {
      type: String,
      enum: ['false_alarm', 'abuse', 'spam', 'unsafe_behaviour', 'other'],
      required: true,
    },
    details: { type: String, default: '', maxlength: 500 },
    status: { type: String, enum: ['open', 'reviewed', 'dismissed'], default: 'open' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Report = model<IReport>('Report', reportSchema);

import { Document, Schema, Types, model } from 'mongoose';

export interface INotification extends Document {
  user: Types.ObjectId;
  type: 'incident' | 'blood' | 'system';
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['incident', 'blood', 'system'], default: 'system' },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    data: { type: Schema.Types.Mixed, default: {} },
    readAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);

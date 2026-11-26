import { Document, Schema, Types, model } from 'mongoose';
import { pointSchema } from './geoPoint';
import { GeoPoint } from '../utils/geo';
import { BLOOD_GROUPS, BloodGroup } from '../utils/bloodCompat';

export type BloodUrgency = 'critical' | 'urgent' | 'planned';
export type BloodRequestStatus = 'open' | 'partially_fulfilled' | 'fulfilled' | 'cancelled' | 'expired';
export type DonorResponse = 'notified' | 'accepted' | 'declined' | 'donated';

export interface IBloodMatch {
  donor: Types.ObjectId;
  status: DonorResponse;
  distanceKm: number;
  notifiedAt: Date;
  respondedAt?: Date;
}

export interface IBloodRequest extends Document {
  requester: Types.ObjectId;
  hospital?: Types.ObjectId;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  unitsFulfilled: number;
  urgency: BloodUrgency;
  contactPhone: string;
  note: string;
  location: GeoPoint;
  status: BloodRequestStatus;
  matches: IBloodMatch[];
  neededBy?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema<IBloodMatch>(
  {
    donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['notified', 'accepted', 'declined', 'donated'],
      default: 'notified',
    },
    distanceKm: { type: Number, default: 0 },
    notifiedAt: { type: Date, default: Date.now },
    respondedAt: Date,
  },
  { _id: false }
);

const bloodRequestSchema = new Schema<IBloodRequest>(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    patientName: { type: String, required: true, trim: true, maxlength: 80 },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    unitsNeeded: { type: Number, required: true, min: 1, max: 20 },
    unitsFulfilled: { type: Number, default: 0 },
    urgency: { type: String, enum: ['critical', 'urgent', 'planned'], default: 'urgent' },
    contactPhone: { type: String, required: true },
    note: { type: String, default: '', maxlength: 300 },
    location: { type: pointSchema, required: true },
    status: {
      type: String,
      enum: ['open', 'partially_fulfilled', 'fulfilled', 'cancelled', 'expired'],
      default: 'open',
    },
    matches: { type: [matchSchema], default: [] },
    neededBy: Date,
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

bloodRequestSchema.index({ location: '2dsphere' });
bloodRequestSchema.index({ status: 1, bloodGroup: 1, createdAt: -1 });
bloodRequestSchema.index({ expiresAt: 1 });

export const BloodRequest = model<IBloodRequest>('BloodRequest', bloodRequestSchema);

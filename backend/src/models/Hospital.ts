import { Document, Schema, model } from 'mongoose';
import { pointSchema } from './geoPoint';
import { GeoPoint } from '../utils/geo';

export type TraumaLevel = 'none' | 'basic' | 'advanced';

export interface IHospital extends Document {
  name: string;
  address: string;
  city: string;
  phone: string;
  location: GeoPoint;
  traumaLevel: TraumaLevel;
  hasICU: boolean;
  hasBloodBank: boolean;
  open24x7: boolean;
  beds: { icu: number; general: number };
  bloodStock: Map<string, number>;
  bloodStockUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const hospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: pointSchema, required: true },
    traumaLevel: { type: String, enum: ['none', 'basic', 'advanced'], default: 'basic' },
    hasICU: { type: Boolean, default: false },
    hasBloodBank: { type: Boolean, default: false },
    open24x7: { type: Boolean, default: true },
    beds: {
      icu: { type: Number, default: 0 },
      general: { type: Number, default: 0 },
    },
    bloodStock: { type: Map, of: Number, default: {} },
    bloodStockUpdatedAt: Date,
  },
  { timestamps: true }
);

hospitalSchema.index({ location: '2dsphere' });

export const Hospital = model<IHospital>('Hospital', hospitalSchema);

import { Document, Schema, model } from 'mongoose';
import { pointSchema } from './geoPoint';
import { GeoPoint } from '../utils/geo';

export type AmbulanceStatus = 'available' | 'dispatched' | 'busy' | 'offline';
export type AmbulanceType = 'BLS' | 'ALS' | 'neonatal';

export interface IAmbulance extends Document {
  vehicleNumber: string;
  type: AmbulanceType;
  operator: string;
  phone: string;
  status: AmbulanceStatus;
  location: GeoPoint;
  hospital?: Schema.Types.ObjectId;
  currentIncident?: Schema.Types.ObjectId;
  updatedAt: Date;
}

const ambulanceSchema = new Schema<IAmbulance>(
  {
    vehicleNumber: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ['BLS', 'ALS', 'neonatal'], default: 'BLS' },
    operator: { type: String, default: '' },
    phone: { type: String, default: '' },
    status: {
      type: String,
      enum: ['available', 'dispatched', 'busy', 'offline'],
      default: 'available',
    },
    location: { type: pointSchema, required: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    currentIncident: { type: Schema.Types.ObjectId, ref: 'Incident' },
  },
  { timestamps: true }
);

ambulanceSchema.index({ location: '2dsphere' });
ambulanceSchema.index({ status: 1 });

export const Ambulance = model<IAmbulance>('Ambulance', ambulanceSchema);

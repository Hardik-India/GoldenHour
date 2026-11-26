import { Document, Schema, Types, model } from 'mongoose';
import { pointSchema } from './geoPoint';
import { GeoPoint } from '../utils/geo';
import { Severity } from '../utils/triage';

export type IncidentType =
  | 'road_accident'
  | 'cardiac'
  | 'bleeding'
  | 'drowning'
  | 'snakebite'
  | 'burn'
  | 'other';

export type IncidentStatus =
  | 'open'
  | 'responder_assigned'
  | 'on_scene'
  | 'resolved'
  | 'cancelled';

export type ResponderStatus = 'notified' | 'accepted' | 'declined' | 'arrived';

export interface IIncidentResponder {
  user: Types.ObjectId;
  status: ResponderStatus;
  distanceKm: number;
  etaMinutes: number;
  notifiedAt: Date;
  respondedAt?: Date;
  arrivedAt?: Date;
}

export interface IIncident extends Document {
  reporter: Types.ObjectId;
  type: IncidentType;
  severity: Severity;
  description: string;
  address: string;
  location: GeoPoint;
  triage: {
    conscious?: boolean;
    breathing?: boolean;
    severeBleeding?: boolean;
    chestPain?: boolean;
    canMove?: boolean;
    trapped?: boolean;
  };
  status: IncidentStatus;
  responders: IIncidentResponder[];
  ambulance?: Types.ObjectId;
  hospital?: Types.ObjectId;
  timeline: { at: Date; event: string }[];
  firstResponseSec?: number;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const responderSchema = new Schema<IIncidentResponder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['notified', 'accepted', 'declined', 'arrived'],
      default: 'notified',
    },
    distanceKm: { type: Number, default: 0 },
    etaMinutes: { type: Number, default: 0 },
    notifiedAt: { type: Date, default: Date.now },
    respondedAt: Date,
    arrivedAt: Date,
  },
  { _id: false }
);

const incidentSchema = new Schema<IIncident>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['road_accident', 'cardiac', 'bleeding', 'drowning', 'snakebite', 'burn', 'other'],
      default: 'road_accident',
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    description: { type: String, default: '', maxlength: 500 },
    address: { type: String, default: '' },
    location: { type: pointSchema, required: true },
    triage: {
      conscious: Boolean,
      breathing: Boolean,
      severeBleeding: Boolean,
      chestPain: Boolean,
      canMove: Boolean,
      trapped: Boolean,
    },
    status: {
      type: String,
      enum: ['open', 'responder_assigned', 'on_scene', 'resolved', 'cancelled'],
      default: 'open',
    },
    responders: { type: [responderSchema], default: [] },
    ambulance: { type: Schema.Types.ObjectId, ref: 'Ambulance' },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    timeline: {
      type: [new Schema({ at: { type: Date, default: Date.now }, event: String }, { _id: false })],
      default: [],
    },
    firstResponseSec: Number,
    resolvedAt: Date,
  },
  { timestamps: true }
);

incidentSchema.index({ location: '2dsphere' });
incidentSchema.index({ status: 1, createdAt: -1 });
incidentSchema.index({ reporter: 1, createdAt: -1 });
incidentSchema.index({ 'responders.user': 1 });

export const Incident = model<IIncident>('Incident', incidentSchema);

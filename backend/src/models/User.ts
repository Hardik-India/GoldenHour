import { Document, Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { pointSchema } from './geoPoint';
import { BLOOD_GROUPS, BloodGroup } from '../utils/bloodCompat';
import { GeoPoint } from '../utils/geo';

export type UserRole = 'citizen' | 'responder' | 'hospital' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  language: string;
  location?: GeoPoint;
  locationUpdatedAt?: Date;
  responderProfile: {
    isResponder: boolean;
    verified: boolean;
    available: boolean;
    certifications: string[];
    appliedAt?: Date;
    verifiedAt?: Date;
    incidentsHandled: number;
  };
  donorProfile: {
    isDonor: boolean;
    bloodGroup?: BloodGroup;
    available: boolean;
    lastDonationAt?: Date;
    donationsCount: number;
  };
  hospital?: Schema.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ['citizen', 'responder', 'hospital', 'admin'],
      default: 'citizen',
    },
    language: { type: String, default: 'en' },
    location: { type: pointSchema },
    locationUpdatedAt: { type: Date },
    responderProfile: {
      isResponder: { type: Boolean, default: false },
      verified: { type: Boolean, default: false },
      available: { type: Boolean, default: false },
      certifications: { type: [String], default: [] },
      appliedAt: Date,
      verifiedAt: Date,
      incidentsHandled: { type: Number, default: 0 },
    },
    donorProfile: {
      isDonor: { type: Boolean, default: false },
      bloodGroup: { type: String, enum: BLOOD_GROUPS },
      available: { type: Boolean, default: true },
      lastDonationAt: Date,
      donationsCount: { type: Number, default: 0 },
    },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });
userSchema.index({ 'responderProfile.isResponder': 1, 'responderProfile.verified': 1 });
userSchema.index({ 'donorProfile.isDonor': 1, 'donorProfile.bloodGroup': 1 });

userSchema.pre('save', async function (this: IUser, next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (this: IUser, candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>('User', userSchema);

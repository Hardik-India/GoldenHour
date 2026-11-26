import { z } from 'zod';
import { BLOOD_GROUPS } from '../utils/bloodCompat';

const lat = z.number().min(-90).max(90);
const lng = z.number().min(-180).max(180);
const phone = z.string().trim().min(7).max(20);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  phone,
  password: z.string().min(8).max(100),
  language: z.string().trim().max(8).optional(),
  asResponder: z.boolean().optional(),
  asDonor: z.boolean().optional(),
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  certifications: z.array(z.string().trim().max(80)).max(10).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const updateMeSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: phone.optional(),
  language: z.string().trim().max(8).optional(),
  lat: lat.optional(),
  lng: lng.optional(),
  responderAvailable: z.boolean().optional(),
  donorAvailable: z.boolean().optional(),
});

export const becomeDonorSchema = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS),
  lastDonationAt: z.coerce.date().optional(),
});

export const becomeResponderSchema = z.object({
  certifications: z.array(z.string().trim().max(80)).max(10).default([]),
});

const triageShape = z.object({
  conscious: z.boolean().optional(),
  breathing: z.boolean().optional(),
  severeBleeding: z.boolean().optional(),
  chestPain: z.boolean().optional(),
  canMove: z.boolean().optional(),
  trapped: z.boolean().optional(),
});

export const triageSchema = triageShape;

export const createIncidentSchema = z.object({
  lat,
  lng,
  type: z
    .enum(['road_accident', 'cardiac', 'bleeding', 'drowning', 'snakebite', 'burn', 'other'])
    .default('road_accident'),
  address: z.string().trim().max(200).optional(),
  description: z.string().trim().max(500).optional(),
  triage: triageShape.optional(),
});

export const createBloodRequestSchema = z.object({
  patientName: z.string().trim().min(2).max(80),
  bloodGroup: z.enum(BLOOD_GROUPS),
  unitsNeeded: z.number().int().min(1).max(20),
  urgency: z.enum(['critical', 'urgent', 'planned']).default('urgent'),
  contactPhone: phone,
  note: z.string().trim().max(300).optional(),
  hospitalId: z.string().trim().optional(),
  lat,
  lng,
  neededByHours: z.number().min(1).max(720).optional(),
});

export const donorRespondSchema = z.object({
  response: z.enum(['accepted', 'declined']),
});

export const markDonatedSchema = z.object({
  donorId: z.string().trim().min(1),
  units: z.number().int().min(1).max(5).default(1),
});

export const bloodStockSchema = z.object({
  stock: z.record(z.enum(BLOOD_GROUPS), z.number().int().min(0).max(10000)),
});

export const ambulanceStatusSchema = z.object({
  status: z.enum(['available', 'dispatched', 'busy', 'offline']).optional(),
  lat: lat.optional(),
  lng: lng.optional(),
});

export const reportSchema = z.object({
  reason: z.enum(['false_alarm', 'abuse', 'spam', 'unsafe_behaviour', 'other']),
  details: z.string().trim().max(500).optional(),
  targetUserId: z.string().trim().optional(),
  incidentId: z.string().trim().optional(),
  bloodRequestId: z.string().trim().optional(),
});

export const createHospitalSchema = z.object({
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().max(200).optional(),
  city: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(20).optional(),
  lat,
  lng,
  traumaLevel: z.enum(['none', 'basic', 'advanced']).default('basic'),
  hasICU: z.boolean().default(false),
  hasBloodBank: z.boolean().default(false),
  open24x7: z.boolean().default(true),
});

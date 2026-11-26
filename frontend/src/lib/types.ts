export type Role = 'citizen' | 'responder' | 'hospital' | 'admin';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'HH';
export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'HH'];

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  language: string;
  location?: GeoPoint;
  responderProfile: {
    isResponder: boolean;
    verified: boolean;
    available: boolean;
    certifications: string[];
    incidentsHandled: number;
  };
  donorProfile: {
    isDonor: boolean;
    bloodGroup?: BloodGroup;
    available: boolean;
    lastDonationAt?: string;
    donationsCount: number;
  };
}

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Incident {
  _id: string;
  id?: string;
  type: string;
  severity: Severity;
  status: 'open' | 'responder_assigned' | 'on_scene' | 'resolved' | 'cancelled';
  address?: string;
  description?: string;
  location: GeoPoint;
  createdAt: string;
  timeline: { at: string; event: string }[];
  responders: {
    user: { _id: string; name: string; phone?: string; location?: GeoPoint } | string;
    status: string;
    distanceKm: number;
    etaMinutes: number;
  }[];
  ambulance?: {
    _id: string;
    vehicleNumber: string;
    type: string;
    phone?: string;
    status: string;
    location: GeoPoint;
  };
  hospital?: { _id: string; name: string; address?: string; phone?: string; location: GeoPoint };
  reporter?: { _id: string; name: string; phone?: string };
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  location: GeoPoint;
  traumaLevel: 'none' | 'basic' | 'advanced';
  hasICU: boolean;
  hasBloodBank: boolean;
  open24x7: boolean;
  beds: { icu: number; general: number };
  bloodStock: Record<string, number>;
  distanceKm?: number;
}

export interface AmbulanceUnit {
  id: string;
  vehicleNumber: string;
  type: string;
  operator: string;
  phone: string;
  status: string;
  location: GeoPoint;
  distanceKm: number;
  etaMinutes: number;
}

export interface BloodRequest {
  _id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  unitsFulfilled: number;
  urgency: 'critical' | 'urgent' | 'planned';
  contactPhone: string;
  note?: string;
  status: string;
  location: GeoPoint;
  createdAt: string;
  expiresAt: string;
  hospital?: { name: string; address?: string; phone?: string };
}

export interface GuideStep {
  order: number;
  title: string;
  text: string;
}

export interface FirstAidGuide {
  slug: string;
  title: string;
  category: string;
  summary: string;
  steps: GuideStep[];
  warnings: string[];
  dontDo: string[];
}

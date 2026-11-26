import { Types } from 'mongoose';
import { env } from '../config/env';
import { User, IUser } from '../models/User';
import { Ambulance, IAmbulance } from '../models/Ambulance';
import { Hospital, IHospital } from '../models/Hospital';
import { LngLat, haversineKm, nearQuery } from '../utils/geo';
import { BloodGroup, compatibleDonorGroups } from '../utils/bloodCompat';

export interface Ranked<T> {
  doc: T;
  distanceKm: number;
}

const withDistance = <T extends { location?: { coordinates: LngLat } }>(
  docs: T[],
  from: LngLat
): Ranked<T>[] =>
  docs
    .filter((d) => d.location)
    .map((doc) => ({ doc, distanceKm: haversineKm(from, doc.location!.coordinates) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

/** Verified, available responders near a point. Excludes the reporter. */
export async function findNearbyResponders(
  coords: LngLat,
  radiusKm = env.responderRadiusKm,
  excludeUserId?: Types.ObjectId | string
): Promise<Ranked<IUser>[]> {
  const filter: Record<string, unknown> = {
    isActive: true,
    'responderProfile.isResponder': true,
    'responderProfile.verified': true,
    'responderProfile.available': true,
    location: nearQuery(coords, radiusKm),
  };
  if (excludeUserId) filter._id = { $ne: excludeUserId };

  const users = await User.find(filter).limit(env.maxRespondersNotified);
  return withDistance(users, coords);
}

/** Donors who can give to the patient group, are available and past the cooldown. */
export async function findEligibleDonors(
  coords: LngLat,
  patientGroup: BloodGroup,
  radiusKm = env.donorRadiusKm,
  excludeUserId?: Types.ObjectId | string
): Promise<Ranked<IUser>[]> {
  const cutoff = new Date(Date.now() - env.donorCooldownDays * 24 * 60 * 60 * 1000);

  const filter: Record<string, unknown> = {
    isActive: true,
    'donorProfile.isDonor': true,
    'donorProfile.available': true,
    'donorProfile.bloodGroup': { $in: compatibleDonorGroups(patientGroup) },
    $or: [
      { 'donorProfile.lastDonationAt': { $exists: false } },
      { 'donorProfile.lastDonationAt': null },
      { 'donorProfile.lastDonationAt': { $lte: cutoff } },
    ],
    location: nearQuery(coords, radiusKm),
  };
  if (excludeUserId) filter._id = { $ne: excludeUserId };

  const users = await User.find(filter).limit(50);
  return withDistance(users, coords);
}

export async function findNearestAmbulance(
  coords: LngLat,
  radiusKm = env.ambulanceRadiusKm
): Promise<Ranked<IAmbulance> | null> {
  const list = await Ambulance.find({
    status: 'available',
    location: nearQuery(coords, radiusKm),
  }).limit(5);
  const ranked = withDistance(list, coords);
  return ranked[0] || null;
}

export async function findNearbyAmbulances(
  coords: LngLat,
  radiusKm = env.ambulanceRadiusKm
): Promise<Ranked<IAmbulance>[]> {
  const list = await Ambulance.find({
    status: { $in: ['available', 'dispatched'] },
    location: nearQuery(coords, radiusKm),
  }).limit(20);
  return withDistance(list, coords);
}

export interface HospitalNeeds {
  trauma?: boolean;
  icu?: boolean;
  bloodBank?: boolean;
}

export async function findNearbyHospitals(
  coords: LngLat,
  needs: HospitalNeeds = {},
  radiusKm = env.hospitalRadiusKm
): Promise<Ranked<IHospital>[]> {
  const filter: Record<string, unknown> = { location: nearQuery(coords, radiusKm) };
  if (needs.trauma) filter.traumaLevel = { $in: ['basic', 'advanced'] };
  if (needs.icu) filter.hasICU = true;
  if (needs.bloodBank) filter.hasBloodBank = true;

  const list = await Hospital.find(filter).limit(20);
  return withDistance(list, coords);
}

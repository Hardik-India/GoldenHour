import { Hospital, IHospital } from '../models/Hospital';
import { AuthRequest } from '../types/express';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { toPoint } from '../utils/geo';
import { findNearbyHospitals } from '../services/matching.service';

type HospitalLike = IHospital & { id?: string; _id?: unknown };

const serialize = (h: HospitalLike, distanceKm?: number) => ({
  id: h.id ?? String(h._id),
  name: h.name,
  address: h.address,
  city: h.city,
  phone: h.phone,
  location: h.location,
  traumaLevel: h.traumaLevel,
  hasICU: h.hasICU,
  hasBloodBank: h.hasBloodBank,
  open24x7: h.open24x7,
  beds: h.beds,
  bloodStock:
    h.bloodStock instanceof Map
      ? Object.fromEntries(h.bloodStock)
      : (h.bloodStock ?? {}),
  bloodStockUpdatedAt: h.bloodStockUpdatedAt,
  distanceKm: distanceKm !== undefined ? Number(distanceKm.toFixed(2)) : undefined,
});

/** GET /api/hospitals/nearby?lat&lng&trauma=1&icu=1&bloodBank=1 */
export const nearbyHospitals = asyncHandler(async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw ApiError.badRequest('lat and lng are required');

  const ranked = await findNearbyHospitals([lng, lat], {
    trauma: req.query.trauma === '1',
    icu: req.query.icu === '1',
    bloodBank: req.query.bloodBank === '1',
  });
  res.json({ success: true, items: ranked.map((r) => serialize(r.doc, r.distanceKm)) });
});

export const getHospital = asyncHandler(async (req, res) => {
  const h = await Hospital.findById(req.params.id);
  if (!h) throw ApiError.notFound('Hospital not found');
  res.json({ success: true, hospital: serialize(h) });
});

/** PATCH /api/hospitals/:id/blood-stock - hospital staff or admin. */
export const updateBloodStock = asyncHandler(async (req: AuthRequest, res) => {
  const h = await Hospital.findById(req.params.id);
  if (!h) throw ApiError.notFound('Hospital not found');

  const user = req.user!;
  if (user.role === 'hospital' && String(user.hospital) !== h.id) {
    throw ApiError.forbidden('You can only update your own hospital');
  }

  for (const [group, units] of Object.entries(req.body.stock as Record<string, number>)) {
    h.bloodStock.set(group, units);
  }
  h.bloodStockUpdatedAt = new Date();
  await h.save();
  res.json({ success: true, hospital: serialize(h) });
});

/** POST /api/hospitals - admin only. */
export const createHospital = asyncHandler(async (req, res) => {
  const { lat, lng, ...rest } = req.body;
  const h = await Hospital.create({ ...rest, location: toPoint(lat, lng) });
  res.status(201).json({ success: true, hospital: serialize(h) });
});
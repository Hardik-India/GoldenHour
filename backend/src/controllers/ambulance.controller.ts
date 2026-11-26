import { Ambulance } from '../models/Ambulance';
import { Incident } from '../models/Incident';
import { AuthRequest } from '../types/express';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { etaMinutes, haversineKm, toPoint } from '../utils/geo';
import { findNearbyAmbulances } from '../services/matching.service';
import { emitToIncident } from '../sockets';

/** GET /api/ambulances/nearby?lat&lng */
export const nearbyAmbulances = asyncHandler(async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw ApiError.badRequest('lat and lng are required');

  const ranked = await findNearbyAmbulances([lng, lat]);
  res.json({
    success: true,
    items: ranked.map(({ doc, distanceKm }) => ({
      id: doc.id,
      vehicleNumber: doc.vehicleNumber,
      type: doc.type,
      operator: doc.operator,
      phone: doc.phone,
      status: doc.status,
      location: doc.location,
      distanceKm: Number(distanceKm.toFixed(2)),
      etaMinutes: etaMinutes(distanceKm),
    })),
  });
});

/** PATCH /api/ambulances/:id - hospital staff / admin update status or live position. */
export const updateAmbulance = asyncHandler(async (req: AuthRequest, res) => {
  const amb = await Ambulance.findById(req.params.id);
  if (!amb) throw ApiError.notFound('Ambulance not found');

  const user = req.user!;
  if (user.role === 'hospital' && String(amb.hospital) !== String(user.hospital)) {
    throw ApiError.forbidden('You can only update your own ambulances');
  }

  const { status, lat, lng } = req.body;
  if (status) amb.status = status;
  if (typeof lat === 'number' && typeof lng === 'number') amb.location = toPoint(lat, lng);
  await amb.save();

  // Stream ambulance position to anyone following its incident
  if (amb.currentIncident && typeof lat === 'number') {
    emitToIncident(String(amb.currentIncident), 'ambulance:location', {
      ambulanceId: amb.id,
      lat,
      lng,
    });
  }
  res.json({ success: true, ambulance: amb });
});

/** POST /api/ambulances/dispatch/:incidentId - manual dispatch of the nearest available unit. */
export const dispatchToIncident = asyncHandler(async (req: AuthRequest, res) => {
  const incident = await Incident.findById(req.params.incidentId);
  if (!incident) throw ApiError.notFound('Incident not found');
  if (incident.ambulance) throw ApiError.conflict('An ambulance is already assigned');

  const [lng, lat] = incident.location.coordinates;
  const ranked = await findNearbyAmbulances([lng, lat]);
  const available = ranked.find((r) => r.doc.status === 'available');
  if (!available) throw ApiError.notFound('No ambulance available nearby. Please call 108.');

  available.doc.status = 'dispatched';
  available.doc.currentIncident = incident._id as never;
  await available.doc.save();

  incident.ambulance = available.doc._id as never;
  const km = haversineKm(available.doc.location.coordinates, incident.location.coordinates);
  incident.timeline.push({
    at: new Date(),
    event: `Ambulance ${available.doc.vehicleNumber} dispatched (ETA ${etaMinutes(km)} min)`,
  });
  await incident.save();

  emitToIncident(incident.id, 'incident:update', { incidentId: incident.id, status: incident.status });
  res.json({ success: true, ambulance: available.doc, etaMinutes: etaMinutes(km) });
});

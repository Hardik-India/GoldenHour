import { Types } from 'mongoose';
import { env } from '../config/env';
import { Incident, IIncident } from '../models/Incident';
import { Ambulance } from '../models/Ambulance';
import { User } from '../models/User';
import { AuthRequest } from '../types/express';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { etaMinutes, haversineKm, LngLat, toPoint } from '../utils/geo';
import { runTriage, severityRank } from '../utils/triage';
import {
  findNearbyHospitals,
  findNearbyResponders,
  findNearestAmbulance,
} from '../services/matching.service';
import { notifyUser } from '../services/notification.service';
import { emitPublic, emitToIncident, emitToUser } from '../sockets';

const POPULATE = [
  { path: 'responders.user', select: 'name phone responderProfile.certifications location' },
  { path: 'ambulance', select: 'vehicleNumber type operator phone status location' },
  { path: 'hospital', select: 'name address phone traumaLevel hasICU location' },
  { path: 'reporter', select: 'name phone' },
];

const addTimeline = (incident: IIncident, event: string) => {
  incident.timeline.push({ at: new Date(), event });
};

const broadcastUpdate = (incident: IIncident) => {
  const payload = { incidentId: incident.id, status: incident.status };
  emitToIncident(incident.id, 'incident:update', payload);
  emitToUser(String(incident.reporter), 'incident:update', payload);
};

/** POST /api/incidents - the SOS button. */
export const createIncident = asyncHandler(async (req: AuthRequest, res) => {
  const user = req.user!;
  const { lat, lng, type, address, description, triage } = req.body;
  const coords: LngLat = [lng, lat];

  const triageResult = runTriage(triage || {});
  const incident = new Incident({
    reporter: user._id,
    type,
    severity: triageResult.severity,
    address: address || '',
    description: description || '',
    location: toPoint(lat, lng),
    triage: triage || {},
    timeline: [{ at: new Date(), event: 'SOS raised' }],
  });

  // 1. Nearby verified responders
  const responders = await findNearbyResponders(coords, env.responderRadiusKm, user._id);
  for (const { doc, distanceKm } of responders) {
    incident.responders.push({
      user: doc._id as Types.ObjectId,
      status: 'notified',
      distanceKm: Number(distanceKm.toFixed(2)),
      etaMinutes: etaMinutes(distanceKm),
      notifiedAt: new Date(),
    });
  }
  if (responders.length) addTimeline(incident, `${responders.length} nearby responders alerted`);

  // 2. Hospital with the right capability
  const hospitals = await findNearbyHospitals(coords, {
    trauma: type === 'road_accident' || type === 'bleeding',
  });
  if (hospitals[0]) {
    incident.hospital = hospitals[0].doc._id as Types.ObjectId;
    addTimeline(incident, `Nearest suitable hospital: ${hospitals[0].doc.name}`);
  }

  // 3. Auto-dispatch an ambulance for high / critical severity (simulated dispatch)
  let ambulanceEta: number | null = null;
  if (severityRank[triageResult.severity] >= severityRank.high) {
    const nearest = await findNearestAmbulance(coords);
    if (nearest) {
      nearest.doc.status = 'dispatched';
      nearest.doc.currentIncident = incident._id as Types.ObjectId;
      await nearest.doc.save();
      incident.ambulance = nearest.doc._id as Types.ObjectId;
      ambulanceEta = etaMinutes(nearest.distanceKm);
      addTimeline(incident, `Ambulance ${nearest.doc.vehicleNumber} dispatched (ETA ${ambulanceEta} min)`);
    }
  }

  await incident.save();

  // 4. Real-time alerts (after save so ids are valid)
  await Promise.all(
    responders.map(({ doc, distanceKm }) =>
      notifyUser({
        userId: doc.id,
        type: 'incident',
        title: `Emergency ${distanceKm.toFixed(1)} km away`,
        body: `${type.replace('_', ' ')} - severity ${triageResult.severity}`,
        event: 'incident:new',
        data: {
          incidentId: incident.id,
          type,
          severity: triageResult.severity,
          distanceKm: Number(distanceKm.toFixed(2)),
          etaMinutes: etaMinutes(distanceKm),
          lat,
          lng,
        },
      })
    )
  );

  emitPublic('stats:ping', { event: 'incident_created' });
  const populated = await incident.populate(POPULATE);

  res.status(201).json({
    success: true,
    incident: populated,
    triage: triageResult,
    notifiedResponders: responders.length,
    ambulanceEtaMinutes: ambulanceEta,
    emergencyNumbers: { national: env.emergencyNumber, ambulance: env.ambulanceNumber },
    disclaimer: 'GoldenHour supports emergency services. It does not replace them. Call 112 / 108 first.',
  });
});

/** GET /api/incidents/mine */
export const myIncidents = asyncHandler(async (req: AuthRequest, res) => {
  const items = await Incident.find({ reporter: req.user!._id }).sort({ createdAt: -1 }).limit(30);
  res.json({ success: true, items });
});

/** GET /api/incidents/nearby - open incidents for responders (within radius of their location). */
export const nearbyIncidents = asyncHandler(async (req: AuthRequest, res) => {
  const user = req.user!;
  if (!user.location) throw ApiError.badRequest('Update your location first');
  const coords = user.location.coordinates;

  const items = await Incident.find({
    status: { $in: ['open', 'responder_assigned'] },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: coords },
        $maxDistance: env.responderRadiusKm * 2 * 1000,
      },
    },
  })
    .limit(20)
    .select('type severity status location address createdAt');

  res.json({ success: true, items });
});

/** GET /api/incidents/active - incidents where the current user is a responder. */
export const myActiveResponses = asyncHandler(async (req: AuthRequest, res) => {
  const items = await Incident.find({
    status: { $in: ['open', 'responder_assigned', 'on_scene'] },
    'responders.user': req.user!._id,
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate(POPULATE);
  res.json({ success: true, items });
});

/** GET /api/incidents/:id - reporter, assigned responders, or admin. */
export const getIncident = asyncHandler(async (req: AuthRequest, res) => {
  const incident = await Incident.findById(req.params.id).populate(POPULATE);
  if (!incident) throw ApiError.notFound('Incident not found');

  const uid = String(req.user!._id);
  const reporterId = String((incident.reporter as unknown as { _id: Types.ObjectId })._id);
  const isReporter = reporterId === uid;
  const isResponder = incident.responders.some(
    (r) => String((r.user as unknown as { _id: Types.ObjectId })._id) === uid
  );
  if (!isReporter && !isResponder && req.user!.role !== 'admin') throw ApiError.forbidden();

  res.json({ success: true, incident });
});

/** POST /api/incidents/:id/accept */
export const acceptIncident = asyncHandler(async (req: AuthRequest, res) => {
  const incident = await Incident.findById(req.params.id);
  if (!incident) throw ApiError.notFound('Incident not found');
  if (['resolved', 'cancelled'].includes(incident.status)) {
    throw ApiError.conflict('This incident is already closed');
  }

  const entry = incident.responders.find((r) => String(r.user) === String(req.user!._id));
  if (!entry) throw ApiError.forbidden('You were not alerted for this incident');
  if (entry.status === 'accepted') throw ApiError.conflict('Already accepted');

  entry.status = 'accepted';
  entry.respondedAt = new Date();

  if (incident.status === 'open') {
    incident.status = 'responder_assigned';
    incident.firstResponseSec = Math.round((Date.now() - incident.createdAt.getTime()) / 1000);
  }
  addTimeline(incident, `${req.user!.name} is on the way (ETA ${entry.etaMinutes} min)`);
  await incident.save();

  await notifyUser({
    userId: incident.reporter,
    type: 'incident',
    title: 'A responder is on the way',
    body: `${req.user!.name} - about ${entry.etaMinutes} min away`,
    data: { incidentId: incident.id, etaMinutes: entry.etaMinutes },
  });
  broadcastUpdate(incident);
  res.json({ success: true, incident });
});

/** POST /api/incidents/:id/decline */
export const declineIncident = asyncHandler(async (req: AuthRequest, res) => {
  const incident = await Incident.findById(req.params.id);
  if (!incident) throw ApiError.notFound('Incident not found');
  const entry = incident.responders.find((r) => String(r.user) === String(req.user!._id));
  if (!entry) throw ApiError.forbidden('You were not alerted for this incident');
  entry.status = 'declined';
  entry.respondedAt = new Date();
  await incident.save();
  res.json({ success: true });
});

/** POST /api/incidents/:id/arrive */
export const arriveAtIncident = asyncHandler(async (req: AuthRequest, res) => {
  const incident = await Incident.findById(req.params.id);
  if (!incident) throw ApiError.notFound('Incident not found');
  const entry = incident.responders.find((r) => String(r.user) === String(req.user!._id));
  if (!entry || entry.status !== 'accepted') throw ApiError.forbidden('Accept the incident first');

  entry.status = 'arrived';
  entry.arrivedAt = new Date();
  incident.status = 'on_scene';
  addTimeline(incident, `${req.user!.name} arrived on scene`);
  await incident.save();

  await notifyUser({
    userId: incident.reporter,
    type: 'incident',
    title: 'Responder has arrived',
    body: req.user!.name,
    data: { incidentId: incident.id },
  });
  broadcastUpdate(incident);
  res.json({ success: true, incident });
});

/** POST /api/incidents/:id/resolve - reporter, responder on the incident, or admin. */
export const resolveIncident = asyncHandler(async (req: AuthRequest, res) => {
  const incident = await Incident.findById(req.params.id);
  if (!incident) throw ApiError.notFound('Incident not found');

  const uid = String(req.user!._id);
  const allowed =
    String(incident.reporter) === uid ||
    incident.responders.some((r) => String(r.user) === uid) ||
    req.user!.role === 'admin';
  if (!allowed) throw ApiError.forbidden();

  incident.status = 'resolved';
  incident.resolvedAt = new Date();
  addTimeline(incident, 'Incident resolved');
  await incident.save();

  // Free the ambulance and credit responders who arrived
  if (incident.ambulance) {
    await Ambulance.updateOne({ _id: incident.ambulance }, { status: 'available', $unset: { currentIncident: 1 } });
  }
  const arrivedIds = incident.responders.filter((r) => r.status === 'arrived').map((r) => r.user);
  if (arrivedIds.length) {
    await User.updateMany({ _id: { $in: arrivedIds } }, { $inc: { 'responderProfile.incidentsHandled': 1 } });
  }

  broadcastUpdate(incident);
  emitPublic('stats:ping', { event: 'incident_resolved' });
  res.json({ success: true, incident });
});

/** POST /api/incidents/:id/cancel - only the reporter (e.g. false alarm / safe now). */
export const cancelIncident = asyncHandler(async (req: AuthRequest, res) => {
  const incident = await Incident.findById(req.params.id);
  if (!incident) throw ApiError.notFound('Incident not found');
  if (String(incident.reporter) !== String(req.user!._id)) throw ApiError.forbidden();
  if (['resolved', 'cancelled'].includes(incident.status)) throw ApiError.conflict('Already closed');

  incident.status = 'cancelled';
  addTimeline(incident, 'Cancelled by reporter');
  await incident.save();

  if (incident.ambulance) {
    await Ambulance.updateOne({ _id: incident.ambulance }, { status: 'available', $unset: { currentIncident: 1 } });
  }
  broadcastUpdate(incident);
  res.json({ success: true });
});

/** Distance helper exposed for the responder UI. */
export const distanceToIncident = asyncHandler(async (req: AuthRequest, res) => {
  const incident = await Incident.findById(req.params.id).select('location');
  if (!incident) throw ApiError.notFound('Incident not found');
  const me = req.user!.location;
  if (!me) throw ApiError.badRequest('Update your location first');
  const km = haversineKm(me.coordinates, incident.location.coordinates);
  res.json({ success: true, distanceKm: Number(km.toFixed(2)), etaMinutes: etaMinutes(km) });
});

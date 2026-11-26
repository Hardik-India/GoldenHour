import { Types } from 'mongoose';
import { env } from '../config/env';
import { BloodRequest } from '../models/BloodRequest';
import { Hospital } from '../models/Hospital';
import { User } from '../models/User';
import { AuthRequest } from '../types/express';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { LngLat, toPoint } from '../utils/geo';
import { isRareGroup } from '../utils/bloodCompat';
import { findEligibleDonors } from '../services/matching.service';
import { notifyUser } from '../services/notification.service';
import { emitPublic } from '../sockets';

/** POST /api/blood-requests */
export const createBloodRequest = asyncHandler(async (req: AuthRequest, res) => {
  const b = req.body;
  const coords: LngLat = [b.lng, b.lat];

  if (b.hospitalId) {
    const exists = await Hospital.exists({ _id: b.hospitalId });
    if (!exists) throw ApiError.badRequest('Hospital not found');
  }

  const hours = b.neededByHours || (b.urgency === 'critical' ? 6 : b.urgency === 'urgent' ? 24 : 72);
  const request = new BloodRequest({
    requester: req.user!._id,
    hospital: b.hospitalId,
    patientName: b.patientName,
    bloodGroup: b.bloodGroup,
    unitsNeeded: b.unitsNeeded,
    urgency: b.urgency,
    contactPhone: b.contactPhone,
    note: b.note || '',
    location: toPoint(b.lat, b.lng),
    neededBy: new Date(Date.now() + hours * 3600 * 1000),
    expiresAt: new Date(Date.now() + hours * 3600 * 1000),
  });

  // Rare groups search a much wider radius
  const radius = isRareGroup(b.bloodGroup) ? env.donorRadiusKm * 3 : env.donorRadiusKm;
  const donors = await findEligibleDonors(coords, b.bloodGroup, radius, req.user!._id);

  for (const { doc, distanceKm } of donors) {
    request.matches.push({
      donor: doc._id as Types.ObjectId,
      status: 'notified',
      distanceKm: Number(distanceKm.toFixed(2)),
      notifiedAt: new Date(),
    });
  }
  await request.save();

  await Promise.all(
    donors.map(({ doc, distanceKm }) =>
      notifyUser({
        userId: doc.id,
        type: 'blood',
        title: `${b.bloodGroup} blood needed ${distanceKm.toFixed(1)} km away`,
        body: `${b.unitsNeeded} unit(s) - ${b.urgency}`,
        event: 'blood:new',
        data: {
          requestId: request.id,
          bloodGroup: b.bloodGroup,
          units: b.unitsNeeded,
          urgency: b.urgency,
          distanceKm: Number(distanceKm.toFixed(2)),
        },
      })
    )
  );

  emitPublic('stats:ping', { event: 'blood_request_created' });
  res.status(201).json({
    success: true,
    request,
    donorsNotified: donors.length,
    message: donors.length
      ? `${donors.length} eligible donor(s) nearby have been alerted.`
      : 'No eligible donors found nearby yet. Try the hospital blood bank and the e-RaktKosh portal.',
  });
});

/** GET /api/blood-requests/open?lat&lng - open requests near a point (for donors). */
export const openRequests = asyncHandler(async (req: AuthRequest, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const filter: Record<string, unknown> = {
    status: { $in: ['open', 'partially_fulfilled'] },
    expiresAt: { $gt: new Date() },
  };
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    filter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: env.donorRadiusKm * 3 * 1000,
      },
    };
  }
  const items = await BloodRequest.find(filter)
    .limit(30)
    .select('-matches')
    .populate('hospital', 'name address phone');
  res.json({ success: true, items });
});

/** GET /api/blood-requests/mine */
export const myRequests = asyncHandler(async (req: AuthRequest, res) => {
  const items = await BloodRequest.find({ requester: req.user!._id })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('matches.donor', 'name phone donorProfile.bloodGroup');
  res.json({ success: true, items });
});

/** GET /api/blood-requests/alerts - requests where the donor was matched. */
export const myDonorAlerts = asyncHandler(async (req: AuthRequest, res) => {
  const items = await BloodRequest.find({
    'matches.donor': req.user!._id,
    status: { $in: ['open', 'partially_fulfilled'] },
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('-matches')
    .populate('hospital', 'name address phone');
  res.json({ success: true, items });
});

/** POST /api/blood-requests/:id/respond - donor accepts or declines. */
export const respondToRequest = asyncHandler(async (req: AuthRequest, res) => {
  const request = await BloodRequest.findById(req.params.id);
  if (!request) throw ApiError.notFound('Request not found');
  if (!['open', 'partially_fulfilled'].includes(request.status)) {
    throw ApiError.conflict('This request is no longer open');
  }
  const match = request.matches.find((m) => String(m.donor) === String(req.user!._id));
  if (!match) throw ApiError.forbidden('You were not matched to this request');

  match.status = req.body.response;
  match.respondedAt = new Date();
  await request.save();

  if (req.body.response === 'accepted') {
    await notifyUser({
      userId: request.requester,
      type: 'blood',
      title: 'A donor accepted your request',
      body: `${req.user!.name} (${req.user!.phone}) is ready to donate ${request.bloodGroup}`,
      data: { requestId: request.id, donorId: req.user!.id },
    });
  }
  res.json({ success: true, request });
});

/** POST /api/blood-requests/:id/donated - requester (or hospital/admin) confirms a donation. */
export const markDonated = asyncHandler(async (req: AuthRequest, res) => {
  const request = await BloodRequest.findById(req.params.id);
  if (!request) throw ApiError.notFound('Request not found');

  const isOwner = String(request.requester) === String(req.user!._id);
  if (!isOwner && !['hospital', 'admin'].includes(req.user!.role)) throw ApiError.forbidden();

  const match = request.matches.find((m) => String(m.donor) === req.body.donorId);
  if (!match || match.status === 'donated') throw ApiError.badRequest('No matching pending donor');

  match.status = 'donated';
  request.unitsFulfilled += req.body.units;
  request.status = request.unitsFulfilled >= request.unitsNeeded ? 'fulfilled' : 'partially_fulfilled';
  await request.save();

  await User.updateOne(
    { _id: req.body.donorId },
    { 'donorProfile.lastDonationAt': new Date(), $inc: { 'donorProfile.donationsCount': 1 } }
  );
  emitPublic('stats:ping', { event: 'blood_donated' });
  res.json({ success: true, request });
});

/** POST /api/blood-requests/:id/cancel */
export const cancelRequest = asyncHandler(async (req: AuthRequest, res) => {
  const request = await BloodRequest.findById(req.params.id);
  if (!request) throw ApiError.notFound('Request not found');
  if (String(request.requester) !== String(req.user!._id) && req.user!.role !== 'admin') {
    throw ApiError.forbidden();
  }
  request.status = 'cancelled';
  await request.save();
  res.json({ success: true });
});

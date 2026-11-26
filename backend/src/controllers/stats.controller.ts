import { Incident } from '../models/Incident';
import { BloodRequest } from '../models/BloodRequest';
import { User } from '../models/User';
import { Ambulance } from '../models/Ambulance';
import { Hospital } from '../models/Hospital';
import { asyncHandler } from '../utils/asyncHandler';

/** GET /api/stats/impact - public numbers for the landing page and impact dashboard. */
export const impactStats = asyncHandler(async (_req, res) => {
  const [incidentAgg, bloodAgg, responders, donors, ambulances, hospitals, byType, last7] =
    await Promise.all([
      Incident.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
            avgFirstResponseSec: { $avg: '$firstResponseSec' },
          },
        },
      ]),
      BloodRequest.aggregate([
        {
          $group: {
            _id: null,
            requests: { $sum: 1 },
            unitsFulfilled: { $sum: '$unitsFulfilled' },
            fulfilled: { $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] } },
          },
        },
      ]),
      User.countDocuments({ 'responderProfile.isResponder': true, 'responderProfile.verified': true }),
      User.countDocuments({ 'donorProfile.isDonor': true }),
      Ambulance.countDocuments({ status: { $ne: 'offline' } }),
      Hospital.countDocuments(),
      Incident.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Incident.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

  const inc = incidentAgg[0] || { total: 0, resolved: 0, avgFirstResponseSec: null };
  const blood = bloodAgg[0] || { requests: 0, unitsFulfilled: 0, fulfilled: 0 };

  res.json({
    success: true,
    stats: {
      incidents: { total: inc.total, resolved: inc.resolved },
      avgFirstResponseSec: inc.avgFirstResponseSec ? Math.round(inc.avgFirstResponseSec) : null,
      blood: {
        requests: blood.requests,
        fulfilled: blood.fulfilled,
        unitsFulfilled: blood.unitsFulfilled,
      },
      network: { responders, donors, ambulances, hospitals },
      incidentsByType: byType.map((t) => ({ type: t._id, count: t.count })),
      incidentsLast7Days: last7.map((d) => ({ date: d._id, count: d.count })),
    },
  });
});

/** GET /api/stats/hotspots - anonymised incident density on a ~1.1 km grid. */
export const hotspots = asyncHandler(async (_req, res) => {
  const cells = await Incident.aggregate([
    {
      $group: {
        _id: {
          lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 2] },
          lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 2] },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 100 },
  ]);
  res.json({
    success: true,
    items: cells.map((c) => ({ lat: c._id.lat, lng: c._id.lng, count: c.count })),
  });
});

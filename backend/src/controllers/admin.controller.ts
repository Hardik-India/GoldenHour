import { Report } from '../models/Report';
import { User } from '../models/User';
import { Incident } from '../models/Incident';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { notifyUser } from '../services/notification.service';

/** GET /api/admin/responders?status=pending|verified */
export const listResponders = asyncHandler(async (req, res) => {
  const verified = req.query.status === 'verified';
  const items = await User.find({
    'responderProfile.isResponder': true,
    'responderProfile.verified': verified,
  })
    .sort({ 'responderProfile.appliedAt': -1 })
    .limit(100)
    .select('name email phone responderProfile createdAt');
  res.json({ success: true, items });
});

/** PATCH /api/admin/responders/:id/verify */
export const verifyResponder = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || !user.responderProfile.isResponder) throw ApiError.notFound('Responder not found');

  user.responderProfile.verified = true;
  user.responderProfile.verifiedAt = new Date();
  await user.save();

  await notifyUser({
    userId: user.id,
    type: 'system',
    title: 'You are now a verified GoldenHour responder',
    body: 'Switch on availability to start receiving nearby emergency alerts.',
  });
  res.json({ success: true });
});

/** PATCH /api/admin/responders/:id/revoke */
export const revokeResponder = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  user.responderProfile.verified = false;
  user.responderProfile.available = false;
  await user.save();
  res.json({ success: true });
});

export const listReports = asyncHandler(async (_req, res) => {
  const items = await Report.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('reporter', 'name email')
    .populate('targetUser', 'name email');
  res.json({ success: true, items });
});

export const updateReport = asyncHandler(async (req, res) => {
  const status = req.body?.status;
  if (!['reviewed', 'dismissed'].includes(status)) throw ApiError.badRequest('Invalid status');
  await Report.updateOne({ _id: req.params.id }, { status });
  res.json({ success: true });
});

export const liveIncidents = asyncHandler(async (_req, res) => {
  const items = await Incident.find({ status: { $in: ['open', 'responder_assigned', 'on_scene'] } })
    .sort({ createdAt: -1 })
    .limit(50)
    .select('type severity status location address createdAt responders');
  res.json({ success: true, items });
});

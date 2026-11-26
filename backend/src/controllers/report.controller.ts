import { Report } from '../models/Report';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../utils/asyncHandler';

/** POST /api/reports - flag false alarms, abuse or unsafe behaviour. */
export const createReport = asyncHandler(async (req: AuthRequest, res) => {
  const { reason, details, targetUserId, incidentId, bloodRequestId } = req.body;
  const report = await Report.create({
    reporter: req.user!._id,
    reason,
    details: details || '',
    targetUser: targetUserId,
    incident: incidentId,
    bloodRequest: bloodRequestId,
  });
  res.status(201).json({ success: true, report });
});

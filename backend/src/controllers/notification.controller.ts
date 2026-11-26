import { Notification } from '../models/Notification';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../utils/asyncHandler';

export const listNotifications = asyncHandler(async (req: AuthRequest, res) => {
  const items = await Notification.find({ user: req.user!._id }).sort({ createdAt: -1 }).limit(50);
  const unread = items.filter((n) => !n.readAt).length;
  res.json({ success: true, items, unread });
});

export const markAllRead = asyncHandler(async (req: AuthRequest, res) => {
  await Notification.updateMany({ user: req.user!._id, readAt: { $exists: false } }, { readAt: new Date() });
  res.json({ success: true });
});

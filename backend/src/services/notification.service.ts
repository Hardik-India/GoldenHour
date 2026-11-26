import { Types } from 'mongoose';
import { Notification } from '../models/Notification';
import { emitToUser } from '../sockets';

interface NotifyArgs {
  userId: Types.ObjectId | string;
  type: 'incident' | 'blood' | 'system';
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  /** Socket event name to push in real time (defaults to "notification"). */
  event?: string;
}

/** Stores a notification and pushes it live over sockets. */
export async function notifyUser({ userId, type, title, body = '', data = {}, event }: NotifyArgs) {
  const doc = await Notification.create({ user: userId, type, title, body, data });
  emitToUser(String(userId), event || 'notification', {
    id: doc.id,
    type,
    title,
    body,
    data,
    createdAt: doc.createdAt,
  });
  return doc;
}

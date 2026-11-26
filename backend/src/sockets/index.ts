import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User';
import { toPoint } from '../utils/geo';
import { logger } from '../utils/logger';

let io: Server | null = null;

/**
 * Rooms:
 *  - user:<id>       private events for one user (alerts, notifications)
 *  - incident:<id>   everyone following one incident (reporter, responders, ambulance)
 *  - public:stats    anonymous landing-page live counters
 */
export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      // Anonymous sockets may only listen to public rooms.
      socket.data.userId = null;
      return next();
    }
    try {
      const payload = verifyToken(token);
      socket.data.userId = payload.id;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId: string | null = socket.data.userId;
    if (userId) socket.join(`user:${userId}`);
    socket.join('public:stats');

    socket.on('incident:join', (incidentId: string) => {
      if (userId && typeof incidentId === 'string') socket.join(`incident:${incidentId}`);
    });

    socket.on('incident:leave', (incidentId: string) => {
      if (typeof incidentId === 'string') socket.leave(`incident:${incidentId}`);
    });

    // Responders stream their live position while heading to an incident.
    socket.on(
      'responder:location',
      async (payload: { incidentId?: string; lat?: number; lng?: number }) => {
        if (!userId) return;
        const { incidentId, lat, lng } = payload || {};
        if (typeof lat !== 'number' || typeof lng !== 'number') return;
        try {
          await User.updateOne(
            { _id: userId },
            { location: toPoint(lat, lng), locationUpdatedAt: new Date() }
          );
          if (incidentId) {
            io?.to(`incident:${incidentId}`).emit('responder:location', {
              userId,
              lat,
              lng,
              at: new Date().toISOString(),
            });
          }
        } catch (err) {
          logger.warn('responder:location failed', err);
        }
      }
    );
  });

  return io;
}

export const getIO = (): Server | null => io;

export function emitToUser(userId: string, event: string, payload: unknown): void {
  io?.to(`user:${userId}`).emit(event, payload);
}

export function emitToIncident(incidentId: string, event: string, payload: unknown): void {
  io?.to(`incident:${incidentId}`).emit(event, payload);
}

export function emitPublic(event: string, payload: unknown): void {
  io?.to('public:stats').emit(event, payload);
}

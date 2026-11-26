import { NextFunction, Response } from 'express';
import { User, UserRole } from '../models/User';
import { AuthRequest } from '../types/express';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/jwt';
import { asyncHandler } from '../utils/asyncHandler';

/** Requires a valid Bearer token. Attaches `req.user`. */
export const protect = asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(payload.id);
  if (!user || !user.isActive) throw ApiError.unauthorized('Account not found or disabled');

  req.user = user;
  next();
});

/** Restricts a route to specific roles. Use after `protect`. */
export const authorize =
  (...roles: UserRole[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };

/** Only verified responders (or admins) may continue. */
export const requireVerifiedResponder = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const u = req.user;
  if (!u) return next(ApiError.unauthorized());
  if (u.role === 'admin') return next();
  if (!u.responderProfile?.isResponder || !u.responderProfile.verified) {
    return next(ApiError.forbidden('Only verified responders can do this'));
  }
  next();
};

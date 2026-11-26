import { NextFunction, RequestHandler, Response } from 'express';
import { AuthRequest } from '../types/express';

type AsyncFn = (req: AuthRequest, res: Response, next: NextFunction) => Promise<unknown>;

/** Wraps async controllers so rejected promises reach the error middleware. */
export const asyncHandler =
  (fn: AsyncFn): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req as AuthRequest, res, next)).catch(next);
  };

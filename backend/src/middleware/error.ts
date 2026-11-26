import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  const anyErr = err as { code?: number; name?: string; message?: string };
  if (anyErr?.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate value already exists' });
  }
  if (anyErr?.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid id' });
  }

  logger.error(err);
  res.status(500).json({
    success: false,
    message: env.isProd ? 'Something went wrong' : anyErr?.message || 'Server error',
  });
};

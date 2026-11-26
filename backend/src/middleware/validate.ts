import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';

/** Validates and replaces req.body with the parsed (typed, stripped) data. */
export const validateBody =
  (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };

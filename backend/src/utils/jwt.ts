import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  id: string;
  role: string;
}

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as SignOptions);

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, env.jwtSecret) as JwtPayload;

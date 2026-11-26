import { Request } from 'express';
import { IUser } from '../models/User';

/** Request after the `protect` middleware has attached the user. */
export interface AuthRequest extends Request {
  user?: IUser;
}

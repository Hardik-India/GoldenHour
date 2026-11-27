import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/error';
import { apiLimiter } from './middleware/rateLimit';
import routes from './routes';

const normalizeOrigin = (url: string) => url.trim().replace(/\/+$/, '');

const allowedOrigins = new Set(
  [env.clientUrl, 'http://localhost:3000']
    .flatMap((v) => (v ? v.split(',') : []))
    .map(normalizeOrigin)
    .filter(Boolean)
);

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = normalizeOrigin(origin);
        if (allowedOrigins.has(cleanOrigin) || cleanOrigin.endsWith('.vercel.app')) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  if (!env.isProd) app.use(morgan('dev'));

  app.use('/api', apiLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
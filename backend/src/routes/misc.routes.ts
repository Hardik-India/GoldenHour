import { Router } from 'express';
import { listGuides, getGuide } from '../controllers/firstAid.controller';
import { triage } from '../controllers/triage.controller';
import { impactStats, hotspots } from '../controllers/stats.controller';
import { listNotifications, markAllRead } from '../controllers/notification.controller';
import { createReport } from '../controllers/report.controller';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { reportSchema, triageSchema } from '../validators/schemas';

export const firstAidRouter = Router();
firstAidRouter.get('/', listGuides);
firstAidRouter.get('/:slug', getGuide);

export const triageRouter = Router();
triageRouter.post('/', validateBody(triageSchema), triage);

export const statsRouter = Router();
statsRouter.get('/impact', impactStats);
statsRouter.get('/hotspots', hotspots);

export const notificationRouter = Router();
notificationRouter.use(protect);
notificationRouter.get('/', listNotifications);
notificationRouter.post('/read-all', markAllRead);

export const reportRouter = Router();
reportRouter.post('/', protect, validateBody(reportSchema), createReport);

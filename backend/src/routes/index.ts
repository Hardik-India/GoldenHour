import { Router } from 'express';
import authRoutes from './auth.routes';
import incidentRoutes from './incident.routes';
import bloodRoutes from './blood.routes';
import hospitalRoutes from './hospital.routes';
import ambulanceRoutes from './ambulance.routes';
import adminRoutes from './admin.routes';
import {
  firstAidRouter,
  notificationRouter,
  reportRouter,
  statsRouter,
  triageRouter,
} from './misc.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, service: 'goldenhour-api', time: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/incidents', incidentRoutes);
router.use('/blood-requests', bloodRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/ambulances', ambulanceRoutes);
router.use('/first-aid', firstAidRouter);
router.use('/triage', triageRouter);
router.use('/stats', statsRouter);
router.use('/notifications', notificationRouter);
router.use('/reports', reportRouter);
router.use('/admin', adminRoutes);

export default router;

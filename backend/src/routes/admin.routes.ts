import { Router } from 'express';
import * as c from '../controllers/admin.controller';
import { authorize, protect } from '../middleware/auth';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/responders', c.listResponders);
router.patch('/responders/:id/verify', c.verifyResponder);
router.patch('/responders/:id/revoke', c.revokeResponder);
router.get('/reports', c.listReports);
router.patch('/reports/:id', c.updateReport);
router.get('/live-incidents', c.liveIncidents);

export default router;

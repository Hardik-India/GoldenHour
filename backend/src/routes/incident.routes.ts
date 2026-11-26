import { Router } from 'express';
import * as c from '../controllers/incident.controller';
import { protect, requireVerifiedResponder } from '../middleware/auth';
import { sosLimiter } from '../middleware/rateLimit';
import { validateBody } from '../middleware/validate';
import { createIncidentSchema } from '../validators/schemas';

const router = Router();
router.use(protect);

router.post('/', sosLimiter, validateBody(createIncidentSchema), c.createIncident);
router.get('/mine', c.myIncidents);
router.get('/nearby', requireVerifiedResponder, c.nearbyIncidents);
router.get('/active', requireVerifiedResponder, c.myActiveResponses);
router.get('/:id', c.getIncident);
router.get('/:id/distance', requireVerifiedResponder, c.distanceToIncident);
router.post('/:id/accept', requireVerifiedResponder, c.acceptIncident);
router.post('/:id/decline', requireVerifiedResponder, c.declineIncident);
router.post('/:id/arrive', requireVerifiedResponder, c.arriveAtIncident);
router.post('/:id/resolve', c.resolveIncident);
router.post('/:id/cancel', c.cancelIncident);

export default router;

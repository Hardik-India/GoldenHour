import { Router } from 'express';
import * as c from '../controllers/blood.controller';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  createBloodRequestSchema,
  donorRespondSchema,
  markDonatedSchema,
} from '../validators/schemas';

const router = Router();
router.use(protect);

router.post('/', validateBody(createBloodRequestSchema), c.createBloodRequest);
router.get('/open', c.openRequests);
router.get('/mine', c.myRequests);
router.get('/alerts', c.myDonorAlerts);
router.post('/:id/respond', validateBody(donorRespondSchema), c.respondToRequest);
router.post('/:id/donated', validateBody(markDonatedSchema), c.markDonated);
router.post('/:id/cancel', c.cancelRequest);

export default router;

import { Router } from 'express';
import * as c from '../controllers/ambulance.controller';
import { authorize, protect } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { ambulanceStatusSchema } from '../validators/schemas';

const router = Router();

router.get('/nearby', c.nearbyAmbulances);
router.patch(
  '/:id',
  protect,
  authorize('hospital', 'admin'),
  validateBody(ambulanceStatusSchema),
  c.updateAmbulance
);
router.post('/dispatch/:incidentId', protect, authorize('hospital', 'admin'), c.dispatchToIncident);

export default router;

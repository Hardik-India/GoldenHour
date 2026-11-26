import { Router } from 'express';
import * as c from '../controllers/hospital.controller';
import { authorize, protect } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { bloodStockSchema, createHospitalSchema } from '../validators/schemas';

const router = Router();

router.get('/nearby', c.nearbyHospitals);
router.get('/:id', c.getHospital);
router.patch(
  '/:id/blood-stock',
  protect,
  authorize('hospital', 'admin'),
  validateBody(bloodStockSchema),
  c.updateBloodStock
);
router.post('/', protect, authorize('admin'), validateBody(createHospitalSchema), c.createHospital);

export default router;

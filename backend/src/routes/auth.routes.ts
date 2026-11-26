import { Router } from 'express';
import * as c from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import { validateBody } from '../middleware/validate';
import {
  becomeDonorSchema,
  becomeResponderSchema,
  loginSchema,
  registerSchema,
  updateMeSchema,
} from '../validators/schemas';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), c.register);
router.post('/login', authLimiter, validateBody(loginSchema), c.login);
router.get('/me', protect, c.me);
router.patch('/me', protect, validateBody(updateMeSchema), c.updateMe);
router.post('/become-donor', protect, validateBody(becomeDonorSchema), c.becomeDonor);
router.post('/become-responder', protect, validateBody(becomeResponderSchema), c.becomeResponder);

export default router;

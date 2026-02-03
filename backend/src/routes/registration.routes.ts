import { Router } from 'express';
import { registerForEvent, getMyRegistrations, cancelRegistration } from '../controllers/registration.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, registerForEvent);
router.get('/my-registrations', authenticate, getMyRegistrations);
router.patch('/:id/cancel', authenticate, cancelRegistration);

export default router;

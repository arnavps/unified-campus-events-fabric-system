import { Router } from 'express';
import { getOrganizerStats, getEventStats, getAdminStats } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/organizer', authenticate, getOrganizerStats);
router.get('/events/:id', authenticate, getEventStats);
router.get('/admin', authenticate, getAdminStats);

export default router;

import { Router } from 'express';
import { createAnnouncement, getEventAnnouncements } from '../controllers/announcement.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createAnnouncement);
router.get('/events/:eventId', getEventAnnouncements); // Public read for now (or make protected if needed)

export default router;

import { Router } from 'express';
import { submitFeedback, getEventFeedback } from '../controllers/feedback.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, submitFeedback);
router.get('/events/:eventId', authenticate, getEventFeedback);

export default router;

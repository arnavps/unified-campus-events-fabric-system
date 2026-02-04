import { Router } from 'express';
import { getEvents, getEventById, createEvent, deleteEvent, getMyEvents } from '../controllers/event.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.get('/', getEvents);
router.get('/my-events', authenticate, getMyEvents);
router.get('/:id', getEventById);

router.post('/', authenticate, authorize(['ORGANIZER', 'ADMIN']), createEvent);
router.delete('/:id', authenticate, authorize(['ORGANIZER', 'ADMIN']), deleteEvent);

export default router;

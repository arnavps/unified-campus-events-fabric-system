import { Router } from 'express';
import { markAttendance, getEventAttendance, getMyAttendance } from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/mark', authenticate, markAttendance);
router.get('/events/:eventId', authenticate, getEventAttendance);
router.get('/my-attendance', authenticate, getMyAttendance);

export default router;

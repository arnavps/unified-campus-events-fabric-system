import { Router } from 'express';
import { markAttendance, markUserAttendance, getEventAttendance, getMyAttendance } from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.post('/mark', authenticate, markAttendance);
router.post('/mark-user', authenticate, authorize(['ORGANIZER', 'ADMIN']), markUserAttendance);
router.get('/events/:eventId', authenticate, getEventAttendance);
router.get('/my-attendance', authenticate, getMyAttendance);

export default router;

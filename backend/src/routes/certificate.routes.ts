import { Router } from 'express';
import { issueCertificate, downloadCertificate, getMyCertificates, bulkIssueCertificates, getEventCertificates } from '../controllers/certificate.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.post('/issue', authenticate, authorize(['ORGANIZER', 'ADMIN']), issueCertificate);
router.post('/bulk-issue', authenticate, authorize(['ORGANIZER', 'ADMIN']), bulkIssueCertificates);
router.get('/event/:eventId', authenticate, authorize(['ORGANIZER', 'ADMIN']), getEventCertificates);
router.get('/my-certificates', authenticate, getMyCertificates);
router.get('/download/:id', authenticate, downloadCertificate);

export default router;

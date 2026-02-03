import { Router } from 'express';
import { issueCertificate, downloadCertificate, getMyCertificates } from '../controllers/certificate.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/issue', authenticate, issueCertificate);
router.get('/my-certificates', authenticate, getMyCertificates);
router.get('/:id/download', authenticate, downloadCertificate); // Authenticated download for now

export default router;

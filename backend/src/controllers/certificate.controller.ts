import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PdfService } from '../services/pdf.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { sendCertificateIssued } from '../services/email.service';

const prisma = new PrismaClient();

export const issueCertificate = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { eventId, userId } = req.body;

        // Verify Event & Organizer
        const event = await prisma.event.findUnique({ where: { id: eventId }, include: { organizer: true } });
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        if (req.user.role === 'ORGANIZER' && event.organizerId !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Check if user attended
        const attendance = await prisma.attendance.findUnique({
            where: { eventId_userId: { eventId, userId } }
        });

        if (!attendance || (attendance.status !== 'PRESENT' && attendance.status !== 'LATE')) {
            return res.status(400).json({ success: false, message: 'User did not attend event or was absent' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Check if already issued
        const existing = await prisma.certificate.findUnique({
            where: { eventId_userId: { eventId, userId } }
        });

        if (existing) {
            return res.status(200).json({ success: true, message: 'Certificate already issued', data: existing });
        }

        // Generate Certificate Logic
        const certificateId = uuidv4().split('-')[0].toUpperCase();
        const verificationHash = crypto.createHash('sha256').update(certificateId + userId + eventId).digest('hex');

        const certificate = await prisma.certificate.create({
            data: {
                certificateNumber: certificateId,
                eventId,
                userId,
                title: `Certificate of Participation - ${event.title}`,
                verificationHash,
                status: 'ISSUED',
                issuedAt: new Date()
            }
        });

        // Send Email
        if (user.email) {
            sendCertificateIssued(user.email, user.firstName, event.title, certificateId).catch((err) => console.error('Email failed:', err));
        }

        res.json({ success: true, data: certificate });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to verify certificate' });
    }
};

// Bulk issue certificates for all attendees of an event
export const bulkIssueCertificates = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { eventId } = req.body;

        // Verify Event & Organizer
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { organizer: true }
        });

        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        if (req.user.role === 'ORGANIZER' && event.organizerId !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Get all attendees with PRESENT or LATE status
        const attendees = await prisma.attendance.findMany({
            where: {
                eventId,
                status: { in: ['PRESENT', 'LATE'] }
            },
            include: {
                user: true
            }
        });

        if (attendees.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No attendees found with PRESENT or LATE status'
            });
        }

        const results = {
            issued: 0,
            alreadyIssued: 0,
            failed: 0,
            errors: [] as string[]
        };

        // Issue certificates for each attendee
        for (const attendance of attendees) {
            try {
                // Check if already issued
                const existing = await prisma.certificate.findUnique({
                    where: { eventId_userId: { eventId, userId: attendance.userId } }
                });

                if (existing) {
                    results.alreadyIssued++;
                    continue;
                }

                // Generate Certificate
                const certificateId = uuidv4().split('-')[0].toUpperCase();
                const verificationHash = crypto.createHash('sha256')
                    .update(certificateId + attendance.userId + eventId)
                    .digest('hex');

                await prisma.certificate.create({
                    data: {
                        certificateNumber: certificateId,
                        eventId,
                        userId: attendance.userId,
                        title: `Certificate of Participation - ${event.title}`,
                        verificationHash,
                        status: 'ISSUED',
                        issuedAt: new Date()
                    }
                });

                // Send Email
                if (attendance.user.email) {
                    sendCertificateIssued(
                        attendance.user.email,
                        attendance.user.firstName,
                        event.title,
                        certificateId
                    ).catch((err) => console.error('Email failed:', err));
                }

                results.issued++;
            } catch (error: any) {
                results.failed++;
                results.errors.push(`Failed for user ${attendance.userId}: ${error.message}`);
            }
        }

        res.json({
            success: true,
            data: results,
            message: `Issued ${results.issued} certificates, ${results.alreadyIssued} already issued, ${results.failed} failed`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to bulk issue certificates' });
    }
};

// Get all certificates for an event
export const getEventCertificates = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const eventId = req.params.eventId as string;

        // Verify Event & Organizer
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        if (req.user.role === 'ORGANIZER' && event.organizerId !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const certificates = await prisma.certificate.findMany({
            where: { eventId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: { issuedAt: 'desc' }
        });

        res.json({ success: true, data: certificates });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch certificates' });
    }
};

export const downloadCertificate = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string') return res.status(400).json({ success: false, message: 'Invalid ID' });

        const cert = await prisma.certificate.findUnique({
            where: { id },
            include: {
                event: { include: { organizer: true } },
                user: true
            }
        });

        if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });

        // Authorization: Only owner or organizer/admin
        if (req.user) {
            const isOwner = cert.userId === req.user.userId;
            // @ts-ignore
            const isOrganizer = cert.event.organizerId === req.user.userId;
            const isAdmin = req.user.role === 'ADMIN';

            if (!isOwner && !isOrganizer && !isAdmin) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
        }

        const pdfBuffer = await PdfService.generateCertificate({
            recipientName: `${cert.user.firstName} ${cert.user.lastName}`,
            // @ts-ignore
            eventName: cert.event.title,
            // @ts-ignore
            organizerName: `${cert.event.organizer.firstName} ${cert.event.organizer.lastName}`,
            // @ts-ignore
            date: cert.event.endDateTime.toISOString().split('T')[0],
            certificateId: cert.certificateNumber
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate-${cert.certificateNumber}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Download failed' });
    }
};

export const getMyCertificates = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const certificates = await prisma.certificate.findMany({
            where: { userId: req.user.userId },
            include: {
                event: {
                    select: { title: true, startDateTime: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: certificates });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch certificates' });
    }
};

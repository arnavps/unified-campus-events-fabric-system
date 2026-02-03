import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';
import { sendAnnouncementEmail } from '../services/email.service';

const prisma = new PrismaClient();

const announcementSchema = z.object({
    eventId: z.string().min(1),
    title: z.string().min(1),
    message: z.string().min(1),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    sendToRegistered: z.boolean().optional()
});

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { eventId, title, message, priority, sendToRegistered } = announcementSchema.parse(req.body);

        // Permissions: Only Organizer or Admin
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        if (req.user.role !== 'ADMIN' && event.organizerId !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const announcement = await prisma.announcement.create({
            data: {
                eventId,
                title,
                message,
                priority: priority || 'NORMAL',
                sendToRegistered: sendToRegistered || false,
                createdBy: req.user.userId,
                emailSent: false
            }
        });

        // Trigger Emails if requested
        if (sendToRegistered) {
            // Fetch all approved registrants
            const registrations = await prisma.registration.findMany({
                where: { eventId, status: 'APPROVED' },
                include: { user: true }
            });

            // Send emails (async, don't block response)
            // In production, use a queue (BullMQ/RabbitMQ). Here, we just loop (MVP).
            registrations.forEach(async (reg) => {
                try {
                    await sendAnnouncementEmail(reg.user.email, event.title, title, message);
                } catch (e) {
                    console.error(`Failed to send email to ${reg.user.email}`, e);
                }
            });

            // Update status
            await prisma.announcement.update({
                where: { id: announcement.id },
                data: { emailSent: true }
            });
        }

        res.status(201).json({ success: true, data: announcement });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } });
        }
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to create announcement' });
    }
};

export const getEventAnnouncements = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        if (!eventId || typeof eventId !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid event ID' });
        }

        const announcements = await prisma.announcement.findMany({
            where: { eventId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: announcements });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
    }
};

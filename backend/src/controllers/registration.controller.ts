import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendRegistrationConfirmation } from '../services/email.service';

const prisma = new PrismaClient();

const registerSchema = z.object({
    eventId: z.string().min(1)
});

export const registerForEvent = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { eventId } = registerSchema.parse(req.body);
        const userId = req.user.userId;

        // Check if event exists
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Check if already registered
        const existing = await prisma.registration.findFirst({
            where: {
                userId,
                eventId
            }
        });

        if (existing) {
            // Handle cancelled re-registration if needed (Skipping for simple MVP logic, assuming pure create or error)
            // But let's check status just in case
            if (existing.status === 'CANCELLED') {
                const updated = await prisma.registration.update({
                    where: { id: existing.id },
                    data: { status: 'PENDING', registeredAt: new Date() }
                });
                // Send Email
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (user && user.email) {
                    sendRegistrationConfirmation(user.email, user.firstName, event.title).catch((err) => console.error('Email failed:', err));
                }
                return res.status(200).json({ success: true, data: updated, message: 'Registration reactivated' });
            }
            return res.status(400).json({ success: false, message: 'Already registered for this event' });
        }

        // Check capacity
        if (event.maxParticipants) {
            const count = await prisma.registration.count({ where: { eventId } });
            if (count >= event.maxParticipants) {
                return res.status(400).json({ success: false, message: 'Event is full' });
            }
        }

        const registration = await prisma.registration.create({
            data: {
                userId,
                eventId
            }
        });

        // Send Email
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && user.email) {
            sendRegistrationConfirmation(user.email, user.firstName, event.title).catch((err) => console.error('Email failed:', err));
        }

        res.status(201).json({ success: true, data: registration });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } });
        }
        console.error('Registration Error:', error); // DEBUG LOG
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to register' } });
    }
};

export const getMyRegistrations = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const registrations = await prisma.registration.findMany({
            where: { userId: req.user.userId },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        startDateTime: true,
                        venue: true,
                        organizer: {
                            select: { firstName: true, lastName: true }
                        }
                    }
                }
            },
            orderBy: { registeredAt: 'desc' }
        });

        res.json({ success: true, data: registrations });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch registrations' } });
    }
};

export const cancelRegistration = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { id } = req.params;

        if (typeof id !== 'string') return res.status(400).json({ success: false, message: 'Invalid ID' });

        const registration = await prisma.registration.findUnique({ where: { id } });
        if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

        if (registration.userId !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const updated = await prisma.registration.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to cancel registration' } });
    }
};

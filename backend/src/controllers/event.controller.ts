import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Zod schemas for validation
const createEventSchema = z.object({
    title: z.string().min(1),
    description: z.string(),
    eventType: z.enum(['WORKSHOP', 'HACKATHON', 'SEMINAR', 'WEBINAR', 'CULTURAL_EVENT', 'SPORTS_EVENT', 'CLUB_ACTIVITY', 'COMPETITION', 'CONFERENCE', 'GUEST_LECTURE', 'OTHER']),
    category: z.enum(['TECHNICAL', 'CULTURAL', 'SPORTS', 'SOCIAL', 'ACADEMIC', 'PROFESSIONAL', 'ENTERTAINMENT']),
    startDateTime: z.string().transform(str => new Date(str)),
    endDateTime: z.string().transform(str => new Date(str)),
    venue: z.string(),
    isOnline: z.boolean().optional(),
    maxParticipants: z.number().optional(),

    // Geofencing / Attendance
    attendanceMethod: z.enum(['MANUAL', 'QR_CODE', 'SELF_CHECKIN', 'GEOFENCE', 'HYBRID']).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    geofenceRadius: z.number().optional(),
});

export const getEvents = async (req: Request, res: Response) => {
    try {
        const events = await prisma.event.findMany({
            where: {
                state: { in: ['PUBLISHED', 'LIVE', 'COMPLETED'] } // Publicly visible states
            },
            include: {
                organizer: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { startDateTime: 'asc' }
        });
        res.json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch events' } });
    }
};

export const getEventById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string') return res.status(400).json({ success: false, message: 'Invalid ID' });

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                organizer: {
                    select: { firstName: true, lastName: true, email: true }
                }
            }
        });

        if (!event) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
        }

        res.json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch event' } });
    }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const data = createEventSchema.parse(req.body);

        const event = await prisma.event.create({
            data: {
                ...data,
                organizerId: req.user.userId,
                state: 'PUBLISHED', // Auto-publish for MVP simplicity
                coOrganizers: '', // Required by schema
                attachments: '',
                tags: ''
            }
        });

        res.status(201).json({ success: true, data: event });
    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
        }
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create event' } });
    }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string') return res.status(400).json({ success: false, message: 'Invalid ID' });

        const userId = req.user?.userId;

        const event = await prisma.event.findUnique({ where: { id } });
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        if (event.organizerId !== userId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
        }

        await prisma.event.delete({ where: { id } });
        res.json({ success: true, message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete event' } });
    }
};

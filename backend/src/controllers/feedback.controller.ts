import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

const feedbackSchema = z.object({
    eventId: z.string().min(1),
    overallRating: z.number().min(1).max(5),
    comments: z.string().optional(),
    isAnonymous: z.boolean().optional()
});

export const submitFeedback = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { eventId, overallRating, comments, isAnonymous } = feedbackSchema.parse(req.body);
        const userId = req.user.userId;

        // 1. Verify Attendance
        const attendance = await prisma.attendance.findUnique({
            where: { eventId_userId: { eventId, userId } }
        });

        if (!attendance || (attendance.status !== 'PRESENT' && attendance.status !== 'LATE')) {
            return res.status(403).json({ success: false, message: 'You must attend the event to leave feedback.' });
        }

        // 2. Check if already submitted
        const existing = await prisma.feedback.findFirst({
            where: { eventId, userId }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'You have already submitted feedback for this event.' });
        }

        // 3. Create Feedback
        const feedback = await prisma.feedback.create({
            data: {
                eventId,
                userId,
                overallRating,
                comments,
                isAnonymous: isAnonymous || false
            }
        });

        res.status(201).json({ success: true, data: feedback });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } });
        }
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to submit feedback' });
    }
};

export const getEventFeedback = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId } = req.params;
        if (!eventId || typeof eventId !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid event ID' });
        }

        // Check permissions (Organizer of event or Admin)
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        if (req.user?.role !== 'ADMIN' && event.organizerId !== req.user?.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const feedbacks = await prisma.feedback.findMany({
            where: { eventId },
            include: {
                user: {
                    select: { firstName: true, lastName: true, avatar: true }
                }
            },
            orderBy: { submittedAt: 'desc' }
        });

        // Mask anonymous users
        const sanitized = feedbacks.map(f => ({
            ...f,
            user: f.isAnonymous ? { firstName: 'Anonymous', lastName: '', avatar: null } : f.user
        }));

        // Calculate Average
        const avgRating = feedbacks.reduce((acc, curr) => acc + curr.overallRating, 0) / (feedbacks.length || 1);

        res.json({
            success: true,
            data: {
                feedbacks: sanitized,
                averageRating: Number(avgRating.toFixed(1)),
                totalCount: feedbacks.length
            }
        });

    } catch (error) {
        console.error('Feedback Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch feedback' });
    }
};

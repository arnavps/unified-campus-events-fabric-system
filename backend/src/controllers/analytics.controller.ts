import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getOrganizerStats = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'ORGANIZER') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        const userId = req.user.userId;

        // 1. Total Events Created
        const totalEvents = await prisma.event.count({
            where: { organizerId: userId }
        });

        // 2. Active Events (Published/Live)
        const activeEvents = await prisma.event.count({
            where: {
                organizerId: userId,
                state: { in: ['PUBLISHED', 'LIVE'] }
            }
        });

        // 3. Total Registrations across all events
        const totalRegistrations = await prisma.registration.count({
            where: {
                event: { organizerId: userId }
            }
        });

        // 4. Total Certificates Issued
        const totalCertificates = await prisma.certificate.count({
            where: {
                event: { organizerId: userId }
            }
        });

        res.json({
            success: true,
            data: {
                totalEvents,
                activeEvents,
                totalRegistrations,
                totalCertificates
            }
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
};

export const getEventStats = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!id || typeof id !== 'string') return res.status(400).json({ success: false, message: 'Event ID required' });

        // Security: Check if organizer owns this event
        const event = await prisma.event.findUnique({ where: { id } });
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Allow Owner or Admin
        if (req.user?.role !== 'ADMIN' && event.organizerId !== req.user?.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // 1. Registration Counts
        const totalRegistrations = await prisma.registration.count({ where: { eventId: id } });

        // 2. Attendance Breakdown
        const attendanceGroups = await prisma.attendance.groupBy({
            by: ['status'],
            where: { eventId: id },
            _count: {
                status: true
            }
        });

        // Format for Recharts (e.g., [{ name: 'Present', value: 10 }, ...])
        const attendanceData = attendanceGroups.map(group => ({
            name: group.status,
            value: group._count?.status || 0
        }));

        // Calculate "Not Attended" (Registered - (Present + Late + Absent + Excused))
        // Note: 'Absent' in DB is explicit. Users who just didn't show up might not have a record yet depending on logic.
        // Assuming we mark everyone eventually. If not, we can infer.
        // For now, let's just return what we have.

        res.json({
            success: true,
            data: {
                eventName: event.title,
                totalRegistrations,
                attendanceData
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch event stats' });
    }
};

export const getAdminStats = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const totalUsers = await prisma.user.count();
        const totalEvents = await prisma.event.count();
        const totalRegistrations = await prisma.registration.count();
        const totalCertificates = await prisma.certificate.count();

        // New Users per month (simple aggregation if needed) - skipping for MVP

        res.json({
            success: true,
            data: {
                totalUsers,
                totalEvents,
                totalRegistrations,
                totalCertificates
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
    }
};

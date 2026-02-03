import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

const markAttendanceSchema = z.object({
    userId: z.string().min(1),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).default('PRESENT'),
});

// Helper to calculate distance
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d * 1000; // Distance in meters
}

const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
}

export const markAttendance = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { eventId, status, latitude, longitude } = req.body;

        // Verify Event
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Verify Registration
        const registration = await prisma.registration.findUnique({
            where: { eventId_userId: { eventId, userId: req.user.userId } }
        });

        // Geofence Check
        if (event.attendanceMethod === 'GEOFENCE') {
            if (!latitude || !longitude) {
                return res.status(400).json({ success: false, message: 'Location required for check-in' });
            }
            if (event.latitude != null && event.longitude != null && event.geofenceRadius) {
                const distance = getDistanceFromLatLonInKm(event.latitude, event.longitude, latitude, longitude);
                console.log(`Geofence Check: Dist=${distance}m, Radius=${event.geofenceRadius}m`); // Debug Log
                if (distance > event.geofenceRadius) {
                    return res.status(400).json({
                        success: false,
                        message: `You are too far from the event location. Distance: ${Math.round(distance)}m. Allowed: ${event.geofenceRadius}m.`
                    });
                }
            }
        }

        const attendance = await prisma.attendance.upsert({
            where: { eventId_userId: { eventId, userId: req.user.userId } },
            update: {
                status: status || 'PRESENT',
                checkInTime: new Date(),
                latitude: latitude || null,
                longitude: longitude || null
            },
            create: {
                eventId,
                userId: req.user.userId,
                status: status || 'PRESENT',
                checkInTime: new Date(),
                checkInMethod: event.attendanceMethod,
                latitude: latitude || null,
                longitude: longitude || null
            }
        });

        res.json({ success: true, data: attendance });
    } catch (error) {
        console.error('Mark Attendance Error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark attendance' });
    }
};

export const markUserAttendance = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN')) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        const { eventId, userId, status } = req.body;

        const attendance = await prisma.attendance.upsert({
            where: { eventId_userId: { eventId, userId } },
            update: {
                status: status || 'PRESENT',
                checkInTime: new Date(),
                checkInMethod: 'MANUAL'
            },
            create: {
                eventId,
                userId,
                status: status || 'PRESENT',
                checkInTime: new Date(),
                checkInMethod: 'MANUAL'
            }
        });

        res.json({ success: true, data: attendance });
    } catch (error) {
        console.error('Mark User Attendance Error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark attendance' });
    }
};

export const getEventAttendance = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { eventId } = req.params;
        if (typeof eventId !== 'string') return res.status(400).json({ success: false, message: 'Invalid Event ID' });

        // Verify Access
        if (req.user.role === 'STUDENT') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const attendanceList = await prisma.attendance.findMany({
            where: { eventId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        rollNumber: true
                    }
                }
            }
        });

        res.json({ success: true, data: attendanceList });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch attendance' } });
    }
};

export const getMyAttendance = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const history = await prisma.attendance.findMany({
            where: { userId: req.user.userId },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        startDateTime: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch attendance history' } });
    }
};

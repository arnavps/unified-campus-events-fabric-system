import axios from 'axios';

const API_URL = 'http://localhost:5000/api/attendance';

export const markAttendance = async (eventId: string, status: string, latitude?: number, longitude?: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/mark`, { eventId, status, latitude, longitude }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const markUserAttendance = async (eventId: string, userId: string, status: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/mark-user`, { eventId, userId, status }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getEventAttendance = async (eventId: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
};

export const getMyAttendance = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/my-attendance`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
};

export interface AttendanceRecord {
    id: string;
    eventId: string;
    userId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    checkInTime: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        rollNumber: string | null;
    }
    event?: {
        id: string;
        title: string;
        startDateTime: string;
    }
}

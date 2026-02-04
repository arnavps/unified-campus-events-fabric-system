import axios from 'axios';

const API_URL = 'http://localhost:5000/api/announcements';

export interface Announcement {
    id: string;
    eventId: string;
    title: string;
    message: string;
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    createdAt: string;
}

export const getEventAnnouncements = async (eventId: string) => {
    const response = await axios.get(`${API_URL}/events/${eventId}`);
    return response.data.data;
};

export const createAnnouncement = async (data: { eventId: string; title: string; message: string; priority: string; sendToRegistered: boolean }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

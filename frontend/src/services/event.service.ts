import axios from 'axios';

const API_URL = 'http://localhost:5000/api/events';

export const getEvents = async () => {
    const response = await axios.get(API_URL);
    return response.data.data;
};

export const getEventById = async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
};

export const createEvent = async (eventData: any) => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('Not authenticated. Please log in again.');
    }

    console.log('Creating event with token:', token.substring(0, 20) + '...');

    const response = await axios.post(API_URL, eventData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
};

export const getMyEvents = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/my-events`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
};

// Add types for Event if needed
export interface Event {
    id: string;
    title: string;
    description: string;
    eventType: string;
    category: string;
    startDateTime: string;
    endDateTime: string;
    venue: string;
    organizerId: string;
    organizer: {
        firstName: string;
        lastName: string;
    };
    bannerImage?: string;
    state?: string;
    _count?: {
        registrations: number;
        attendances: number;
        certificates: number;
    };
}

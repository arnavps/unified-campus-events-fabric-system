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
    const response = await axios.post(API_URL, eventData);
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
}

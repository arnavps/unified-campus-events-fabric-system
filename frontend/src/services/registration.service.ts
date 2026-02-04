import axios from 'axios';

const API_URL = 'http://localhost:5000/api/registrations';

export const registerForEvent = async (eventId: string, formResponses?: any) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, { eventId, formResponses }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getMyRegistrations = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/my-registrations`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
};

export const cancelRegistration = async (registrationId: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/${registrationId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export interface Registration {
    id: string;
    eventId: string;
    userId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'WAITLISTED';
    registeredAt: string;
    event?: {
        id: string;
        title: string;
        startDateTime: string;
        venue: string;
        bannerImage: string | null;
    }
}

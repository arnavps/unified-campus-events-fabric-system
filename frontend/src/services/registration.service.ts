import axios from 'axios';

const API_URL = 'http://localhost:5001/api/registrations'; // Port 5001 from previous step

export const registerForEvent = async (eventId: string, formResponses?: any) => {
    const response = await axios.post(API_URL, { eventId, formResponses });
    return response.data;
};

export const getMyRegistrations = async () => {
    const response = await axios.get(`${API_URL}/my-registrations`);
    return response.data.data;
};

export const cancelRegistration = async (registrationId: string) => {
    const response = await axios.patch(`${API_URL}/${registrationId}/cancel`);
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

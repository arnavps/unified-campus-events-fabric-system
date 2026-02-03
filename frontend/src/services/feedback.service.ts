import axios from 'axios';

const API_URL = 'http://localhost:5001/api/feedback';

export interface FeedbackData {
    eventId: string;
    overallRating: number;
    comments?: string;
    isAnonymous?: boolean;
}

export const submitFeedback = async (data: FeedbackData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getEventFeedback = async (eventId: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

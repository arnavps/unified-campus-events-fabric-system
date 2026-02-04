import axios from 'axios';

const API_URL = 'http://localhost:5000/api/analytics';

export const getOrganizerStats = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/organizer`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
};

export const getEventStats = async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
};

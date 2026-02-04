import axios from 'axios';

const API_URL = 'http://localhost:5000/api/analytics';

export const getOrganizerStats = async () => {
    const response = await axios.get(`${API_URL}/organizer`);
    return response.data.data;
};

export const getEventStats = async (id: string) => {
    const response = await axios.get(`${API_URL}/events/${id}`);
    return response.data.data;
};

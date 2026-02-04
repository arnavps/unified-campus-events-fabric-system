import axios from 'axios';

const API_URL = 'http://localhost:5000/api/certificates';

export interface Certificate {
    id: string;
    certificateNumber: string;
    eventId: string;
    userId: string;
    title: string;
    status: 'ISSUED' | 'REVOKED';
    verificationHash: string;
    issuedAt: string;
    event?: {
        title: string;
        startDateTime: string;
    };
}

export interface CertificateWithUser extends Certificate {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export const getMyCertificates = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/my-certificates`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
};

export const issueCertificate = async (eventId: string, userId: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/issue`, { eventId, userId }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const downloadCertificate = async (id: string, fileName: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/download/${id}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const bulkIssueCertificates = async (eventId: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/bulk-issue`, { eventId }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getEventCertificates = async (eventId: string): Promise<CertificateWithUser[]> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
};

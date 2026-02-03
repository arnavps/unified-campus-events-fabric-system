import axios from 'axios';

const API_URL = 'http://localhost:5001/api/certificates';

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

export const getMyCertificates = async () => {
    const response = await axios.get(`${API_URL}/my-certificates`);
    return response.data.data;
};

export const issueCertificate = async (eventId: string, userId: string) => {
    const response = await axios.post(`${API_URL}/issue`, { eventId, userId });
    return response.data;
};

export const downloadCertificate = async (id: string, fileName: string) => {
    const response = await axios.get(`${API_URL}/${id}/download`, {
        responseType: 'blob', // Important for PDF
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

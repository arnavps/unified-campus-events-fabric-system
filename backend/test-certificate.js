const axios = require('axios');
const API_AUTH = 'http://localhost:5001/api/auth';
const API_EVENT = 'http://localhost:5001/api/events';
const API_REG = 'http://localhost:5001/api/registrations';
const API_ATTENDANCE = 'http://localhost:5001/api/attendance';
const API_CERT = 'http://localhost:5001/api/certificates';

const run = async () => {
    try {
        console.log('--- Starting Certificate Test ---');

        // 1. Organizer Setup
        const orgEmail = `org_cert_${Date.now()}@test.com`;
        const orgRes = await axios.post(`${API_AUTH}/register`, {
            email: orgEmail, password: 'password123', firstName: 'Org', lastName: 'Cert', role: 'ORGANIZER'
        });
        const orgToken = orgRes.data.data.tokens.accessToken;
        console.log('Organizer Created');

        // 2. Create Event
        const eventRes = await axios.post(API_EVENT, {
            title: 'Certificate Event',
            description: 'Testing certs',
            eventType: 'WORKSHOP',
            category: 'TECHNICAL',
            startDateTime: new Date().toISOString(),
            endDateTime: new Date(Date.now() + 86400000).toISOString(),
            venue: 'Lab 101',
            maxParticipants: 10
        }, { headers: { Authorization: `Bearer ${orgToken}` } });
        const eventId = eventRes.data.data.id;
        console.log('Event Created:', eventId);

        // 3. Student Setup, Register, & Attend
        const stuEmail = `stu_cert_${Date.now()}@test.com`;
        const stuRes = await axios.post(`${API_AUTH}/register`, {
            email: stuEmail, password: 'password123', firstName: 'Stu', lastName: 'Cert', role: 'STUDENT'
        });
        const stuToken = stuRes.data.data.tokens.accessToken;
        const stuId = stuRes.data.data.user.id;

        await axios.post(API_REG, { eventId }, { headers: { Authorization: `Bearer ${stuToken}` } });
        await axios.post(`${API_ATTENDANCE}/events/${eventId}/mark`, {
            userId: stuId, status: 'PRESENT'
        }, { headers: { Authorization: `Bearer ${orgToken}` } });
        console.log('Student Marked Present');

        // 4. Issue Certificate
        console.log(`Issuing certificate for Event: ${eventId}, User: ${stuId}`);
        const issueRes = await axios.post(`${API_CERT}/issue`, { eventId, userId: stuId }, {
            headers: { Authorization: `Bearer ${orgToken}` }
        });
        console.log('Certificate Issued:', issueRes.data.success);
        const certId = issueRes.data.data.id;

        // 5. Get My Certificates
        const myRes = await axios.get(`${API_CERT}/my-certificates`, {
            headers: { Authorization: `Bearer ${stuToken}` }
        });
        console.log('My Certificates Count:', myRes.data.data.length);

        // 6. Download (Check status)
        // Note: Response might be binary, so just check status 200
        const dlRes = await axios.get(`${API_CERT}/${certId}/download`, {
            headers: { Authorization: `Bearer ${stuToken}` },
            responseType: 'arraybuffer'
        });
        console.log('Download PDF Status:', dlRes.status);
        console.log('Download PDF Size:', dlRes.data.length);

    } catch (e) {
        console.error('Test Failed!');
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', e.response.data); // Should help debug if it returns HTML
        } else {
            console.error(e.message);
        }
    }
};

run();

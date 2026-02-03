const axios = require('axios');
const API_AUTH = 'http://localhost:5001/api/auth';
const API_EVENT = 'http://localhost:5001/api/events';
const API_REG = 'http://localhost:5001/api/registrations';
const API_ATTENDANCE = 'http://localhost:5001/api/attendance';
const API_CERT = 'http://localhost:5001/api/certificates';

const run = async () => {
    try {
        console.log('--- Starting Email Notifications Test ---');

        // 1. Organizer Setup
        const orgEmail = `org_email_${Date.now()}@test.com`;
        const orgRes = await axios.post(`${API_AUTH}/register`, {
            email: orgEmail, password: 'password123', firstName: 'Org', lastName: 'Email', role: 'ORGANIZER'
        });
        const orgToken = orgRes.data.data.tokens.accessToken;
        console.log('Organizer Created');

        // 2. Create Event
        const eventRes = await axios.post(API_EVENT, {
            title: 'Email Trigger Event',
            description: 'Testing emails',
            eventType: 'WORKSHOP',
            category: 'TECHNICAL',
            startDateTime: new Date().toISOString(),
            endDateTime: new Date(Date.now() + 86400000).toISOString(),
            venue: 'Lab 102',
            maxParticipants: 10
        }, { headers: { Authorization: `Bearer ${orgToken}` } });
        const eventId = eventRes.data.data.id;
        console.log('Event Created:', eventId);

        // 3. Student Setup & Register (Should trigger Email 1)
        const stuEmail = `stu_email_${Date.now()}@test.com`;
        const stuRes = await axios.post(`${API_AUTH}/register`, {
            email: stuEmail, password: 'password123', firstName: 'Stu', lastName: 'Email', role: 'STUDENT'
        });
        const stuToken = stuRes.data.data.tokens.accessToken;
        const stuId = stuRes.data.data.user.id;

        console.log('Registering Student (Expect Email Log on Server)...');
        await axios.post(API_REG, { eventId }, { headers: { Authorization: `Bearer ${stuToken}` } });
        console.log('Registration Complete');

        // 4. Mark Attendance
        await axios.post(`${API_ATTENDANCE}/events/${eventId}/mark`, {
            userId: stuId, status: 'PRESENT'
        }, { headers: { Authorization: `Bearer ${orgToken}` } });
        console.log('Student Marked Present');

        // 5. Issue Certificate (Should trigger Email 2)
        console.log('Issuing Certificate (Expect Email Log on Server)...');
        await axios.post(`${API_CERT}/issue`, { eventId, userId: stuId }, {
            headers: { Authorization: `Bearer ${orgToken}` }
        });
        console.log('Certificate Issued');

    } catch (e) {
        console.error('Test Failed:', e.response?.data || e.message);
    }
};

run();

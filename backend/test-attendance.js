const axios = require('axios');
const API_AUTH = 'http://localhost:5001/api/auth';
const API_EVENT = 'http://localhost:5001/api/events';
const API_REG = 'http://localhost:5001/api/registrations';
const API_ATTENDANCE = 'http://localhost:5001/api/attendance';

const run = async () => {
    try {
        console.log('--- Starting Attendance Test ---');

        // 1. Organizer Setup
        const orgEmail = `org_att_${Date.now()}@test.com`;
        const orgRes = await axios.post(`${API_AUTH}/register`, {
            email: orgEmail, password: 'password123', firstName: 'Org', lastName: 'Att', role: 'ORGANIZER'
        });
        const orgToken = orgRes.data.data.tokens.accessToken;
        const orgId = orgRes.data.data.user.id;
        console.log('Organizer Created');

        // 2. Create Event
        const eventRes = await axios.post(API_EVENT, {
            title: 'Attendance Event',
            description: 'Testing attendance',
            eventType: 'WORKSHOP',
            category: 'TECHNICAL',
            startDateTime: new Date().toISOString(),
            endDateTime: new Date(Date.now() + 86400000).toISOString(),
            venue: 'Lab 1',
            maxParticipants: 20
        }, { headers: { Authorization: `Bearer ${orgToken}` } });
        const eventId = eventRes.data.data.id;
        console.log('Event Created:', eventId);

        // 3. Student Setup & Register
        const stuEmail = `stu_att_${Date.now()}@test.com`;
        const stuRes = await axios.post(`${API_AUTH}/register`, {
            email: stuEmail, password: 'password123', firstName: 'Stu', lastName: 'Att', role: 'STUDENT'
        });
        const stuToken = stuRes.data.data.tokens.accessToken;
        const stuId = stuRes.data.data.user.id;

        await axios.post(API_REG, { eventId }, { headers: { Authorization: `Bearer ${stuToken}` } });
        console.log('Student Registered');

        // 4. Mark Attendance (Organizer scans Student)
        const markRes = await axios.post(`${API_ATTENDANCE}/events/${eventId}/mark`, {
            userId: stuId,
            status: 'PRESENT'
        }, { headers: { Authorization: `Bearer ${orgToken}` } });
        console.log('Marked Present:', markRes.data.success);

        // 5. Get Event Attendance (Organizer)
        const listRes = await axios.get(`${API_ATTENDANCE}/events/${eventId}`, {
            headers: { Authorization: `Bearer ${orgToken}` }
        });
        console.log('Attendance List Count:', listRes.data.data.length);
        console.log('Status:', listRes.data.data[0].status);

        // 6. Get My Attendance (Student)
        const myRes = await axios.get(`${API_ATTENDANCE}/my-attendance`, {
            headers: { Authorization: `Bearer ${stuToken}` }
        });
        console.log('Student History Count:', myRes.data.data.length);

    } catch (e) {
        console.error('Test Failed:', e.response?.data || e.message);
    }
};

run();

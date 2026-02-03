const axios = require('axios');
const API_AUTH = 'http://localhost:5001/api/auth';
const API_EVENT = 'http://localhost:5001/api/events';
const API_REG = 'http://localhost:5001/api/registrations';
const API_ANN = 'http://localhost:5001/api/announcements';

const run = async () => {
    try {
        console.log('--- Starting Announcement System Test ---');

        // 1. Organizer setup
        const orgEmail = `org_ann_${Date.now()}@test.com`;
        const authRes = await axios.post(`${API_AUTH}/register`, {
            email: orgEmail, password: 'password123', firstName: 'Org', lastName: 'Announce', role: 'ORGANIZER'
        });
        const token = authRes.data.data.tokens.accessToken;

        // 2. Create Event
        const eventRes = await axios.post(API_EVENT, {
            title: 'Announcement Test Event',
            description: 'Testing announcements',
            eventType: 'SEMINAR',
            category: 'ACADEMIC',
            startDateTime: new Date().toISOString(),
            endDateTime: new Date(Date.now() + 86400000).toISOString(),
            venue: 'Hall A',
            maxParticipants: 50
        }, { headers: { Authorization: `Bearer ${token}` } });
        const eventId = eventRes.data.data.id;
        console.log('Event Created:', eventId);

        // 3. Register a Student (to test email)
        const stuEmail = `stu_ann_${Date.now()}@test.com`;
        const stuRes = await axios.post(`${API_AUTH}/register`, {
            email: stuEmail, password: 'password123', firstName: 'Stu', lastName: 'Audience', role: 'STUDENT'
        });
        const stuToken = stuRes.data.data.tokens.accessToken;

        await axios.post(API_REG, { eventId }, { headers: { Authorization: `Bearer ${stuToken}` } });
        console.log('Student Registered');

        // Approve registration (needed for email?) -> Schema says sendToRegistered. 
        // Logic in controller: where: { eventId, status: 'APPROVED' }
        // We need to approve the student first if approval is required. 
        // By default requiresApproval might be false (RegistrationStatus: APPROVED or PENDING).
        // Let's check registration status.
        // Assuming default checks: The standard flow might be PENDING.
        // Let's manually approve using Prisma in a real app, but here we can't easily.
        // However, if we look at `registration.controller.ts`, if `requiresApproval` is false, it's APPROVED.
        // Event default `requiresApproval` is false. So status is likely APPROVED.

        // 4. Create Announcement
        const annRes = await axios.post(API_ANN, {
            eventId,
            title: 'Important Update',
            message: 'The event starts 30 mins late.',
            priority: 'HIGH',
            sendToRegistered: true
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('Announcement Created:', annRes.data.success);

        // 5. Fetch Announcements
        const getAnnRes = await axios.get(`${API_ANN}/events/${eventId}`);
        console.log('Announcements Fetched:', getAnnRes.data.data.length);

    } catch (e) {
        console.error('Test Failed:', e.response?.data || e.message);
    }
};

run();

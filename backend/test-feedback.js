const axios = require('axios');
const API_AUTH = 'http://localhost:5001/api/auth';
const API_EVENT = 'http://localhost:5001/api/events';
const API_REG = 'http://localhost:5001/api/registrations';
const API_ATTENDANCE = 'http://localhost:5001/api/attendance';
const API_FEEDBACK = 'http://localhost:5001/api/feedback';

const run = async () => {
    try {
        console.log('--- Starting Feedback System Test ---');

        // 1. Organizer & Event
        const email = `org_feed_${Date.now()}@test.com`;
        const authRes = await axios.post(`${API_AUTH}/register`, {
            email, password: 'password123', firstName: 'Org', lastName: 'Feed', role: 'ORGANIZER'
        });
        const token = authRes.data.data.tokens.accessToken;

        const eventRes = await axios.post(API_EVENT, {
            title: 'Feedback Test Event',
            description: 'Testing feedback',
            eventType: 'WORKSHOP',
            category: 'TECHNICAL',
            startDateTime: new Date().toISOString(),
            endDateTime: new Date(Date.now() + 86400000).toISOString(),
            venue: 'Virtual',
            maxParticipants: 10
        }, { headers: { Authorization: `Bearer ${token}` } });
        const eventId = eventRes.data.data.id;
        console.log('Event Created');

        // 2. Student & Register
        const stuEmail = `stu_feed_${Date.now()}@test.com`;
        const stuRes = await axios.post(`${API_AUTH}/register`, {
            email: stuEmail, password: 'password123', firstName: 'Stu', lastName: 'Feed', role: 'STUDENT'
        });
        const stuToken = stuRes.data.data.tokens.accessToken;
        const stuId = stuRes.data.data.user.id;

        await axios.post(API_REG, { eventId }, { headers: { Authorization: `Bearer ${stuToken}` } });
        console.log('Student Registered');

        // 3. Mark Attendance (Required for Feedback)
        await axios.post(`${API_ATTENDANCE}/events/${eventId}/mark`, {
            userId: stuId, status: 'PRESENT'
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('Attendance Marked');

        // 4. Submit Feedback
        const feedRes = await axios.post(API_FEEDBACK, {
            eventId,
            overallRating: 5,
            comments: 'Great session!',
            isAnonymous: false
        }, { headers: { Authorization: `Bearer ${stuToken}` } });
        console.log('Feedback Submitted:', feedRes.data.success);

        // 5. Fetch Feedback (Organizer)
        const getFeedRes = await axios.get(`${API_FEEDBACK}/events/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Feedback Fetched:', getFeedRes.data.data.totalCount === 1);

    } catch (e) {
        console.error('Test Failed:', e.response?.data || e.message);
    }
};

run();

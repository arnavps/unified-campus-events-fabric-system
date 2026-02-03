const axios = require('axios');
const API_AUTH = 'http://localhost:5001/api/auth';
const API_EVENT = 'http://localhost:5001/api/events';
const API_REG = 'http://localhost:5001/api/registrations';

const run = async () => {
    try {
        console.log('--- Starting Registration Test with Axios (Port 5001) ---');

        // 1. Organizer Setup & Create Event
        const orgEmail = `org${Date.now()}@regtest.com`;
        const orgRes = await axios.post(`${API_AUTH}/register`, {
            email: orgEmail, password: 'password123', firstName: 'Org', lastName: 'Reg', role: 'ORGANIZER'
        });
        const orgToken = orgRes.data.data.tokens.accessToken;
        console.log('Organizer Created');

        const eventRes = await axios.post(API_EVENT, {
            title: 'Registration Test Event',
            description: 'Testing regs',
            eventType: 'SEMINAR',
            category: 'ACADEMIC',
            startDateTime: new Date().toISOString(),
            endDateTime: new Date(Date.now() + 86400000).toISOString(),
            venue: 'Hall A',
            maxParticipants: 50
        }, { headers: { Authorization: `Bearer ${orgToken}` } });

        const eventId = eventRes.data.data.id;
        console.log('Event Created:', eventId);

        // 2. Student Setup
        const studentEmail = `student${Date.now()}@regtest.com`;
        const studentRes = await axios.post(`${API_AUTH}/register`, {
            email: studentEmail, password: 'password123', firstName: 'Stu', lastName: 'Dent', role: 'STUDENT'
        });
        const studentToken = studentRes.data.data.tokens.accessToken;
        console.log('Student Created');

        // 3. Register for Event
        const regRes = await axios.post(API_REG, {
            eventId: eventId
        }, { headers: { Authorization: `Bearer ${studentToken}` } });
        const regId = regRes.data.data.id;
        console.log('Registered Success:', !!regId);

        // 4. Get My Registrations
        const myRegRes = await axios.get(`${API_REG}/my-registrations`, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        const found = myRegRes.data.data.some(r => r.id === regId);
        console.log('Registration Found in List:', found);

        // 5. Cancel Registration
        const cancelRes = await axios.patch(`${API_REG}/${regId}/cancel`, {}, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.log('Cancel Success:', cancelRes.data.data.status === 'CANCELLED');

    } catch (e) {
        console.error('Test Failed:', e.response?.data || e.message);
    }
};

run();

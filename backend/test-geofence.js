const axios = require('axios');
const API_AUTH = 'http://localhost:5001/api/auth';
const API_EVENT = 'http://localhost:5001/api/events';
const API_REG = 'http://localhost:5001/api/registrations';
const API_ATT = 'http://localhost:5001/api/attendance';

const run = async () => {
    try {
        console.log('--- Starting Geofence Attendance Test ---');

        // 1. Organizer Setup
        const orgEmail = `org_geo_${Date.now()}@test.com`;
        const authRes = await axios.post(`${API_AUTH}/register`, {
            email: orgEmail, password: 'password123', firstName: 'Org', lastName: 'Geo', role: 'ORGANIZER'
        });
        const token = authRes.data.data.tokens.accessToken;

        // 2. Create Event with Geofence
        // Let's pretend the event is at [0, 0] with radius 100m.
        const eventRes = await axios.post(API_EVENT, {
            title: 'Geofenced Event',
            description: 'Testing location',
            eventType: 'WORKSHOP',
            category: 'TECHNICAL',
            startDateTime: new Date().toISOString(),
            endDateTime: new Date(Date.now() + 86400000).toISOString(),
            venue: 'Geo Lab',
            attendanceMethod: 'GEOFENCE',
            latitude: 0,
            longitude: 0,
            geofenceRadius: 100
        }, { headers: { Authorization: `Bearer ${token}` } });
        const eventId = eventRes.data.data.id;
        console.log('Event Created:', eventId);

        // 3. Register Student
        const stuEmail = `stu_geo_${Date.now()}@test.com`;
        const stuRes = await axios.post(`${API_AUTH}/register`, {
            email: stuEmail, password: 'password123', firstName: 'Stu', lastName: 'Walker', role: 'STUDENT'
        });
        const stuToken = stuRes.data.data.tokens.accessToken;

        await axios.post(API_REG, { eventId }, { headers: { Authorization: `Bearer ${stuToken}` } });
        console.log('Student Registered');

        // 4. Try Check-in WITHOUT Location (Should Fail)
        try {
            await axios.post(`${API_ATT}/mark`, { eventId, status: 'PRESENT' }, { headers: { Authorization: `Bearer ${stuToken}` } });
            console.error('❌ Check-in without location SHOULD fail but PASSED');
        } catch (e) {
            console.log('✅ Check-in without location FAILED as expected:', e.response?.data?.message);
        }

        // 5. Try Check-in FAR AWAY (Should Fail)
        // 1 degree is roughly 111km. So 0.1 is ~11km. > 100m.
        try {
            await axios.post(`${API_ATT}/mark`, {
                eventId,
                status: 'PRESENT',
                latitude: 0.1,
                longitude: 0.1
            }, { headers: { Authorization: `Bearer ${stuToken}` } });
            console.error('❌ Check-in far away SHOULD fail but PASSED');
        } catch (e) {
            console.log('✅ Check-in far away FAILED as expected:', e.response?.data?.message);
        }

        // 6. Try Check-in INSIDE (Should Pass)
        // 0.0001 degrees is roughly 11m. Inside 100m.
        const validRes = await axios.post(`${API_ATT}/mark`, {
            eventId,
            status: 'PRESENT',
            latitude: 0.0001,
            longitude: 0.0001
        }, { headers: { Authorization: `Bearer ${stuToken}` } });
        console.log('✅ Check-in inside geofence PASSED:', validRes.data.success);

    } catch (e) {
        console.error('Test Failed:', e.response?.data || e.message);
    }
};

run();

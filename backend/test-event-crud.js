const API_AUTH = 'http://localhost:5001/api/auth';
const API_EVENT = 'http://localhost:5001/api/events';

const run = async () => {
    try {
        // 1. Login as Organizer (Create new one to be safe)
        const email = `org${Date.now()}@test.com`;
        const regRes = await fetch(`${API_AUTH}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email, password: 'password123', firstName: 'Org', lastName: 'User', role: 'ORGANIZER'
            })
        });
        const regData = await regRes.json();
        const token = regData.data.tokens.accessToken;
        console.log('Organizer Registered & Logged in:', !!token);

        // 2. Create Event
        const eventRes = await fetch(API_EVENT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Test Hackathon',
                description: 'A great hackathon',
                eventType: 'HACKATHON',
                category: 'TECHNICAL',
                startDateTime: new Date().toISOString(),
                endDateTime: new Date(Date.now() + 86400000).toISOString(),
                venue: 'Campus Center',
                maxParticipants: 100
            })
        });
        const eventData = await eventRes.json();
        console.log('Create Event Success:', eventData.success);
        if (!eventData.success) console.error(eventData);

        const eventId = eventData.data.id;

        // 3. Get All Events (Public)
        const listRes = await fetch(API_EVENT);
        const listData = await listRes.json();
        console.log('List Events Success:', listData.success);
        const found = listData.data.some(e => e.id === eventId);
        console.log('Created Event Found in List:', found);

        // 4. Get Event Detail
        const detailRes = await fetch(`${API_EVENT}/${eventId}`);
        const detailData = await detailRes.json();
        console.log('Get Event Detail Success:', detailData.success);

        // 5. Delete Event
        const deleteRes = await fetch(`${API_EVENT}/${eventId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const deleteData = await deleteRes.json();
        console.log('Delete Event Success:', deleteData.success);

    } catch (e) {
        console.error('Test Failed:', e);
    }
};

run();

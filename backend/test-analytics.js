const axios = require('axios');
const API_AUTH = 'http://localhost:5001/api/auth';
const API_ANALYTICS = 'http://localhost:5001/api/analytics';

const run = async () => {
    try {
        console.log('--- Starting Analytics Test ---');

        // 1. Organizer Setup (Reuse existing or create new)
        const email = `org_analytics_${Date.now()}@test.com`;
        const authRes = await axios.post(`${API_AUTH}/register`, {
            email, password: 'password123', firstName: 'Org', lastName: 'Analytics', role: 'ORGANIZER'
        });
        const token = authRes.data.data.tokens.accessToken;
        console.log('Organizer Created');

        // 2. Fetch Organizer Stats (Should be mostly 0)
        const stats1 = await axios.get(`${API_ANALYTICS}/organizer`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Initial Stats:', stats1.data.data);

        // 3. Setup Admin
        const adminEmail = `admin_analytics_${Date.now()}@test.com`;
        const adminRes = await axios.post(`${API_AUTH}/register`, {
            email: adminEmail, password: 'password123', firstName: 'Admin', lastName: 'Analytics', role: 'ADMIN'
        });
        const adminToken = adminRes.data.data.tokens.accessToken;

        // 4. Fetch Admin Stats
        const stats2 = await axios.get(`${API_ANALYTICS}/admin`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('Admin Stats:', stats2.data.data);

    } catch (e) {
        console.error('Test Failed:', e.response?.data || e.message);
    }
};

run();

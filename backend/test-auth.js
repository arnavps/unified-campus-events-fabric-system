const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

const testAuth = async () => {
    try {
        console.log('Testing Registration...');
        const regRes = await axios.post(`${API_URL}/register`, {
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
            role: 'STUDENT'
        });
        console.log('Registration Success:', regRes.data.success);

        console.log('Testing Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: regRes.data.data.user.email,
            password: 'password123'
        });
        console.log('Login Success:', loginRes.data.success);
        console.log('Token received:', !!loginRes.data.data.tokens.accessToken);

    } catch (error) {
        if (error.response) {
            console.error('Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

testAuth();

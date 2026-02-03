const API_URL = 'http://localhost:5000/api/auth';

const testAuth = async () => {
    try {
        console.log('Testing Registration...');
        const regRes = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `test${Date.now()}@example.com`,
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
                role: 'STUDENT'
            })
        });
        const regData = await regRes.json();
        console.log('Registration Success:', regData.success);

        if (!regData.success) {
            console.error('Registration failed:', regData);
            return;
        }

        console.log('Testing Login...');
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: regData.data.user.email,
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        console.log('Login Success:', loginData.success);
        console.log('Token received:', !!loginData.data.tokens.accessToken);

    } catch (error) {
        console.error('Error:', error);
    }
};

testAuth();

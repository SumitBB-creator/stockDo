// using native fetch

async function testLogin() {
    const url = 'http://localhost:3001/api/v1/auth/login';
    const body = {
        email: 'superadmin@stockdo.com',
        password: 'password123'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error('Login failed with status:', response.status);
            const text = await response.text();
            console.error('Body:', text);
            return;
        }

        const data = await response.json();
        console.log('Full Response:', JSON.stringify(data, null, 2));
        console.log('Login successful!');
        console.log('Token:', data.access_token ? 'Present' : 'Missing');
        console.log('User:', data.user);
    } catch (error) {
        console.error('Error connecting to backend:', error);
    }
}

testLogin();

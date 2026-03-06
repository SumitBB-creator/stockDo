
const http = require('http');

const url = 'http://localhost:3001/api/v1/transactions/ledger?customerId=8552973b-6fa3-475f-b7ba-114ee642ee19';

http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            console.log(JSON.stringify(JSON.parse(data), null, 2));
        } catch (e) {
            console.log('Raw Data:', data);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});

const https = require('https');

const data = JSON.stringify({
    query: "SELECT id, sales_month, is_carried_forward FROM manual_deliveries WHERE is_manual = 1 OR id LIKE 's_man_%'"
});

const options = {
    hostname: 'sales.cv-acimotors.com',
    port: 443,
    path: '/api.php',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let raw = '';
    res.on('data', (d) => raw += d);
    res.on('end', () => {
        console.log('Response:', raw);
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.write(data);
req.end();

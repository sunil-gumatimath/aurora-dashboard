
const https = require('https');
const fs = require('fs');
const path = require('path');

const projectRef = 'wdqnudbuwnerdrbdkxqr';
const token = 'sbp_398de877e4ceb1d3f7b06bafacfec2bb511ae7ed';

const sqlPath = path.join(__dirname, 'database', 'aurora_ems_complete.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

// The SQL content might be too large for a single request if it's over several MB.
// aurora_ems_complete.sql is ~44KB, so it should be fine.

const data = JSON.stringify({
    query: sqlContent
});

const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${projectRef}/queries`,
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log(`🚀 Executing SQL on project ${projectRef}...`);

const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ SQL executed successfully!');
            try {
                const result = JSON.parse(responseData);
                console.log('Result:', JSON.stringify(result, null, 2));
            } catch (e) {
                // Response might not be JSON
                console.log('Raw Response:', responseData);
            }
        } else {
            console.error(`❌ Error executing SQL: ${res.statusCode}`);
            console.error('Response:', responseData);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error);
});

req.write(data);
req.end();

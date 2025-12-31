
const https = require('https');
const fs = require('fs');
const path = require('path');

const projectRef = 'wdqnudbuwnerdrbdkxqr';
const token = 'sbp_398de877e4ceb1d3f7b06bafacfec2bb511ae7ed';

const sqlPath = path.join(__dirname, 'database', 'aurora_ems_complete.sql');
let sqlContent = fs.readFileSync(sqlPath, 'utf8');

// Remove comments and split by semicolon
// This is a naive split, but should work for most EMS setup SQLs
const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

async function executeStatement(statement) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ query: statement + ';' });
        const options = {
            hostname: 'api.supabase.com',
            port: 443,
            path: `/v1/projects/${projectRef}/queries`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(responseData));
                } else {
                    console.error(`❌ Statement Failed: ${res.statusCode}`);
                    console.error(`Query: ${statement.substring(0, 50)}...`);
                    console.error(`Response: ${responseData}`);
                    resolve(null); // Continue anyway
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function run() {
    console.log(`🚀 Executing ${statements.length} statements on project ${projectRef}...`);
    for (let i = 0; i < statements.length; i++) {
        process.stdout.write(`\rProgress: ${i + 1}/${statements.length}`);
        await executeStatement(statements[i]);
    }
    console.log('\n✅ Script processing complete.');
}

run().catch(console.error);

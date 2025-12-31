
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyDatabase() {
    console.log('--- Verifying Supabase Database Features ---\n');

    const tablesToVerify = [
        'employees', 'tasks', 'leave_requests', 'payroll_records',
        'performance_reviews', 'support_tickets', 'announcements', 'assets'
    ];

    for (const table of tablesToVerify) {
        try {
            const { data, count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.error(`❌ Table "${table}": Error - ${error.message}`);
            } else {
                console.log(`✅ Table "${table}": Exists with ${count} records.`);
            }
        } catch (e) {
            console.error(`❌ Table "${table}": Unexpected Error - ${e.message}`);
        }
    }

    // Strategic Data Verification
    console.log('\n--- Strategic Data Verification ---');

    // Admin check
    const { data: admin } = await supabase
        .from('employees')
        .select('name, email, role')
        .eq('email', 'admin@gmail.com')
        .single();

    if (admin) {
        console.log(`✅ Admin User: Found "${admin.name}" (${admin.role})`);
    } else {
        console.log('❌ Admin User: Not found');
    }
}

verifyDatabase().catch(console.error);

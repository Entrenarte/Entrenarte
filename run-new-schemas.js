const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Entrenarte2026!@db.elguacpepvyxdpdyfnhd.supabase.co:5432/postgres';

const client = new Client({
    connectionString,
});

async function runNewSchemas() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // 1. Run grades schema
        const gradesSql = fs.readFileSync(path.join(__dirname, 'grades-schema.sql'), 'utf8');
        await client.query(gradesSql);
        console.log('✅ grades table created successfully.');

        // 2. Run notifications schema
        const notifSql = fs.readFileSync(path.join(__dirname, 'notifications-schema.sql'), 'utf8');
        await client.query(notifSql);
        console.log('✅ notifications table created successfully.');

        console.log('\n🎉 All schemas executed successfully!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

runNewSchemas();

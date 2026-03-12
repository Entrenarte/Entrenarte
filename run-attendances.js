const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Update to use the transaction connection pooler for Supabase
const connectionString = 'postgresql://postgres.elguacpepvyxdpdyfnhd:Entrenarte2026!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString,
});

async function runAttendancesSchema() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const schemaPath = path.join(__dirname, 'create-attendances.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await client.query(schemaSql);
        console.log('Attendances SQL executed successfully.');
    } catch (error) {
        console.error('Error executing attendances schema:', error);
    } finally {
        await client.end();
    }
}

runAttendancesSchema();

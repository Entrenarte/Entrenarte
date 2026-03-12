const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Entrenarte2026!@db.elguacpepvyxdpdyfnhd.supabase.co:5432/postgres';

const client = new Client({
    connectionString,
});

async function runSchema() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const schemaPath = path.join(__dirname, 'supabase-schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await client.query(schemaSql);
        console.log('Schema executed successfully.');
    } catch (error) {
        console.error('Error executing schema:', error);
    } finally {
        await client.end();
    }
}

runSchema();

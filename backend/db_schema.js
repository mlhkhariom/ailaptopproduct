#!/usr/bin/env node
/**
 * db_schema.js — View all PostgreSQL tables and columns
 * Usage: DATABASE_URL="postgresql://..." node backend/db_schema.js
 * Or:    node backend/db_schema.js (uses .env)
 */

import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { rows: tables } = await pool.query(`
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  ORDER BY table_name
`);

console.log(`\n📊 Database: ${process.env.DATABASE_URL?.split('/').pop()}`);
console.log(`📋 Total tables: ${tables.length}\n`);
console.log('='.repeat(60));

for (const { table_name } of tables) {
  const { rows: cols } = await pool.query(`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name = $1 AND table_schema = 'public'
    ORDER BY ordinal_position
  `, [table_name]);

  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) as count FROM "${table_name}"`);

  console.log(`\n📁 ${table_name} (${count} rows)`);
  console.log('-'.repeat(40));
  for (const col of cols) {
    const def = col.column_default ? ` DEFAULT ${col.column_default.slice(0, 30)}` : '';
    const nullable = col.is_nullable === 'NO' ? ' NOT NULL' : '';
    console.log(`  ${col.column_name.padEnd(30)} ${col.data_type}${nullable}${def}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ Schema dump complete\n');

await pool.end();

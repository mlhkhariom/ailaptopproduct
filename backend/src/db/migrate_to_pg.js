#!/usr/bin/env node
/**
 * Migrate SQLite → PostgreSQL
 * Run: node migrate_to_pg.js
 */
import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const sqlite = new Database(path.resolve(__dirname, '../../data/ailaptopwala.db'));
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const TABLES = [
  'users', 'categories', 'products', 'orders', 'coupons',
  'blog_posts', 'contact_queries', 'cms_content', 'whatsapp_rules',
  'whatsapp_messages', 'notifications', 'media', 'social_settings',
  'social_posts', 'reels', 'site_settings', 'app_settings',
  'ai_agent_settings', 'ai_conversation_memory', 'ai_agent_contact_settings',
  'ai_daily_count', 'services', 'service_bookings', 'whatsapp_notifications',
  'product_reviews', 'evolution_settings', 'evolution_instances',
  'evolution_messages', 'evolution_chats'
];

async function migrate() {
  console.log('🚀 Starting SQLite → PostgreSQL migration...\n');

  for (const table of TABLES) {
    try {
      const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
      if (rows.length === 0) { console.log(`⏭️  ${table}: empty`); continue; }

      // Build INSERT
      const cols = Object.keys(rows[0]);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
      const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

      let count = 0;
      for (const row of rows) {
        const values = cols.map(c => row[c]);
        await pool.query(sql, values);
        count++;
      }
      console.log(`✅ ${table}: ${count} rows migrated`);
    } catch (e) {
      console.log(`⚠️  ${table}: ${e.message}`);
    }
  }

  console.log('\n✅ Migration complete!');
  await pool.end();
  sqlite.close();
}

migrate().catch(e => { console.error(e); process.exit(1); });

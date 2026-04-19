import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let dbPath;
if (process.env.VERCEL) {
  const srcDb = path.resolve(__dirname, '../../data/ailaptopwala.db');
  dbPath = '/tmp/ailaptopwala.db';
  if (!fs.existsSync(dbPath)) fs.copyFileSync(srcDb, dbPath);
} else {
  dbPath = path.resolve(__dirname, '../../', process.env.DB_PATH || 'data/ailaptopwala.db');
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── AUTO MIGRATE: add missing columns safely ──────────────────────────────────
const addColumnIfMissing = (table, column, definition) => {
  try {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
    if (!cols.includes(column)) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
      console.log(`✅ Migrated: ${table}.${column}`);
    }
  } catch {}
};

// ── CREATE TABLES ─────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, role TEXT DEFAULT 'customer', phone TEXT,
    address TEXT, is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, name_hi TEXT, price REAL NOT NULL,
    original_price REAL, image TEXT, category TEXT, rating REAL DEFAULT 0,
    reviews INTEGER DEFAULT 0, description TEXT, ingredients TEXT, benefits TEXT,
    usage TEXT, in_stock INTEGER DEFAULT 1, stock INTEGER DEFAULT 0,
    sku TEXT UNIQUE, slug TEXT UNIQUE, badge TEXT, status TEXT DEFAULT 'active',
    meta_title TEXT, meta_description TEXT, focus_keywords TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, order_number TEXT UNIQUE NOT NULL, user_id TEXT REFERENCES users(id),
    items TEXT NOT NULL, subtotal REAL NOT NULL, discount REAL DEFAULT 0, total REAL NOT NULL,
    coupon_code TEXT, status TEXT DEFAULT 'placed', payment_status TEXT DEFAULT 'pending',
    payment_method TEXT, razorpay_id TEXT, payment_id TEXT, address TEXT,
    tracking_id TEXT, courier TEXT, created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, type TEXT NOT NULL, value REAL NOT NULL,
    min_order REAL DEFAULT 0, max_uses INTEGER, used_count INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1, expires_at TEXT, created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT UNIQUE, content TEXT, excerpt TEXT,
    image TEXT, category TEXT, author TEXT, status TEXT DEFAULT 'draft', tags TEXT,
    seo_title TEXT, seo_description TEXT, published_at TEXT, created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS contact_queries (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT,
    subject TEXT, message TEXT NOT NULL, status TEXT DEFAULT 'new',
    priority TEXT DEFAULT 'medium', reply TEXT, starred INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS cms_content (
    id TEXT PRIMARY KEY, section TEXT NOT NULL, content TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
    updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS whatsapp_rules (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, keywords TEXT NOT NULL,
    response_template TEXT NOT NULL, type TEXT DEFAULT 'custom',
    is_active INTEGER DEFAULT 1, match_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS social_settings (
    id TEXT PRIMARY KEY DEFAULT 'main', meta_app_id TEXT, meta_app_secret TEXT,
    meta_access_token TEXT, meta_page_id TEXT, meta_ig_account_id TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS social_posts (
    id TEXT PRIMARY KEY, title TEXT, caption TEXT, hashtags TEXT, thumbnail TEXT,
    video_path TEXT, platform TEXT NOT NULL, status TEXT DEFAULT 'draft',
    meta_post_id TEXT, error_msg TEXT, product_id TEXT, scheduled_at TEXT,
    published_at TEXT, likes INTEGER DEFAULT 0, comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0, views TEXT DEFAULT '0', created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS reels (
    id TEXT PRIMARY KEY, product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    title TEXT NOT NULL, thumbnail TEXT, video_url TEXT, platform TEXT DEFAULT 'instagram',
    views TEXT DEFAULT '0', is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id TEXT PRIMARY KEY, from_phone TEXT NOT NULL, to_phone TEXT NOT NULL,
    body TEXT NOT NULL, direction TEXT DEFAULT 'incoming', is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0, link TEXT, created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, name_hi TEXT, slug TEXT UNIQUE,
    description TEXT, image TEXT, is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY, filename TEXT NOT NULL, original_name TEXT, mimetype TEXT,
    size INTEGER, url TEXT NOT NULL, folder TEXT DEFAULT 'general',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY, value TEXT, updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY, value TEXT, updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS ai_agent_settings (
    id TEXT PRIMARY KEY DEFAULT 'main', enabled INTEGER DEFAULT 0,
    llm_provider TEXT DEFAULT 'openrouter', llm_model TEXT DEFAULT 'google/gemini-flash-1.5',
    api_key TEXT DEFAULT '', system_prompt TEXT, temperature REAL DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 500, memory_messages INTEGER DEFAULT 20,
    daily_limit INTEGER DEFAULT 100, business_hours_enabled INTEGER DEFAULT 0,
    business_hours_start TEXT DEFAULT '09:00', business_hours_end TEXT DEFAULT '21:00',
    feature_product_search INTEGER DEFAULT 1, feature_order_status INTEGER DEFAULT 1,
    feature_human_handoff INTEGER DEFAULT 1, ai_bubble_color TEXT DEFAULT '#FF8000',
    updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS ai_conversation_memory (
    id TEXT PRIMARY KEY, contact_id TEXT NOT NULL, role TEXT NOT NULL,
    content TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS ai_agent_contact_settings (
    contact_id TEXT PRIMARY KEY, agent_enabled INTEGER DEFAULT 1,
    updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS ai_daily_count (
    contact_id TEXT NOT NULL, date TEXT NOT NULL, count INTEGER DEFAULT 0,
    PRIMARY KEY (contact_id, date)
  );
  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
    price REAL NOT NULL, duration TEXT DEFAULT '2-4 hours',
    category TEXT DEFAULT 'repair', is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS service_bookings (
    id TEXT PRIMARY KEY, booking_number TEXT UNIQUE NOT NULL,
    user_id TEXT, customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL,
    customer_email TEXT, service_id TEXT, service_name TEXT NOT NULL,
    device_brand TEXT, device_model TEXT, issue_description TEXT,
    preferred_date TEXT, preferred_time TEXT, status TEXT DEFAULT 'pending',
    price REAL, notes TEXT, created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS whatsapp_notifications (
    id TEXT PRIMARY KEY, type TEXT NOT NULL, phone TEXT NOT NULL,
    message TEXT NOT NULL, status TEXT DEFAULT 'pending',
    sent_at TEXT, created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS product_reviews (
    id TEXT PRIMARY KEY, product_id TEXT NOT NULL, user_id TEXT,
    customer_name TEXT NOT NULL, rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    review TEXT, status TEXT DEFAULT 'pending', created_at TEXT DEFAULT (datetime('now'))
  );
`);

// ── AUTO MIGRATE missing columns ──────────────────────────────────────────────
addColumnIfMissing('products', 'meta_title', 'TEXT');
addColumnIfMissing('products', 'meta_description', 'TEXT');
addColumnIfMissing('products', 'focus_keywords', 'TEXT');
addColumnIfMissing('orders', 'payment_id', 'TEXT');
addColumnIfMissing('orders', 'payment_status', "TEXT DEFAULT 'pending'");

export default db;

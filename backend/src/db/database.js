import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vercel: copy pre-seeded DB to /tmp (writable), else use local path
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

// ── TABLES ──────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    phone TEXT,
    address TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_hi TEXT,
    price REAL NOT NULL,
    original_price REAL,
    image TEXT,
    category TEXT,
    rating REAL DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    description TEXT,
    ingredients TEXT,
    benefits TEXT,
    usage TEXT,
    in_stock INTEGER DEFAULT 1,
    stock INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    slug TEXT UNIQUE,
    badge TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES users(id),
    items TEXT NOT NULL,
    subtotal REAL NOT NULL,
    discount REAL DEFAULT 0,
    total REAL NOT NULL,
    coupon_code TEXT,
    status TEXT DEFAULT 'placed',
    payment_status TEXT DEFAULT 'pending',
    payment_method TEXT,
    razorpay_id TEXT,
    address TEXT,
    tracking_id TEXT,
    courier TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    value REAL NOT NULL,
    min_order REAL DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    expires_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    content TEXT,
    excerpt TEXT,
    image TEXT,
    category TEXT,
    author TEXT,
    status TEXT DEFAULT 'draft',
    tags TEXT,
    seo_title TEXT,
    seo_description TEXT,
    published_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contact_queries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    priority TEXT DEFAULT 'medium',
    reply TEXT,
    starred INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cms_content (
    id TEXT PRIMARY KEY,
    section TEXT NOT NULL,
    content TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS whatsapp_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    keywords TEXT NOT NULL,
    response_template TEXT NOT NULL,
    type TEXT DEFAULT 'custom',
    is_active INTEGER DEFAULT 1,
    match_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS social_settings (
    id TEXT PRIMARY KEY DEFAULT 'main',
    meta_app_id TEXT,
    meta_app_secret TEXT,
    meta_access_token TEXT,
    meta_page_id TEXT,
    meta_ig_account_id TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS social_posts (
    id TEXT PRIMARY KEY,
    title TEXT,
    caption TEXT,
    hashtags TEXT,
    thumbnail TEXT,
    video_path TEXT,
    platform TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    meta_post_id TEXT,
    error_msg TEXT,
    product_id TEXT,
    scheduled_at TEXT,
    published_at TEXT,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    views TEXT DEFAULT '0',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reels (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    thumbnail TEXT,
    video_url TEXT,
    platform TEXT DEFAULT 'instagram',
    views TEXT DEFAULT '0',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id TEXT PRIMARY KEY,
    from_phone TEXT NOT NULL,
    to_phone TEXT NOT NULL,
    body TEXT NOT NULL,
    direction TEXT DEFAULT 'incoming',
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    link TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_hi TEXT,
    slug TEXT UNIQUE,
    description TEXT,
    image TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// ── SEED DEFAULT DATA ────────────────────────────────────

const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@ailaptopwala.com');
if (!adminExists) {
  const { v4: uuidv4 } = await import('uuid');
  const { default: bcrypt } = await import('bcryptjs');
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare(`INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`)
    .run(uuidv4(), 'Admin', 'admin@ailaptopwala.com', hash, 'admin');

  const custHash = bcrypt.hashSync('user123', 10);
  db.prepare(`INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`)
    .run(uuidv4(), 'Priya', 'priya@email.com', custHash, 'customer');

  // Default coupons
  db.prepare(`INSERT INTO coupons (id, code, type, value, min_order, is_active) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(uuidv4(), 'AYUR10', 'percentage', 10, 0, 1);
  db.prepare(`INSERT INTO coupons (id, code, type, value, min_order, is_active) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(uuidv4(), 'FLAT100', 'flat', 100, 500, 1);
  db.prepare(`INSERT INTO coupons (id, code, type, value, min_order, is_active) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(uuidv4(), 'WELCOME20', 'percentage', 20, 0, 1);

  // Default WhatsApp rules
  const rules = [
    { name: 'Greeting', keywords: JSON.stringify(['hello','hi','namaste','helo']), template: 'Namaste! 🙏 AI Laptop Wala mein aapka swagat hai. Hum aapki kaise madad kar sakte hain?', type: 'greeting' },
    { name: 'Price Inquiry', keywords: JSON.stringify(['price','kitna','cost','rate','dam']), template: '{{product_name}} ki kimat ₹{{price}} hai. (MRP: {{original_price_info}}) 🌿\nOrder: ailaptopwala.com/products/{{slug}}', type: 'product' },
    { name: 'Order Status', keywords: JSON.stringify(['order','status','kahan','track','delivery']), template: 'Apna Order ID batayein, hum turant status check karenge! 📦', type: 'order' },
    { name: 'Stock Check', keywords: JSON.stringify(['available','stock','milega','hai kya']), template: '{{product_name}} abhi {{stock_status}} hai. {{stock_info}} 🌿', type: 'product' },
    { name: 'Thank You', keywords: JSON.stringify(['thanks','thank you','shukriya','dhanyawad']), template: 'Bahut shukriya! 🙏 AI Laptop Wala pe aapka vishwas hamare liye bahut mayne rakhta hai.', type: 'greeting' },
  ];
  const insertRule = db.prepare(`INSERT INTO whatsapp_rules (id, name, keywords, response_template, type, is_active, match_count) VALUES (?, ?, ?, ?, ?, 1, 0)`);
  rules.forEach(r => insertRule.run(uuidv4(), r.name, r.keywords, r.template, r.type));

  console.log('✅ Default data seeded');
}

export default db;

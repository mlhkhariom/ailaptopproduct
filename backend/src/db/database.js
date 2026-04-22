import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => console.error('PG pool error:', err.message));

// Convert SQLite ? to PostgreSQL $1, $2...
const toPostgres = (sql) => {
  let i = 0;
  // Handle INSERT OR IGNORE → INSERT ... ON CONFLICT DO NOTHING
  sql = sql.replace(/INSERT OR IGNORE INTO/gi, 'INSERT INTO');
  sql = sql.replace(/INSERT OR REPLACE INTO/gi, 'INSERT INTO');
  // Add ON CONFLICT DO NOTHING if not already present
  if (/^INSERT INTO/i.test(sql.trim()) && !/ON CONFLICT/i.test(sql)) {
    sql = sql.trimEnd().replace(/;?\s*$/, '') + ' ON CONFLICT DO NOTHING';
  }
  // Handle datetime('now') → NOW()
  sql = sql.replace(/datetime\('now'\)/gi, 'NOW()');
  // Handle AUTOINCREMENT
  sql = sql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
  // Replace ? with $n
  sql = sql.replace(/\?/g, () => `$${++i}`);
  return sql;
};

// Flatten params (handle arrays passed as single arg)
const flatParams = (params) => {
  if (!params || params.length === 0) return [];
  if (params.length === 1 && Array.isArray(params[0])) return params[0];
  return params;
};

// better-sqlite3 compatible async wrapper
const db = {
  pool,

  // Raw query
  query: (sql, params = []) => pool.query(toPostgres(sql), params),

  // Mimic better-sqlite3 .prepare(sql).run/get/all
  prepare: (sql) => ({
    run: async (...params) => {
      const pgSql = toPostgres(sql);
      const p = flatParams(params);
      const res = await pool.query(pgSql, p);
      return { changes: res.rowCount };
    },
    get: async (...params) => {
      const pgSql = toPostgres(sql);
      const p = flatParams(params);
      const res = await pool.query(pgSql, p);
      return res.rows[0] || null;
    },
    all: async (...params) => {
      const pgSql = toPostgres(sql);
      const p = flatParams(params);
      const res = await pool.query(pgSql, p);
      return res.rows;
    },
  }),

  exec: async (sql) => {
    // Split by ; and run each statement
    const stmts = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of stmts) {
      await pool.query(toPostgres(stmt));
    }
  },

  pragma: async () => {}, // no-op for PostgreSQL
};

// ── CREATE ALL TABLES ─────────────────────────────────────────────────────────
export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL, role TEXT DEFAULT 'customer', phone TEXT,
      address TEXT, is_active INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, name_hi TEXT, slug TEXT UNIQUE,
      description TEXT, image TEXT, is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, name_hi TEXT, price REAL NOT NULL,
      original_price REAL, image TEXT, category TEXT, rating REAL DEFAULT 0,
      reviews INTEGER DEFAULT 0, description TEXT, ingredients TEXT, benefits TEXT,
      usage TEXT, in_stock INTEGER DEFAULT 1, stock INTEGER DEFAULT 0,
      sku TEXT, slug TEXT UNIQUE, badge TEXT, status TEXT DEFAULT 'active',
      meta_title TEXT, meta_description TEXT, focus_keywords TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, order_number TEXT UNIQUE NOT NULL, user_id TEXT,
      items TEXT NOT NULL, subtotal REAL NOT NULL, discount REAL DEFAULT 0,
      total REAL NOT NULL, coupon_code TEXT, status TEXT DEFAULT 'placed',
      payment_status TEXT DEFAULT 'pending', payment_method TEXT,
      razorpay_id TEXT, payment_id TEXT, address TEXT,
      tracking_id TEXT, courier TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, type TEXT NOT NULL,
      value REAL NOT NULL, min_order REAL DEFAULT 0, max_uses INTEGER,
      used_count INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
      expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT UNIQUE, content TEXT,
      excerpt TEXT, image TEXT, category TEXT, author TEXT,
      status TEXT DEFAULT 'draft', tags TEXT, seo_title TEXT, seo_description TEXT,
      published_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS contact_queries (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT,
      subject TEXT, message TEXT NOT NULL, status TEXT DEFAULT 'new',
      priority TEXT DEFAULT 'medium', reply TEXT, starred INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS cms_content (
      id TEXT PRIMARY KEY, section TEXT NOT NULL, content TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS whatsapp_rules (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, keywords TEXT NOT NULL,
      response_template TEXT NOT NULL, type TEXT DEFAULT 'custom',
      is_active INTEGER DEFAULT 1, match_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS whatsapp_messages (
      id TEXT PRIMARY KEY, from_phone TEXT NOT NULL, to_phone TEXT NOT NULL,
      body TEXT NOT NULL, direction TEXT DEFAULT 'incoming',
      is_read INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL,
      message TEXT NOT NULL, is_read INTEGER DEFAULT 0, link TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY, filename TEXT NOT NULL, original_name TEXT,
      mimetype TEXT, size INTEGER, url TEXT NOT NULL,
      folder TEXT DEFAULT 'general', created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS social_settings (
      id TEXT PRIMARY KEY DEFAULT 'main', meta_app_id TEXT, meta_app_secret TEXT,
      meta_access_token TEXT, meta_page_id TEXT, meta_ig_account_id TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS social_posts (
      id TEXT PRIMARY KEY, title TEXT, caption TEXT, hashtags TEXT,
      thumbnail TEXT, video_path TEXT, platform TEXT NOT NULL,
      status TEXT DEFAULT 'draft', meta_post_id TEXT, error_msg TEXT,
      product_id TEXT, scheduled_at TIMESTAMPTZ, published_at TIMESTAMPTZ,
      likes INTEGER DEFAULT 0, comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0, views TEXT DEFAULT '0',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS reels (
      id TEXT PRIMARY KEY, product_id TEXT, title TEXT NOT NULL,
      thumbnail TEXT, video_url TEXT, platform TEXT DEFAULT 'instagram',
      views TEXT DEFAULT '0', is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY, value TEXT,
      category TEXT DEFAULT 'general', updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS ai_agent_settings (
      id TEXT PRIMARY KEY DEFAULT 'main', enabled INTEGER DEFAULT 0,
      llm_provider TEXT DEFAULT 'openrouter',
      llm_model TEXT DEFAULT 'google/gemini-flash-1.5',
      api_key TEXT DEFAULT '', system_prompt TEXT,
      temperature REAL DEFAULT 0.7, max_tokens INTEGER DEFAULT 500,
      memory_messages INTEGER DEFAULT 20, daily_limit INTEGER DEFAULT 100,
      business_hours_enabled INTEGER DEFAULT 0,
      business_hours_start TEXT DEFAULT '09:00',
      business_hours_end TEXT DEFAULT '21:00',
      feature_product_search INTEGER DEFAULT 1,
      feature_order_status INTEGER DEFAULT 1,
      feature_human_handoff INTEGER DEFAULT 1,
      ai_bubble_color TEXT DEFAULT '#FF8000',
      reply_delay_min REAL DEFAULT 1, reply_delay_max REAL DEFAULT 3,
      feature_typing_indicator INTEGER DEFAULT 1,
      feature_greeting INTEGER DEFAULT 1,
      feature_faq INTEGER DEFAULT 1, feature_cart_suggest INTEGER DEFAULT 0,
      fallback_message TEXT, agent_bubble_color TEXT DEFAULT '#e8d5ff',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS ai_conversation_memory (
      id TEXT PRIMARY KEY, contact_id TEXT NOT NULL, role TEXT NOT NULL,
      content TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_ai_mem_contact ON ai_conversation_memory(contact_id, created_at);
    CREATE TABLE IF NOT EXISTS ai_agent_contact_settings (
      contact_id TEXT PRIMARY KEY, agent_enabled INTEGER DEFAULT 1,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS ai_daily_count (
      contact_id TEXT NOT NULL, date TEXT NOT NULL, count INTEGER DEFAULT 0,
      PRIMARY KEY (contact_id, date)
    );
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
      price REAL NOT NULL, duration TEXT DEFAULT '2-4 hours',
      category TEXT DEFAULT 'repair', is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS service_bookings (
      id TEXT PRIMARY KEY, booking_number TEXT UNIQUE NOT NULL,
      user_id TEXT, customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL,
      customer_email TEXT, service_id TEXT, service_name TEXT NOT NULL,
      device_brand TEXT, device_model TEXT, issue_description TEXT,
      preferred_date TEXT, preferred_time TEXT, status TEXT DEFAULT 'pending',
      price REAL, notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS whatsapp_notifications (
      id TEXT PRIMARY KEY, type TEXT NOT NULL, phone TEXT NOT NULL,
      message TEXT NOT NULL, status TEXT DEFAULT 'pending',
      sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS product_reviews (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL, user_id TEXT,
      customer_name TEXT NOT NULL, rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      review TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS evolution_settings (
      id TEXT PRIMARY KEY DEFAULT 'main',
      api_url TEXT DEFAULT 'http://localhost:8081',
      api_key TEXT DEFAULT '', default_instance TEXT DEFAULT '',
      webhook_secret TEXT, is_visible_to_admin INTEGER DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS evolution_instances (
      id TEXT PRIMARY KEY, instance_name TEXT UNIQUE NOT NULL,
      connection_type TEXT DEFAULT 'baileys', status TEXT DEFAULT 'close',
      phone_number TEXT, cloud_phone_id TEXT, cloud_business_id TEXT,
      cloud_access_token TEXT, cloud_webhook_token TEXT,
      qr_code TEXT, qr_expires_at TIMESTAMPTZ,
      is_active INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS evolution_messages (
      id TEXT PRIMARY KEY, instance_name TEXT NOT NULL, remote_jid TEXT NOT NULL,
      message_id TEXT, body TEXT, from_me INTEGER DEFAULT 0,
      message_type TEXT DEFAULT 'text', media_url TEXT, quoted_msg_id TEXT,
      status TEXT DEFAULT 'sent', timestamp BIGINT, push_name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_evo_msg ON evolution_messages(instance_name, remote_jid, created_at DESC);
    CREATE TABLE IF NOT EXISTS evolution_chats (
      id TEXT PRIMARY KEY, instance_name TEXT NOT NULL, remote_jid TEXT NOT NULL,
      push_name TEXT, last_message TEXT, last_message_time TEXT,
      unread_count INTEGER DEFAULT 0, profile_pic TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(instance_name, remote_jid)
    );
  `);
  console.log('✅ PostgreSQL tables ready');
};

export default db;

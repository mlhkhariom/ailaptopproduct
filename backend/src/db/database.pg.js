import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// ── Helper: run query ─────────────────────────────────────────────────────────
export const query = async (text, params) => {
  const res = await pool.query(text, params);
  return res;
};

// ── SQLite-compatible shim (for gradual migration) ────────────────────────────
// Wraps pg pool to mimic better-sqlite3 sync API using async under the hood
// Routes: .prepare(sql).run(...) / .get(...) / .all(...)
const db = {
  pool,
  query,
  prepare: (sql) => ({
    run: async (...params) => {
      // Convert ? placeholders to $1, $2...
      const pgSql = toPostgres(sql);
      const res = await pool.query(pgSql, params.flat());
      return { changes: res.rowCount, lastInsertRowid: null };
    },
    get: async (...params) => {
      const pgSql = toPostgres(sql);
      const res = await pool.query(pgSql, params.flat());
      return res.rows[0] || null;
    },
    all: async (...params) => {
      const pgSql = toPostgres(sql);
      const res = await pool.query(pgSql, params.flat());
      return res.rows;
    },
  }),
  exec: async (sql) => {
    await pool.query(sql);
  },
  pragma: async () => {},
};

// Convert SQLite ? placeholders to PostgreSQL $1, $2...
function toPostgres(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

// ── Create all tables ─────────────────────────────────────────────────────────
export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      phone TEXT,
      address TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_hi TEXT,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
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
      sku TEXT,
      slug TEXT UNIQUE,
      badge TEXT,
      status TEXT DEFAULT 'active',
      meta_title TEXT,
      meta_description TEXT,
      focus_keywords TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      coupon_code TEXT,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'pending',
      payment_method TEXT DEFAULT 'cod',
      razorpay_id TEXT,
      payment_id TEXT,
      address TEXT,
      tracking_id TEXT,
      courier TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT DEFAULT 'percentage',
      discount_value REAL NOT NULL,
      min_order REAL DEFAULT 0,
      max_uses INTEGER DEFAULT 100,
      used_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT,
      excerpt TEXT,
      image TEXT,
      category TEXT,
      author TEXT DEFAULT 'Admin',
      status TEXT DEFAULT 'draft',
      tags TEXT,
      seo_title TEXT,
      seo_description TEXT,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contact_queries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cms_content (
      id TEXT PRIMARY KEY,
      section TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS whatsapp_rules (
      id TEXT PRIMARY KEY,
      trigger_keyword TEXT NOT NULL,
      response_template TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      match_type TEXT DEFAULT 'contains',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS whatsapp_messages (
      id TEXT PRIMARY KEY,
      from_phone TEXT,
      to_phone TEXT,
      body TEXT,
      direction TEXT DEFAULT 'incoming',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT,
      mime_type TEXT,
      size INTEGER,
      url TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS social_settings (
      id TEXT PRIMARY KEY DEFAULT 'main',
      facebook TEXT,
      instagram TEXT,
      twitter TEXT,
      youtube TEXT,
      linkedin TEXT,
      whatsapp TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS social_posts (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      content TEXT,
      image TEXT,
      status TEXT DEFAULT 'draft',
      scheduled_at TIMESTAMPTZ,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reels (
      id TEXT PRIMARY KEY,
      title TEXT,
      video_url TEXT NOT NULL,
      thumbnail TEXT,
      platform TEXT DEFAULT 'instagram',
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY DEFAULT 'main',
      site_name TEXT DEFAULT 'AI Laptop Wala',
      site_tagline TEXT,
      site_description TEXT,
      site_logo TEXT,
      site_favicon TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      contact_address TEXT,
      razorpay_key_id TEXT,
      razorpay_key_secret TEXT,
      razorpay_webhook_secret TEXT,
      shipping_free_above REAL DEFAULT 999,
      shipping_charge REAL DEFAULT 99,
      gst_number TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      category TEXT DEFAULT 'general',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ai_agent_settings (
      id TEXT PRIMARY KEY DEFAULT 'main',
      enabled INTEGER DEFAULT 0,
      llm_provider TEXT DEFAULT 'openrouter',
      llm_model TEXT DEFAULT 'google/gemini-2.0-flash-exp:free',
      api_key TEXT DEFAULT '',
      system_prompt TEXT,
      temperature REAL DEFAULT 0.7,
      max_tokens INTEGER DEFAULT 500,
      memory_messages INTEGER DEFAULT 20,
      daily_limit INTEGER DEFAULT 100,
      business_hours_enabled INTEGER DEFAULT 0,
      business_hours_start TEXT DEFAULT '09:00',
      business_hours_end TEXT DEFAULT '21:00',
      feature_product_search INTEGER DEFAULT 1,
      feature_order_status INTEGER DEFAULT 1,
      feature_human_handoff INTEGER DEFAULT 0,
      ai_bubble_color TEXT DEFAULT '#e8d5ff',
      reply_delay_min REAL DEFAULT 1,
      reply_delay_max REAL DEFAULT 3,
      feature_typing_indicator INTEGER DEFAULT 1,
      feature_greeting INTEGER DEFAULT 1,
      feature_faq INTEGER DEFAULT 1,
      feature_cart_suggest INTEGER DEFAULT 0,
      fallback_message TEXT,
      agent_bubble_color TEXT DEFAULT '#e8d5ff',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ai_conversation_memory (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_ai_memory_contact ON ai_conversation_memory(contact_id, created_at);

    CREATE TABLE IF NOT EXISTS ai_agent_contact_settings (
      contact_id TEXT PRIMARY KEY,
      ai_enabled INTEGER DEFAULT 1,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ai_daily_count (
      contact_id TEXT NOT NULL,
      date TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      PRIMARY KEY (contact_id, date)
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      duration TEXT DEFAULT '2-4 hours',
      category TEXT DEFAULT 'repair',
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS service_bookings (
      id TEXT PRIMARY KEY,
      booking_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      service_id TEXT,
      service_name TEXT NOT NULL,
      device_brand TEXT,
      device_model TEXT,
      issue_description TEXT,
      preferred_date TEXT,
      preferred_time TEXT,
      status TEXT DEFAULT 'pending',
      price REAL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS whatsapp_notifications (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      phone TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS product_reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      review TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS evolution_settings (
      id TEXT PRIMARY KEY DEFAULT 'main',
      api_url TEXT DEFAULT 'http://localhost:8081',
      api_key TEXT DEFAULT '',
      default_instance TEXT DEFAULT '',
      webhook_secret TEXT,
      is_visible_to_admin INTEGER DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS evolution_instances (
      id TEXT PRIMARY KEY,
      instance_name TEXT UNIQUE NOT NULL,
      connection_type TEXT DEFAULT 'baileys',
      status TEXT DEFAULT 'close',
      phone_number TEXT,
      cloud_phone_id TEXT,
      cloud_business_id TEXT,
      cloud_access_token TEXT,
      cloud_webhook_token TEXT,
      qr_code TEXT,
      qr_expires_at TIMESTAMPTZ,
      is_active INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS evolution_messages (
      id TEXT PRIMARY KEY,
      instance_name TEXT NOT NULL,
      remote_jid TEXT NOT NULL,
      message_id TEXT,
      body TEXT,
      from_me INTEGER DEFAULT 0,
      message_type TEXT DEFAULT 'text',
      media_url TEXT,
      quoted_msg_id TEXT,
      status TEXT DEFAULT 'sent',
      timestamp BIGINT,
      push_name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_evo_msg_jid ON evolution_messages(instance_name, remote_jid, created_at DESC);

    CREATE TABLE IF NOT EXISTS evolution_chats (
      id TEXT PRIMARY KEY,
      instance_name TEXT NOT NULL,
      remote_jid TEXT NOT NULL,
      push_name TEXT,
      last_message TEXT,
      last_message_time TEXT,
      unread_count INTEGER DEFAULT 0,
      profile_pic TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(instance_name, remote_jid)
    );
  `);

  console.log('✅ PostgreSQL tables ready');
};

export default db;

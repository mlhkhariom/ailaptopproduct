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
  // Handle INSERT OR IGNORE → add ON CONFLICT DO NOTHING
  if (/^INSERT OR IGNORE INTO/i.test(sql.trim())) {
    sql = sql.replace(/INSERT OR IGNORE INTO/gi, 'INSERT INTO');
    if (!/ON CONFLICT/i.test(sql)) {
      sql = sql.trimEnd().replace(/;?\s*$/, '') + ' ON CONFLICT DO NOTHING';
    }
  }
  // INSERT OR REPLACE is ambiguous without explicit ON CONFLICT clause — log warning
  if (/INSERT OR REPLACE INTO/i.test(sql)) {
    console.warn('⚠️ INSERT OR REPLACE detected — convert to explicit ON CONFLICT UPDATE:', sql.slice(0, 80));
    sql = sql.replace(/INSERT OR REPLACE INTO/gi, 'INSERT INTO');
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
      const p = Array.isArray(params[0]) ? params[0] : params;
      const res = await pool.query(pgSql, p);
      return { changes: res.rowCount };
    },
    get: async (...params) => {
      const pgSql = toPostgres(sql);
      const p = Array.isArray(params[0]) ? params[0] : params;
      const res = await pool.query(pgSql, p);
      return res.rows[0] || null;
    },
    all: async (...params) => {
      const pgSql = toPostgres(sql);
      const p = Array.isArray(params[0]) ? params[0] : params;
      const res = await pool.query(pgSql, p);
      return res.rows || [];
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
      original_price REAL, image TEXT, images JSONB DEFAULT '[]', category TEXT, brand TEXT,
      rating REAL DEFAULT 0, reviews INTEGER DEFAULT 0,
      description TEXT, specifications JSONB, highlights JSONB,
      ingredients TEXT, benefits TEXT, usage TEXT,
      in_stock INTEGER DEFAULT 1, stock INTEGER DEFAULT 0,
      sku TEXT, slug TEXT UNIQUE, badge TEXT, status TEXT DEFAULT 'active',
      show_public INTEGER DEFAULT 1, has_variants INTEGER DEFAULT 0,
      warranty TEXT, delivery_info TEXT,
      meta_title TEXT, meta_description TEXT, focus_keywords TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL,
      url TEXT NOT NULL, alt TEXT, sort_order INTEGER DEFAULT 0,
      is_primary INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL,
      name TEXT NOT NULL, sku TEXT,
      price REAL NOT NULL, original_price REAL,
      stock INTEGER DEFAULT 0, in_stock INTEGER DEFAULT 1,
      attributes JSONB NOT NULL DEFAULT '{}',
      image TEXT, sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS product_variant_options (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL,
      option_name TEXT NOT NULL, option_values JSONB NOT NULL DEFAULT '[]',
      sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS user_addresses (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      label TEXT DEFAULT 'Home', name TEXT NOT NULL,
      phone TEXT NOT NULL, address TEXT NOT NULL,
      city TEXT NOT NULL, state TEXT NOT NULL, pin TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS returns (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL, order_number TEXT,
      user_id TEXT, reason TEXT NOT NULL, type TEXT DEFAULT 'return',
      status TEXT DEFAULT 'requested', refund_amount REAL,
      refund_method TEXT DEFAULT 'original', admin_notes TEXT,
      images JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS wishlists (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, product_id TEXT NOT NULL,
      notify_price_drop INTEGER DEFAULT 0, notify_back_in_stock INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    );
    CREATE TABLE IF NOT EXISTS abandoned_carts (
      id TEXT PRIMARY KEY, user_id TEXT, email TEXT, phone TEXT,
      items JSONB NOT NULL, total REAL, reminder_sent INTEGER DEFAULT 0,
      recovered INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS wallet (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE,
      balance REAL DEFAULT 0, updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      type TEXT NOT NULL, amount REAL NOT NULL,
      description TEXT, ref_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY, referrer_id TEXT NOT NULL,
      referred_email TEXT, referred_id TEXT,
      code TEXT UNIQUE NOT NULL,
      reward_amount REAL DEFAULT 500,
      status TEXT DEFAULT 'pending',
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
      views INTEGER DEFAULT 0, reading_time INTEGER DEFAULT 0,
      og_image TEXT, canonical_url TEXT,
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
      temperature REAL DEFAULT 0.7, max_tokens INTEGER DEFAULT 1024,
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
      review TEXT, images JSONB DEFAULT '[]', verified_purchase INTEGER DEFAULT 0,
      helpful_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS product_questions (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL, user_id TEXT,
      customer_name TEXT NOT NULL, question TEXT NOT NULL,
      answer TEXT, answered_by TEXT, answered_at TIMESTAMPTZ,
      status TEXT DEFAULT 'pending', votes INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id TEXT PRIMARY KEY, user_id TEXT,
      endpoint TEXT NOT NULL UNIQUE, keys JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
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

  // Migrations — add missing columns
  const migrations = [
    "ALTER TABLE evolution_settings ADD COLUMN IF NOT EXISTS default_instance TEXT DEFAULT ''",
    "ALTER TABLE evolution_settings ADD COLUMN IF NOT EXISTS webhook_secret TEXT",
    "ALTER TABLE evolution_settings ADD COLUMN IF NOT EXISTS is_visible_to_admin INTEGER DEFAULT 0",
    "UPDATE ai_agent_settings SET max_tokens=1024 WHERE id='main' AND max_tokens<=500",
    "ALTER TABLE media ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'image'",
    "ALTER TABLE media ADD COLUMN IF NOT EXISTS folder TEXT DEFAULT 'general'",
    "ALTER TABLE media ADD COLUMN IF NOT EXISTS alt TEXT",
    // CMS Pages (static content)
    `CREATE TABLE IF NOT EXISTS cms_pages (
      id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
      content TEXT, meta_title TEXT, meta_description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS homepage_sections (
      id TEXT PRIMARY KEY, type TEXT NOT NULL,
      title TEXT, subtitle TEXT, config JSONB DEFAULT '{}',
      sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS menus (
      id TEXT PRIMARY KEY, location TEXT NOT NULL,
      items JSONB NOT NULL DEFAULT '[]',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY, title TEXT, subtitle TEXT,
      image TEXT NOT NULL, link TEXT, button_text TEXT,
      position TEXT DEFAULT 'homepage',
      sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
      starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY, question TEXT NOT NULL, answer TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS popups (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT,
      image TEXT, button_text TEXT, button_link TEXT,
      type TEXT DEFAULT 'modal', trigger_type TEXT DEFAULT 'delay',
      trigger_value TEXT DEFAULT '5',
      show_on TEXT DEFAULT 'all', is_active INTEGER DEFAULT 1,
      starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    // Social — YouTube + TikTok support
    "ALTER TABLE social_settings ADD COLUMN IF NOT EXISTS youtube_api_key TEXT",
    "ALTER TABLE social_settings ADD COLUMN IF NOT EXISTS youtube_channel_id TEXT",
    "ALTER TABLE social_settings ADD COLUMN IF NOT EXISTS tiktok_access_token TEXT",
    "ALTER TABLE social_settings ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS show_public INTEGER DEFAULT 1",
    "ALTER TABLE job_cards ADD COLUMN IF NOT EXISTS timer_start TIMESTAMPTZ",
    `CREATE TABLE IF NOT EXISTS crm_tasks (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, type TEXT DEFAULT 'task',
      lead_id TEXT, assigned_to TEXT, due_date DATE, due_time TEXT,
      notes TEXT, priority TEXT DEFAULT 'normal',
      status TEXT DEFAULT 'pending', completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY, module TEXT NOT NULL, ref_id TEXT,
      title TEXT NOT NULL, amount REAL DEFAULT 0,
      requested_by TEXT, approver_role TEXT DEFAULT 'manager',
      data JSONB DEFAULT '{}', status TEXT DEFAULT 'pending',
      approved_by TEXT, notes TEXT, approved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY, date DATE NOT NULL,
      description TEXT, ref_module TEXT, ref_id TEXT,
      total_amount REAL DEFAULT 0, created_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS ledger (
      id TEXT PRIMARY KEY, entry_id TEXT NOT NULL,
      account TEXT NOT NULL, type TEXT NOT NULL,
      amount REAL NOT NULL, date DATE NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    "ALTER TABLE job_cards ADD COLUMN IF NOT EXISTS timer_running INTEGER DEFAULT 0",
    "ALTER TABLE job_cards ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0",
    "ALTER TABLE job_cards ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ",
    "ALTER TABLE job_cards ADD COLUMN IF NOT EXISTS escalated INTEGER DEFAULT 0",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS emergency_contact TEXT",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS bank_account TEXT",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS pan TEXT",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS aadhar TEXT",
    "ALTER TABLE categories ADD COLUMN IF NOT EXISTS category_type TEXT DEFAULT 'ecommerce'",
    "ALTER TABLE custom_invoices ADD COLUMN IF NOT EXISTS due_date DATE",
    "ALTER TABLE custom_invoices ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'flat'",
    "ALTER TABLE custom_invoices ADD COLUMN IF NOT EXISTS advance_paid NUMERIC DEFAULT 0",
    "ALTER TABLE reels ADD COLUMN IF NOT EXISTS external_id TEXT",
    "ALTER TABLE reels ADD COLUMN IF NOT EXISTS caption TEXT",
    "ALTER TABLE reels ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0",
    "ALTER TABLE reels ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ",
    "ALTER TABLE reels ADD COLUMN IF NOT EXISTS auto_synced INTEGER DEFAULT 0",
    // ERP — Job Cards columns on service_bookings
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS technician TEXT",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS diagnosis TEXT",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS parts_used JSONB DEFAULT '[]'",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS labour_charge REAL DEFAULT 0",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS parts_charge REAL DEFAULT 0",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS total_charge REAL DEFAULT 0",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS payment_method TEXT",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal'",
    // ERP — Expenses
    `CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY, category TEXT NOT NULL, amount REAL NOT NULL,
      description TEXT, payment_method TEXT DEFAULT 'cash',
      date DATE DEFAULT CURRENT_DATE, receipt_url TEXT,
      status TEXT DEFAULT 'pending', approved_by TEXT, approved_at TIMESTAMPTZ,
      branch_id TEXT, staff_id TEXT,
      created_by TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    // ERP — Staff
    `CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT, phone TEXT, email TEXT,
      salary REAL DEFAULT 0, joining_date DATE, address TEXT,
      is_active INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    // Multi-Branch
    `CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, address TEXT, phone TEXT,
      manager TEXT, is_active INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    // Branch-wise stock
    `CREATE TABLE IF NOT EXISTS branch_stock (
      id TEXT PRIMARY KEY, branch_id TEXT NOT NULL, product_id TEXT NOT NULL,
      stock INTEGER DEFAULT 0, reorder_level INTEGER DEFAULT 5,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(branch_id, product_id)
    )`,
    `CREATE TABLE IF NOT EXISTS branch_stock_movements (
      id TEXT PRIMARY KEY, branch_id TEXT NOT NULL, product_id TEXT NOT NULL,
      type TEXT NOT NULL, qty INTEGER NOT NULL, note TEXT,
      ref_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS branch_id TEXT",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS branch_id TEXT",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_charge REAL DEFAULT 0",
    "ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS branch_id TEXT",
    // CRM tables
    `CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT, email TEXT,
      source TEXT DEFAULT 'whatsapp', interest TEXT, budget REAL,
      status TEXT DEFAULT 'new', priority TEXT DEFAULT 'normal',
      assigned_to TEXT, notes TEXT, next_followup DATE,
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS followups (
      id TEXT PRIMARY KEY, lead_id TEXT NOT NULL, type TEXT DEFAULT 'call',
      notes TEXT, outcome TEXT, next_date DATE,
      created_by TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS lead_activities (
      id TEXT PRIMARY KEY, lead_id TEXT NOT NULL, type TEXT DEFAULT 'note',
      note TEXT, created_by TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS crm_automations (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, trigger_type TEXT NOT NULL,
      trigger_conditions JSONB DEFAULT '{}',
      action_type TEXT NOT NULL, action_config JSONB DEFAULT '{}',
      is_active INTEGER DEFAULT 1, run_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS email_campaigns (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, subject TEXT NOT NULL,
      body TEXT NOT NULL, recipients TEXT DEFAULT 'all',
      filter_conditions JSONB DEFAULT '{}',
      status TEXT DEFAULT 'draft', sent_count INTEGER DEFAULT 0,
      open_count INTEGER DEFAULT 0, click_count INTEGER DEFAULT 0,
      scheduled_at TIMESTAMPTZ, sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, contact_person TEXT, phone TEXT, email TEXT,
      address TEXT, gstin TEXT, payment_terms TEXT DEFAULT 'net30',
      notes TEXT, is_active INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY, po_number TEXT UNIQUE NOT NULL, supplier_id TEXT,
      status TEXT DEFAULT 'draft', items JSONB DEFAULT '[]',
      subtotal REAL DEFAULT 0, tax REAL DEFAULT 0, total REAL DEFAULT 0,
      expected_date DATE, received_date DATE, notes TEXT,
      created_by TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL, type TEXT NOT NULL,
      quantity INTEGER NOT NULL, reference_id TEXT, reference_type TEXT,
      notes TEXT, created_by TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS inventory_alerts (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL, alert_type TEXT DEFAULT 'low_stock',
      threshold INTEGER DEFAULT 5, is_active INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    // Unified Billing — custom invoices
    `CREATE TABLE IF NOT EXISTS custom_invoices (
      id TEXT PRIMARY KEY, invoice_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL, customer_phone TEXT, customer_email TEXT,
      items JSONB DEFAULT '[]', subtotal REAL DEFAULT 0, discount REAL DEFAULT 0,
      total REAL DEFAULT 0, notes TEXT, gst_enabled INTEGER DEFAULT 0,
      payment_status TEXT DEFAULT 'pending', payment_method TEXT DEFAULT 'cash',
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    "ALTER TABLE custom_invoices ADD COLUMN IF NOT EXISTS gst_enabled INTEGER DEFAULT 0",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS gst_enabled INTEGER DEFAULT 0",
    // Sprint 1
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 5",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS reminder_sent INTEGER DEFAULT 0",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS reminder_sent INTEGER DEFAULT 0",
    "ALTER TABLE custom_invoices ADD COLUMN IF NOT EXISTS reminder_sent INTEGER DEFAULT 0",
    // Sprint 2
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS warranty_days INTEGER DEFAULT 0",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS warranty_expires_at DATE",
    `CREATE TABLE IF NOT EXISTS job_card_timeline (
      id TEXT PRIMARY KEY, job_id TEXT NOT NULL, status TEXT NOT NULL,
      notes TEXT, created_by TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY, staff_id TEXT NOT NULL, date DATE NOT NULL,
      status TEXT DEFAULT 'present', check_in TIME, check_out TIME,
      notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(staff_id, date)
    )`,
    `CREATE TABLE IF NOT EXISTS whatsapp_templates (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT DEFAULT 'general',
      message TEXT NOT NULL, variables TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    // Sprint 3
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS photos_before TEXT DEFAULT '[]'",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS photos_after TEXT DEFAULT '[]'",
    `CREATE TABLE IF NOT EXISTS invoice_payments (
      id TEXT PRIMARY KEY, invoice_type TEXT NOT NULL, invoice_id TEXT NOT NULL,
      amount REAL NOT NULL, payment_method TEXT DEFAULT 'cash',
      notes TEXT, created_by TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    // Sprint 6 — SLA, Recurring Invoices, Product Bundles
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS sla_hours INTEGER DEFAULT 24",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS sla_breached INTEGER DEFAULT 0",
    // E-Invoice IRN columns
    "ALTER TABLE custom_invoices ADD COLUMN IF NOT EXISTS irn TEXT",
    "ALTER TABLE custom_invoices ADD COLUMN IF NOT EXISTS ack_no TEXT",
    "ALTER TABLE custom_invoices ADD COLUMN IF NOT EXISTS ack_date TEXT",
    "ALTER TABLE custom_invoices ADD COLUMN IF NOT EXISTS irn_status TEXT DEFAULT 'pending'",
    "ALTER TABLE custom_invoices ADD COLUMN IF NOT EXISTS qr_code TEXT",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS irn TEXT",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS ack_no TEXT",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS ack_date TEXT",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS irn_status TEXT DEFAULT 'pending'",
    `CREATE TABLE IF NOT EXISTS recurring_invoices (
      id TEXT PRIMARY KEY, customer_name TEXT NOT NULL, customer_phone TEXT,
      customer_email TEXT, items JSONB DEFAULT '[]', subtotal REAL DEFAULT 0,
      discount REAL DEFAULT 0, total REAL DEFAULT 0, gst_enabled INTEGER DEFAULT 0,
      payment_method TEXT DEFAULT 'cash', notes TEXT,
      frequency TEXT DEFAULT 'monthly', next_date DATE NOT NULL,
      last_generated DATE, is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS product_bundles (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
      price REAL NOT NULL, components JSONB DEFAULT '[]',
      is_active INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    // Sprint 7 — Payroll
    `CREATE TABLE IF NOT EXISTS payroll (      id TEXT PRIMARY KEY, staff_id TEXT NOT NULL, month TEXT NOT NULL,
      basic REAL DEFAULT 0, hra REAL DEFAULT 0, allowances REAL DEFAULT 0,
      pf_employee REAL DEFAULT 0, pf_employer REAL DEFAULT 0,
      esi_employee REAL DEFAULT 0, esi_employer REAL DEFAULT 0,
      tds REAL DEFAULT 0, advance_deduction REAL DEFAULT 0, other_deduction REAL DEFAULT 0,
      gross REAL DEFAULT 0, net REAL DEFAULT 0,
      working_days INTEGER DEFAULT 26, present_days INTEGER DEFAULT 26,
      status TEXT DEFAULT 'draft', paid_on TEXT, notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS staff_advances (
      id TEXT PRIMARY KEY, staff_id TEXT NOT NULL, amount REAL NOT NULL,
      month TEXT, reason TEXT, deducted INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    // Sprint 5 — Leave Management + Serial Numbers + Commission
    `CREATE TABLE IF NOT EXISTS leave_requests (      id TEXT PRIMARY KEY, staff_id TEXT NOT NULL, type TEXT DEFAULT 'casual',
      from_date DATE NOT NULL, to_date DATE NOT NULL, days INTEGER DEFAULT 1,
      reason TEXT, status TEXT DEFAULT 'pending', approved_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS serial_numbers (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL, serial TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'in_stock', job_card_id TEXT, order_id TEXT,
      notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS commissions (
      id TEXT PRIMARY KEY, staff_id TEXT NOT NULL, staff_name TEXT,
      reference_type TEXT NOT NULL, reference_id TEXT NOT NULL,
      amount REAL NOT NULL, rate REAL DEFAULT 0, status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    // CRM enhancements
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS expected_close DATE",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS lost_reason TEXT",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '[]'",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS deal_value REAL DEFAULT 0",
    // Multi-branch Phase A
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS branch_id TEXT",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS aadhaar_url TEXT",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS pan_url TEXT",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS offer_letter_url TEXT",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS other_doc_url TEXT",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS bank_account TEXT",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS bank_ifsc TEXT",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS bank_name TEXT",
    "ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS branch_id TEXT",
    `CREATE TABLE IF NOT EXISTS shifts (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, start_time TEXT NOT NULL,
      end_time TEXT NOT NULL, branch_id TEXT, is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS shift_id TEXT",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS photo_url TEXT",
    `CREATE TABLE IF NOT EXISTS user_wishlist (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, product_id TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    )`,
    `CREATE TABLE IF NOT EXISTS lead_assignment_rules (
      id TEXT PRIMARY KEY, source TEXT NOT NULL, assigned_to TEXT NOT NULL,
      branch_id TEXT, is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY, user_id TEXT, user_name TEXT,
      action TEXT NOT NULL, module TEXT NOT NULL, record_id TEXT,
      old_data JSONB, new_data JSONB, ip TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS salary_history (
      id TEXT PRIMARY KEY, staff_id TEXT NOT NULL, old_salary REAL, new_salary REAL,
      changed_by TEXT, reason TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    "ALTER TABLE expenses ADD COLUMN IF NOT EXISTS branch_id TEXT",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS branch_id TEXT",
    "ALTER TABLE custom_invoices ADD COLUMN IF NOT EXISTS branch_id TEXT",
    "ALTER TABLE attendance ADD COLUMN IF NOT EXISTS branch_id TEXT",
    "ALTER TABLE payroll ADD COLUMN IF NOT EXISTS branch_id TEXT",
    // Customer approval + KPI alerts + Loyalty
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'not_sent'",
    "ALTER TABLE service_bookings ADD COLUMN IF NOT EXISTS payment_link TEXT",
    "ALTER TABLE custom_invoices ADD COLUMN IF NOT EXISTS payment_link TEXT",
    "ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT",
    `CREATE TABLE IF NOT EXISTS recurring_expenses (
      id TEXT PRIMARY KEY, category TEXT NOT NULL, amount REAL NOT NULL,
      description TEXT, payment_method TEXT DEFAULT 'cash', branch_id TEXT,
      frequency TEXT DEFAULT 'monthly', next_date DATE NOT NULL,
      last_generated DATE, is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS saved_reports (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, source TEXT NOT NULL,
      fields JSONB DEFAULT '[]', filters JSONB DEFAULT '[]',
      sort_by TEXT, sort_dir TEXT DEFAULT 'DESC',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,    `CREATE TABLE IF NOT EXISTS kpi_alerts (
      id TEXT PRIMARY KEY, metric TEXT NOT NULL, operator TEXT DEFAULT 'lt',
      threshold REAL NOT NULL, message TEXT, is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS loyalty_points (
      id TEXT PRIMARY KEY, phone TEXT UNIQUE NOT NULL, customer_name TEXT,
      points INTEGER DEFAULT 0, total_earned INTEGER DEFAULT 0, total_redeemed INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS loyalty_transactions (
      id TEXT PRIMARY KEY, phone TEXT NOT NULL, type TEXT NOT NULL,
      points INTEGER NOT NULL, ref_id TEXT, ref_type TEXT, note TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
  ];
  for (const m of migrations) {
    try { await pool.query(m); } catch {}
  }

  // Seed branches
  await seedBranches();
  // Seed branch stock
  await seedBranchStock();

  console.log('✅ PostgreSQL tables ready');
};

async function seedBranches() {
  const existing = await pool.query('SELECT COUNT(*) as c FROM branches');
  if (parseInt(existing.rows[0].c) > 0) return;
  const branches = [
    { id: 'branch-silver-mall', name: 'Silver Mall', address: 'Silver Mall, Vijay Nagar, Indore', phone: '9893496163', manager: 'Owner' },
    { id: 'branch-bangali', name: 'Bangali Chouraha', address: 'Bangali Chouraha, Indore', phone: '9893496163', manager: 'Manager' },
  ];
  for (const b of branches) {
    try { await pool.query('INSERT INTO branches (id,name,address,phone,manager) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING', [b.id, b.name, b.address, b.phone, b.manager]); } catch {}
  }
  console.log('✅ Branches seeded');
}

async function seedBranchStock() {
  const existing = await pool.query('SELECT COUNT(*) as c FROM branch_stock');
  if (parseInt(existing.rows[0].c) > 0) return;
  const products = await pool.query('SELECT id FROM products LIMIT 20');
  const branches = await pool.query('SELECT id FROM branches');
  const { v4: uuid } = await import('uuid');
  for (const b of branches.rows) {
    for (const p of products.rows) {
      const stock = Math.floor(Math.random() * 20) + 2;
      try {
        await pool.query('INSERT INTO branch_stock (id,branch_id,product_id,stock,reorder_level) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
          [uuid(), b.id, p.id, stock, 5]);
      } catch {}
    }
  }
  console.log('✅ Branch stock seeded');
}

export default db;

import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Safely add a column only if it doesn't exist
async function addColumnIfMissing(table, column, definition) {
  const res = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = $1 AND column_name = $2
  `, [table, column]);

  if (res.rows.length === 0) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`✅ Added column: ${table}.${column}`);
  } else {
    console.log(`⏩ Already exists: ${table}.${column}`);
  }
}

async function run() {
  console.log('🔄 Running migrations...\n');

  // products table — missing columns
  await addColumnIfMissing('products', 'brand', 'TEXT');
  await addColumnIfMissing('products', 'sort_order', 'INTEGER DEFAULT 0');
  await addColumnIfMissing('products', 'is_active', 'INTEGER DEFAULT 1');
  await addColumnIfMissing('products', 'has_variants', 'INTEGER DEFAULT 0');
  await addColumnIfMissing('products', 'images', 'TEXT');
  await addColumnIfMissing('products', 'tags', 'TEXT');
  await addColumnIfMissing('products', 'weight', 'REAL');
  await addColumnIfMissing('products', 'branch', 'TEXT DEFAULT \'Silver Mall\'');
  await addColumnIfMissing('products', 'featured', 'INTEGER DEFAULT 0');
  await addColumnIfMissing('products', 'deal_of_day', 'INTEGER DEFAULT 0');
  await addColumnIfMissing('products', 'deal_ends_at', 'TIMESTAMPTZ');
  await addColumnIfMissing('products', 'notify_emails', 'TEXT');
  await addColumnIfMissing('products', 'barcode', 'TEXT');
  await addColumnIfMissing('products', 'hsn_code', 'TEXT');
  await addColumnIfMissing('products', 'gst_rate', 'REAL DEFAULT 18');
  await addColumnIfMissing('products', 'warranty', 'TEXT');
  await addColumnIfMissing('products', 'specs', 'TEXT');
  await addColumnIfMissing('products', 'processor', 'TEXT');
  await addColumnIfMissing('products', 'ram', 'TEXT');
  await addColumnIfMissing('products', 'storage', 'TEXT');
  await addColumnIfMissing('products', 'display', 'TEXT');
  await addColumnIfMissing('products', 'updated_at', 'TIMESTAMPTZ DEFAULT NOW()');

  // categories table
  await addColumnIfMissing('categories', 'sort_order', 'INTEGER DEFAULT 0');
  await addColumnIfMissing('categories', 'parent_id', 'TEXT');
  await addColumnIfMissing('categories', 'icon', 'TEXT');
  await addColumnIfMissing('categories', 'meta_title', 'TEXT');
  await addColumnIfMissing('categories', 'meta_description', 'TEXT');

  // cms_content table
  await addColumnIfMissing('cms_content', 'sort_order', 'INTEGER DEFAULT 0');
  await addColumnIfMissing('cms_content', 'is_active', 'INTEGER DEFAULT 1');

  // coupons table — column name mismatch fix
  await addColumnIfMissing('coupons', 'discount_type', "TEXT DEFAULT 'percentage'");
  await addColumnIfMissing('coupons', 'discount_value', 'REAL DEFAULT 0');
  await addColumnIfMissing('coupons', 'type', "TEXT DEFAULT 'percentage'");
  await addColumnIfMissing('coupons', 'value', 'REAL DEFAULT 0');
  await addColumnIfMissing('coupons', 'description', 'TEXT');
  // Sync discount_type ↔ type (in case one was filled and other is null)
  await pool.query(`UPDATE coupons SET discount_type = type WHERE discount_type IS NULL AND type IS NOT NULL`);
  await pool.query(`UPDATE coupons SET type = discount_type WHERE type IS NULL AND discount_type IS NOT NULL`);
  await pool.query(`UPDATE coupons SET discount_value = value WHERE discount_value = 0 AND value IS NOT NULL AND value > 0`);
  await pool.query(`UPDATE coupons SET value = discount_value WHERE value = 0 AND discount_value IS NOT NULL AND discount_value > 0`);
  console.log('✅ Coupons columns synced');

  // blog_posts table
  await addColumnIfMissing('blog_posts', 'views', 'INTEGER DEFAULT 0');
  await addColumnIfMissing('blog_posts', 'reading_time', 'INTEGER DEFAULT 0');
  await addColumnIfMissing('blog_posts', 'updated_at', 'TIMESTAMPTZ DEFAULT NOW()');

  // orders table
  await addColumnIfMissing('orders', 'shipping_charge', 'REAL DEFAULT 0');
  await addColumnIfMissing('orders', 'wallet_used', 'REAL DEFAULT 0');
  await addColumnIfMissing('orders', 'store_credit_used', 'REAL DEFAULT 0');
  await addColumnIfMissing('orders', 'notes', 'TEXT');
  await addColumnIfMissing('orders', 'updated_at', 'TIMESTAMPTZ DEFAULT NOW()');
  await addColumnIfMissing('orders', 'cancelled_at', 'TIMESTAMPTZ');
  await addColumnIfMissing('orders', 'cancel_reason', 'TEXT');
  await addColumnIfMissing('orders', 'delivered_at', 'TIMESTAMPTZ');

  // users table
  await addColumnIfMissing('users', 'google_id', 'TEXT');
  await addColumnIfMissing('users', 'avatar', 'TEXT');
  await addColumnIfMissing('users', 'wallet_balance', 'REAL DEFAULT 0');
  await addColumnIfMissing('users', 'store_credit', 'REAL DEFAULT 0');
  await addColumnIfMissing('users', 'referral_code', 'TEXT');
  await addColumnIfMissing('users', 'referred_by', 'TEXT');
  await addColumnIfMissing('users', 'updated_at', 'TIMESTAMPTZ DEFAULT NOW()');

  // notifications table
  await addColumnIfMissing('notifications', 'user_id', 'TEXT');
  await addColumnIfMissing('notifications', 'link', 'TEXT');
  await addColumnIfMissing('notifications', 'data', 'TEXT');

  // media table
  await addColumnIfMissing('media', 'folder', 'TEXT DEFAULT \'uploads\'');

  console.log('\n✅ Migration complete!');
  await pool.end();
}

run().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});

// Central config — DB-first, env fallback
// All admin-configurable values go through this helper
// Caches for 30 seconds to reduce DB hits

import db from '../db/database.js';

const cache = new Map();
const CACHE_TTL = 30000; // 30s

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.t < CACHE_TTL) return entry.v;
  return undefined;
}
function setCached(key, value) { cache.set(key, { v: value, t: Date.now() }); }

export function invalidateCache(key) {
  if (key) cache.delete(key); else cache.clear();
}

// Generic getter: DB → env → default
export async function getConfig(dbKey, envKey, defaultValue = '') {
  const cached = getCached(dbKey);
  if (cached !== undefined) return cached;

  try {
    const row = await db.prepare('SELECT value FROM app_settings WHERE key=?').get(dbKey);
    const value = row?.value || process.env[envKey] || defaultValue;
    setCached(dbKey, value);
    return value;
  } catch {
    return process.env[envKey] || defaultValue;
  }
}

// ── Convenience getters (most-used settings) ─────────────

export const Config = {
  // URLs
  frontendUrl: () => getConfig('site_url', 'FRONTEND_URL', 'https://ailaptopwala.com'),
  backendUrl: () => getConfig('backend_url', 'BACKEND_URL', 'http://localhost:5000'),

  // Owner / contact
  ownerPhone: () => getConfig('owner_phone', 'OWNER_PHONE', '9893496163'),
  siteEmail: () => getConfig('site_email', 'SMTP_FROM', 'info@ailaptopwala.com'),

  // E-Invoice (GST)
  einvoiceBase: () => getConfig('einvoice_base', 'EINVOICE_BASE', 'https://einv-apisandbox.nic.in'),
  einvoiceGstin: () => getConfig('einvoice_gstin', 'EINVOICE_GSTIN', '23AABCU9603R1ZX'),
  einvoiceUsername: () => getConfig('einvoice_username', 'EINVOICE_USERNAME'),
  einvoicePassword: () => getConfig('einvoice_password', 'EINVOICE_PASSWORD'),
  einvoiceAppKey: () => getConfig('einvoice_appkey', 'EINVOICE_APPKEY'),
  einvoiceEnabled: async () => {
    const val = await getConfig('einvoice_enabled', null, 'false');
    return val === 'true';
  },

  // Supabase (optional, for storage)
  supabaseUrl: () => getConfig('supabase_url', 'SUPABASE_URL'),
  supabaseKey: () => getConfig('supabase_service_key', 'SUPABASE_SERVICE_KEY'),

  // Razorpay (already in API Keys UI, but exposed here for consistency)
  razorpayKeyId: () => getConfig('razorpay_key_id', 'RAZORPAY_KEY_ID'),
  razorpayKeySecret: () => getConfig('razorpay_key_secret', 'RAZORPAY_KEY_SECRET'),
};

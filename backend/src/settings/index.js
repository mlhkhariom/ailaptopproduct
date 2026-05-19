import db from '../db/database.js';

// Cached settings with TTL
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

export async function getSetting(key, fallback = '') {
  const all = await getAllSettings();
  return all[key] || fallback;
}

export async function getAllSettings() {
  if (cache && Date.now() - cacheTime < CACHE_TTL) return cache;
  const rows = await db.prepare('SELECT key, value FROM app_settings').all();
  cache = Object.fromEntries(rows.map(r => [r.key, r.value]));
  cacheTime = Date.now();
  return cache;
}

export function invalidateCache() { cache = null; }

export async function setSetting(key, value) {
  await db.prepare('INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()').run(key, String(value));
  invalidateCache();
}

export async function isModuleEnabled(moduleKey) {
  const val = await getSetting(moduleKey, '1');
  return val !== '0';
}

import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly, superAdminOnly } from '../middleware/adminOnly.js';

const router = Router();

// Ensure table exists with all needed keys
db.exec(`CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  updated_at TEXT DEFAULT (datetime('now'))
)`);

// Seed defaults
const defaults = [
  // General
  ['store_name', 'Apsoncure PHC – Prachi Homeo Clinic', 'general'],
  ['store_tagline', "Nature's Power, Modern Science", 'general'],
  ['store_email', 'info@apsoncure.com', 'general'],
  ['store_phone', '+91 98765 43210', 'general'],
  ['store_website', 'https://apsoncure.com', 'general'],
  ['store_address', 'Prachi Homeo Clinic, Ayurvedic Wing, India', 'general'],
  // Shipping
  ['shipping_flat_rate', '50', 'shipping'],
  ['shipping_free_above', '499', 'shipping'],
  ['shipping_express', '150', 'shipping'],
  ['shipping_cod_charge', '30', 'shipping'],
  ['shipping_courier', 'dtdc', 'shipping'],
  ['gst_rate', '8', 'shipping'],
  ['gstin', '', 'shipping'],
  // Payments
  ['currency', 'INR', 'payments'],
  ['min_order', '199', 'payments'],
  ['max_cod', '5000', 'payments'],
  ['payment_upi', 'true', 'payments'],
  ['payment_card', 'true', 'payments'],
  ['payment_netbanking', 'true', 'payments'],
  ['payment_wallet', 'false', 'payments'],
  ['payment_cod', 'true', 'payments'],
  ['payment_emi', 'false', 'payments'],
  // SEO
  ['seo_title', 'Apsoncure PHC | Authentic Ayurvedic Products Online', 'seo'],
  ['seo_description', 'Shop authentic Ayurvedic products from Prachi Homeo Clinic.', 'seo'],
  ['seo_keywords', 'ayurvedic products, herbal medicine, natural remedies', 'seo'],
  ['og_title', 'Apsoncure – Ancient Ayurvedic Wisdom', 'seo'],
  ['og_description', 'Authentic Ayurvedic products for modern health.', 'seo'],
  ['twitter_handle', '@apsoncure', 'seo'],
];

const insertDefault = db.prepare('INSERT OR IGNORE INTO app_settings (key, value, category) VALUES (?,?,?)');
defaults.forEach(([k, v, c]) => insertDefault.run(k, v, c));

// GET /api/app-settings?category=general
router.get('/', (req, res) => {
  const { category } = req.query;
  let q = 'SELECT key, value, category FROM app_settings WHERE 1=1';
  const params = [];
  if (category) { q += ' AND category = ?'; params.push(category); }
  const rows = db.prepare(q).all(...params);
  const result = Object.fromEntries(rows.map(r => [r.key, r.value]));
  res.json(result);
});

// PUT /api/app-settings — admin
router.put('/', authMiddleware, adminOnly, (req, res) => {
  const update = db.prepare("INSERT OR REPLACE INTO app_settings (key, value, category, updated_at) VALUES (?, ?, COALESCE((SELECT category FROM app_settings WHERE key=?), 'general'), datetime('now'))");
  const updateMany = db.transaction((settings) => {
    for (const [key, value] of Object.entries(settings)) {
      update.run(key, String(value), key);
    }
  });
  updateMany(req.body);
  res.json({ message: 'Settings saved' });
});

export default router;

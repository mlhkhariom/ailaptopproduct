import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly, superAdminOnly } from '../middleware/adminOnly.js';

const router = Router();


// GET /api/app-settings?category=general
router.get('/', async (req, res) => {
  const { category } = req.query;
  let q = 'SELECT key, value, category FROM app_settings WHERE 1=1';
  const params = [];
  if (category) { q += ' AND category = ?'; params.push(category); }
  const rows = await db.prepare(q).all(...params);
  const result = Object.fromEntries(rows.map(r => [r.key, r.value]));
  res.json(result);
});

// PUT /api/app-settings — admin
router.put('/', authMiddleware, adminOnly, async (req, res) => {
  const update = await db.prepare("INSERT OR REPLACE INTO app_settings (key, value, category, updated_at) VALUES (?, ?, COALESCE((SELECT category FROM app_settings WHERE key=?), 'general'), datetime('now'))");
  for (const [key, value] of Object.entries(req.body)) {
    await update.run(key, String(value), key);
  }
  res.json({ message: 'Settings saved' });
});

export default router;

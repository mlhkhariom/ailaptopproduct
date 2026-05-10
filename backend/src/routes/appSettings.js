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
  for (const [key, value] of Object.entries(req.body)) {
    await db.prepare(`INSERT INTO app_settings (key, value, category, updated_at) VALUES (?, ?, 'general', NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`).run(key, String(value));
  }
  res.json({ message: 'Settings saved' });
});

export default router;

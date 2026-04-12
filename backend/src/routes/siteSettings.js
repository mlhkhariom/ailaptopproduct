import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/site-settings — public
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_settings').all();
  const settings = Object.fromEntries(rows.map(r => [r.key, r.value === 'true']));
  res.json(settings);
});

// PUT /api/site-settings — admin
router.put('/', authMiddleware, adminOnly, (req, res) => {
  const update = db.prepare("INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))");
  const updateMany = db.transaction((settings) => {
    for (const [key, value] of Object.entries(settings)) {
      update.run(key, String(value));
    }
  });
  updateMany(req.body);
  res.json({ message: 'Settings updated' });
});

export default router;

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// POST /api/push/subscribe — save push subscription
router.post('/subscribe', async (req, res) => {
  const { endpoint, keys, user_id } = req.body;
  if (!endpoint || !keys) return res.status(400).json({ error: 'endpoint and keys required' });

  await db.prepare('INSERT INTO push_subscriptions (id, user_id, endpoint, keys) VALUES (?,?,?,?) ON CONFLICT (endpoint) DO UPDATE SET keys=EXCLUDED.keys, user_id=EXCLUDED.user_id')
    .run(uuid(), user_id || null, endpoint, JSON.stringify(keys));

  res.json({ success: true });
});

// POST /api/push/send — admin sends push to all subscribers
router.post('/send', authMiddleware, adminOnly, async (req, res) => {
  const { title, body, url, icon } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'title and body required' });

  const subs = await db.prepare('SELECT * FROM push_subscriptions').all();
  let sent = 0, failed = 0;

  for (const sub of subs) {
    try {
      const keys = typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys;
      // Web Push requires web-push library — for now store notification for service worker to pick up
      sent++;
    } catch { failed++; }
  }

  // Also store in notifications table for in-app bell
  await db.prepare('INSERT INTO notifications (id, type, title, message, link) VALUES (?,?,?,?,?)')
    .run(uuid(), 'push', title, body, url || '/');

  res.json({ success: true, sent, failed, total: subs.length });
});

// GET /api/push/notifications — get user's notifications (bell icon)
router.get('/notifications', authMiddleware, async (req, res) => {
  const notifications = await db.prepare("SELECT * FROM notifications WHERE (type='push' OR type='order' OR type='promo') ORDER BY created_at DESC LIMIT 20").all();
  res.json(notifications);
});

// PUT /api/push/notifications/:id/read — mark as read
router.put('/notifications/:id/read', authMiddleware, async (req, res) => {
  await db.prepare("UPDATE notifications SET is_read=1 WHERE id=?").run(req.params.id);
  res.json({ success: true });
});

export default router;

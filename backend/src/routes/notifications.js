import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/notifications — admin
router.get('/', authMiddleware, adminOnly, (req, res) => {
  res.json(db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all());
});

// PUT /api/notifications/:id/read — mark read
router.put('/:id/read', authMiddleware, adminOnly, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Marked read' });
});

// PUT /api/notifications/read-all — mark all read
router.put('/read-all', authMiddleware, adminOnly, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1').run();
  res.json({ message: 'All marked read' });
});

export default router;

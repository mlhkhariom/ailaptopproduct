import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/addresses — get user's saved addresses
router.get('/', authMiddleware, async (req, res) => {
  const addresses = await db.prepare('SELECT * FROM user_addresses WHERE user_id=? ORDER BY is_default DESC, created_at DESC').all(req.user.id);
  res.json(addresses);
});

// POST /api/addresses — add new address
router.post('/', authMiddleware, async (req, res) => {
  const { label, name, phone, address, city, state, pin, is_default } = req.body;
  if (!name || !phone || !address || !city || !pin) return res.status(400).json({ error: 'name, phone, address, city, pin required' });

  const id = uuid();
  if (is_default) await db.prepare('UPDATE user_addresses SET is_default=0 WHERE user_id=?').run(req.user.id);

  await db.prepare('INSERT INTO user_addresses (id, user_id, label, name, phone, address, city, state, pin, is_default) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, req.user.id, label || 'Home', name, phone, address, city, state || 'Madhya Pradesh', pin, is_default ? 1 : 0);

  res.status(201).json(await db.prepare('SELECT * FROM user_addresses WHERE id=?').get(id));
});

// PUT /api/addresses/:id — update address
router.put('/:id', authMiddleware, async (req, res) => {
  const existing = await db.prepare('SELECT * FROM user_addresses WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Address not found' });

  const { label, name, phone, address, city, state, pin, is_default } = { ...existing, ...req.body };
  if (is_default) await db.prepare('UPDATE user_addresses SET is_default=0 WHERE user_id=?').run(req.user.id);

  await db.prepare('UPDATE user_addresses SET label=?, name=?, phone=?, address=?, city=?, state=?, pin=?, is_default=? WHERE id=?')
    .run(label, name, phone, address, city, state, pin, is_default ? 1 : 0, req.params.id);

  res.json(await db.prepare('SELECT * FROM user_addresses WHERE id=?').get(req.params.id));
});

// DELETE /api/addresses/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  await db.prepare('DELETE FROM user_addresses WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// PUT /api/addresses/:id/default — set as default
router.put('/:id/default', authMiddleware, async (req, res) => {
  await db.prepare('UPDATE user_addresses SET is_default=0 WHERE user_id=?').run(req.user.id);
  await db.prepare('UPDATE user_addresses SET is_default=1 WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

export default router;

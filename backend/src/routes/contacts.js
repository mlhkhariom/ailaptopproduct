import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// POST /api/contacts — public submit
router.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'name, email, message required' });
  const id = uuid();
  await db.prepare('INSERT INTO contact_queries (id, name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, email, phone, subject, message);
  await db.prepare('INSERT INTO notifications (id, type, title, message, link) VALUES (?, ?, ?, ?, ?)')
    .run(uuid(), 'contact', 'New Contact Query', `${name} ne message bheja: ${subject || message.slice(0, 40)}`, '/admin/contacts');
  res.status(201).json({ message: 'Query submitted' });
});

// GET /api/contacts — admin
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM contact_queries WHERE 1=1';
  const params = [];
  if (status) { query += ' AND status = ?'; params.push(status); }
  query += ' ORDER BY created_at DESC';
  res.json(await db.prepare(query).all(...params));
});

// PUT /api/contacts/:id — admin update status/reply
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { status, reply, priority, starred } = req.body;
  await db.prepare('UPDATE contact_queries SET status=?, reply=?, priority=?, starred=? WHERE id=?').run(status, reply, priority, starred ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

export default router;

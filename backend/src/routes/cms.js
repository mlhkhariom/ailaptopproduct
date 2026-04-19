import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/cms/:section — public (active only)
router.get('/:section', (req, res) => {
  const isAdmin = req.query.admin === '1';
  let q = 'SELECT * FROM cms_content WHERE section = ?';
  if (!isAdmin) q += ' AND is_active = 1';
  q += ' ORDER BY sort_order ASC';
  const items = db.prepare(q).all(req.params.section)
    .map(i => ({ ...i, content: JSON.parse(i.content) }));
  res.json(items);
});

// POST /api/cms — admin add item
router.post('/', authMiddleware, adminOnly, (req, res) => {
  const { section, content, sort_order } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO cms_content (id, section, content, sort_order) VALUES (?, ?, ?, ?)').run(id, section, JSON.stringify(content), sort_order || 0);
  res.status(201).json({ id });
});

// PUT /api/cms/:id — admin update
router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const { content, sort_order, is_active } = req.body;
  db.prepare("UPDATE cms_content SET content=?, sort_order=?, is_active=?, updated_at=datetime('now') WHERE id=?")
    .run(JSON.stringify(content), sort_order, is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/cms/:id — admin
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  db.prepare('DELETE FROM cms_content WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;

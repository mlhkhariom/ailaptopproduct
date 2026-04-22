import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/categories — public
router.get('/', async (req, res) => {
  const cats = await db.prepare(`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON p.category = c.name AND p.status = 'active'
    WHERE c.is_active = 1
    GROUP BY c.id ORDER BY c.name ASC
  `).all();
  res.json(cats);
});

// POST /api/categories — admin
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { name, name_hi, slug, description, image } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  await db.prepare('INSERT INTO categories (id, name, name_hi, slug, description, image) VALUES (?,?,?,?,?,?)')
    .run(id, name, name_hi, slug || name.toLowerCase().replace(/\s+/g, '-'), description, image);
  res.status(201).json(await db.prepare('SELECT * FROM categories WHERE id = ?').get(id));
});

// PUT /api/categories/:id — admin
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, name_hi, slug, description, image, is_active } = req.body;
  await db.prepare('UPDATE categories SET name=?, name_hi=?, slug=?, description=?, image=?, is_active=? WHERE id=?')
    .run(name, name_hi, slug, description, image, is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/categories/:id — admin
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;

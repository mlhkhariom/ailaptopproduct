import { Router } from 'express';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminOnly } from '../../middleware/adminOnly.js';
const router = Router();

// GET /api/menus/:location (header, footer, mobile)
router.get('/:location', async (req, res) => {
  const items = await db.prepare('SELECT * FROM menu_items WHERE location=? ORDER BY sort_order ASC').all(req.params.location);
  res.json(items);
});

// POST /api/menus — add item
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { location, label, url, icon, open_new_tab, is_visible, sort_order } = req.body;
  const id = 'menu-' + Date.now();
  await db.prepare('INSERT INTO menu_items (id, location, label, url, icon, open_new_tab, is_visible, sort_order) VALUES (?,?,?,?,?,?,?,?)').run(id, location || 'header', label, url, icon || '', open_new_tab ? 1 : 0, is_visible !== false ? 1 : 0, sort_order || 0);
  res.status(201).json({ id });
});

// PUT /api/menus/:id
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { label, url, icon, open_new_tab, is_visible, sort_order } = req.body;
  await db.prepare('UPDATE menu_items SET label=?, url=?, icon=?, open_new_tab=?, is_visible=?, sort_order=? WHERE id=?').run(label, url, icon || '', open_new_tab ? 1 : 0, is_visible ? 1 : 0, sort_order || 0, req.params.id);
  res.json({ success: true });
});

// DELETE /api/menus/:id
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM menu_items WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// PUT /api/menus/reorder — bulk update sort_order
router.put('/reorder/bulk', authMiddleware, adminOnly, async (req, res) => {
  const { items } = req.body; // [{id, sort_order}]
  for (const item of items) { await db.prepare('UPDATE menu_items SET sort_order=? WHERE id=?').run(item.sort_order, item.id); }
  res.json({ success: true });
});

export default router;

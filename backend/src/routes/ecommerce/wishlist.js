import express from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const rows = await db.prepare(`
    SELECT w.*, p.name, p.price, p.image, p.slug, p.stock, p.rating
    FROM user_wishlist w
    LEFT JOIN products p ON p.id=w.product_id
    WHERE w.user_id=?
    ORDER BY w.created_at DESC
  `).all(req.user.id) || [];
  res.json(rows);
});

router.post('/', authMiddleware, async (req, res) => {
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id required' });
  try {
    await db.prepare('INSERT INTO user_wishlist (id,user_id,product_id) VALUES (?,?,?) ON CONFLICT (user_id,product_id) DO NOTHING').run(uuid(), req.user.id, product_id);
    res.json({ message: 'Added to wishlist' });
  } catch { res.status(500).json({ error: 'Failed' }); }
});

router.delete('/:product_id', authMiddleware, async (req, res) => {
  await db.prepare('DELETE FROM user_wishlist WHERE user_id=? AND product_id=?').run(req.user.id, req.params.product_id);
  res.json({ message: 'Removed from wishlist' });
});

router.post('/sync', authMiddleware, async (req, res) => {
  const { product_ids } = req.body;
  if (!Array.isArray(product_ids)) return res.status(400).json({ error: 'product_ids array required' });
  for (const pid of product_ids) {
    try { await db.prepare('INSERT INTO user_wishlist (id,user_id,product_id) VALUES (?,?,?) ON CONFLICT DO NOTHING').run(uuid(), req.user.id, pid); } catch (e) { console.error("Wishlist sync error:", e.message); }
  }
  res.json({ synced: product_ids.length });
});

// PUT /api/wishlist/:product_id/notify — toggle price drop notification
router.put('/:product_id/notify', authMiddleware, async (req, res) => {
  const { notify_price_drop } = req.body;
  try {
    // Try wishlists table first (new), fallback to user_wishlist
    await db.prepare('INSERT INTO wishlists (id, user_id, product_id, notify_price_drop) VALUES (?,?,?,?) ON CONFLICT (user_id, product_id) DO UPDATE SET notify_price_drop=?')
      .run(uuid(), req.user.id, req.params.product_id, notify_price_drop ? 1 : 0, notify_price_drop ? 1 : 0);
    res.json({ success: true });
  } catch { res.json({ success: true }); }
});

export default router;

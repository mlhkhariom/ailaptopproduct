import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminOnly } from '../../middleware/adminOnly.js';

const router = Router();

// POST /api/coupons/validate — validate coupon
router.post('/validate', async (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code required' });
  const coupon = await db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(code.toUpperCase());
  if (!coupon) return res.status(404).json({ error: 'Invalid coupon' });
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return res.status(400).json({ error: 'Coupon expired' });
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) return res.status(400).json({ error: 'Coupon usage limit reached' });
  if (subtotal < coupon.min_order) return res.status(400).json({ error: `Minimum order ₹${coupon.min_order} required` });

  let discount = coupon.type === 'percentage' ? (subtotal * Math.min(coupon.value, 100)) / 100 : coupon.value;
  discount = Math.min(discount, subtotal); // never exceed subtotal
  res.json({ valid: true, discount, coupon });
});

// GET /api/coupons/active — public (show available coupons to customers)
router.get('/active', async (req, res) => {
  const now = new Date().toISOString();
  const coupons = await db.prepare(`SELECT code, discount_type, discount_value, min_order, description 
    FROM coupons WHERE is_active=1 AND (expires_at IS NULL OR expires_at > ?) 
    ORDER BY discount_value DESC LIMIT 5`).all(now);
  res.json(coupons);
});

// GET /api/coupons — admin
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all());
});

// POST /api/coupons — admin create
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { code, type, value, min_order, max_uses, expires_at } = req.body;
  if (!code || !type || !value) return res.status(400).json({ error: 'code, type, value required' });
  const id = uuid();
  await db.prepare('INSERT INTO coupons (id, code, type, value, min_order, max_uses, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, code.toUpperCase(), type, value, min_order || 0, max_uses || null, expires_at || null);
  res.status(201).json(await db.prepare('SELECT * FROM coupons WHERE id = ?').get(id));
});

// PUT /api/coupons/:id — admin update
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { code, type, value, min_order, max_uses, expires_at, is_active } = req.body;
  await db.prepare('UPDATE coupons SET code=?, type=?, value=?, min_order=?, max_uses=?, expires_at=?, is_active=? WHERE id=?')
    .run(code?.toUpperCase(), type, value, min_order, max_uses, expires_at, is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/coupons/:id — admin
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;

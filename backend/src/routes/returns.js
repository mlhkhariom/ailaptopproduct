import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// POST /api/returns — customer requests return/refund/exchange
router.post('/', authMiddleware, async (req, res) => {
  const { order_id, reason, type, images } = req.body;
  if (!order_id || !reason) return res.status(400).json({ error: 'order_id and reason required' });

  const order = await db.prepare('SELECT * FROM orders WHERE id=? OR order_number=?').get(order_id, order_id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  // Check if return already exists
  const existing = await db.prepare('SELECT id FROM returns WHERE order_id=?').get(order.id);
  if (existing) return res.status(400).json({ error: 'Return request already exists for this order' });

  const id = uuid();
  await db.prepare(`INSERT INTO returns (id, order_id, order_number, user_id, reason, type, status, refund_amount, images)
    VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(id, order.id, order.order_number, req.user.id, reason, type || 'return', 'requested', order.total, JSON.stringify(images || []));

  // Create notification for admin
  try {
    await db.prepare('INSERT INTO notifications (id, type, title, message, link) VALUES (?,?,?,?,?)')
      .run(uuid(), 'return', 'Return Request', `Return requested for order ${order.order_number}: ${reason}`, '/admin/orders');
  } catch {}

  res.status(201).json({ success: true, id, message: 'Return request submitted. We will contact you within 24 hours.' });
});

// GET /api/returns — customer's returns
router.get('/', authMiddleware, async (req, res) => {
  const returns = await db.prepare('SELECT * FROM returns WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);
  res.json(returns);
});

// GET /api/returns/admin — all returns (admin)
router.get('/admin', authMiddleware, adminOnly, async (req, res) => {
  const returns = await db.prepare('SELECT r.*, o.items FROM returns r LEFT JOIN orders o ON r.order_id=o.id ORDER BY r.created_at DESC').all();
  res.json(returns);
});

// PUT /api/returns/:id — admin update status
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { status, admin_notes, refund_amount, refund_method } = req.body;
  const existing = await db.prepare('SELECT * FROM returns WHERE id=?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Return not found' });

  await db.prepare('UPDATE returns SET status=?, admin_notes=?, refund_amount=?, refund_method=?, updated_at=NOW() WHERE id=?')
    .run(status || existing.status, admin_notes || existing.admin_notes, refund_amount ?? existing.refund_amount, refund_method || existing.refund_method, req.params.id);

  // If approved, update order status
  if (status === 'approved') {
    await db.prepare("UPDATE orders SET status='returned' WHERE id=?").run(existing.order_id);
  }

  res.json(await db.prepare('SELECT * FROM returns WHERE id=?').get(req.params.id));
});

export default router;

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { notifyOrderPlaced, notifyOrderShipped, notifyOrderDelivered, notifyInvoiceReady } from '../whatsapp/notifications.js';

const router = Router();

// POST /api/orders — place order (auth required)
router.post('/', authMiddleware, (req, res) => {
  const { items, subtotal, discount, total, coupon_code, payment_method, address, payment_status } = req.body;
  if (!items || !total) return res.status(400).json({ error: 'items and total required' });

  const id = uuid();
  const order_number = 'ALW-' + Date.now().toString().slice(-6);

  db.prepare(`INSERT INTO orders (id, order_number, user_id, items, subtotal, discount, total, coupon_code, payment_method, payment_status, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, order_number, req.user.id, JSON.stringify(items), subtotal, discount || 0, total, coupon_code, payment_method, payment_status || 'pending', JSON.stringify(address));

  if (coupon_code) db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?').run(coupon_code);
  items.forEach(item => {
    db.prepare('UPDATE products SET stock = MAX(0, stock - ?), in_stock = CASE WHEN stock - ? <= 0 THEN 0 ELSE 1 END WHERE id = ?')
      .run(item.quantity, item.quantity, item.id);
  });
  db.prepare('INSERT INTO notifications (id, type, title, message, link) VALUES (?, ?, ?, ?, ?)')
    .run(uuid(), 'order', 'New Order', `Order ${order_number} placed for ₹${total}`, `/admin/orders`);

  // WhatsApp notification + admin alert
  const order = db.prepare('SELECT * FROM orders WHERE id=?').get(id);
  const user = db.prepare('SELECT name, phone FROM users WHERE id=?').get(req.user.id);
  if (user?.phone) notifyOrderPlaced(order, user.phone, user.name || 'Customer');
  db.prepare('INSERT INTO notifications (id,type,title,message,link) VALUES (?,?,?,?,?)').run(uuid(), 'order', 'New Order', `Order ${order_number} placed for ₹${total}`, '/admin/orders');

  res.status(201).json({ order_number, id });
});

// GET /api/orders/my — user's own orders
router.get('/my', authMiddleware, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id)
    .map(o => ({ ...o, items: JSON.parse(o.items), address: JSON.parse(o.address || '{}') }));
  res.json(orders);
});

// GET /api/orders/track/:orderNumber — public tracking
router.get('/track/:orderNumber', (req, res) => {
  const order = db.prepare('SELECT order_number, status, tracking_id, courier, created_at FROM orders WHERE order_number = ?').get(req.params.orderNumber);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// GET /api/orders — admin: all orders
router.get('/', authMiddleware, adminOnly, (req, res) => {
  const { status, from, to } = req.query;
  let query = 'SELECT o.*, u.name as customer_name, u.email as customer_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE 1=1';
  const params = [];
  if (status) { query += ' AND o.status = ?'; params.push(status); }
  if (from) { query += ' AND o.created_at >= ?'; params.push(from); }
  if (to) { query += ' AND o.created_at <= ?'; params.push(to); }
  query += ' ORDER BY o.created_at DESC';
  const orders = db.prepare(query).all(...params).map(o => ({ ...o, items: JSON.parse(o.items), address: JSON.parse(o.address || '{}') }));
  res.json(orders);
});

// PUT /api/orders/:id/status — admin update status
router.put('/:id/status', authMiddleware, adminOnly, (req, res) => {
  const { status, tracking_id, courier } = req.body;
  db.prepare('UPDATE orders SET status = ?, tracking_id = ?, courier = ? WHERE id = ?').run(status, tracking_id, courier, req.params.id);

  // WhatsApp notification on status change
  const order = db.prepare('SELECT o.*, u.name as uname, u.phone as uphone FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE o.id=?').get(req.params.id);
  if (order?.uphone) {
    if (status === 'shipped') notifyOrderShipped({ ...order, tracking_id, courier }, order.uphone, order.uname || 'Customer');
    if (status === 'delivered') {
      notifyOrderDelivered(order, order.uphone, order.uname || 'Customer');
      notifyInvoiceReady(order, order.uphone, order.uname || 'Customer');
    }
  }
  res.json({ message: 'Status updated' });
});

export default router;

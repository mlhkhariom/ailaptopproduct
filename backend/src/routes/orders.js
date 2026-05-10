import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { notifyOrderPlaced, notifyOrderShipped, notifyOrderDelivered, notifyInvoiceReady } from '../whatsapp/notifications.js';

const router = Router();

// POST /api/orders — place order (auth required)
router.post('/', authMiddleware, async (req, res) => {
  const { items, subtotal, discount, total, coupon_code, payment_method, address, payment_status, branch_id } = req.body;
  if (!items || !total) return res.status(400).json({ error: 'items and total required' });

  const id = uuid();
  const order_number = 'ALW-' + Date.now().toString().slice(-6);

  // Default to Silver Mall if no branch specified
  const selectedBranch = branch_id || 'branch-silver-mall';
  await db.prepare(`INSERT INTO orders (id, order_number, user_id, items, subtotal, discount, total, coupon_code, payment_method, payment_status, address, branch_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, order_number, req.user.id, JSON.stringify(items), subtotal, discount || 0, total, coupon_code, payment_method, payment_status || 'pending', JSON.stringify(address), selectedBranch);

  if (coupon_code) await db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?').run(coupon_code);
  for (const item of items) {
    await db.prepare('UPDATE products SET stock = MAX(0, stock - ?), in_stock = CASE WHEN stock - ? <= 0 THEN 0 ELSE 1 END WHERE id = ?')
      .run(item.quantity, item.quantity, item.id);
    // Deduct from branch_stock
    try {
      await db.prepare('UPDATE branch_stock SET stock=GREATEST(0,stock-?) WHERE branch_id=? AND product_id=?').run(item.quantity, selectedBranch, item.id);
      await db.prepare('INSERT INTO branch_stock_movements (id,branch_id,product_id,type,qty,note,ref_id) VALUES (?,?,?,?,?,?,?)').run(uuid(), selectedBranch, item.id, 'order_sale', -item.quantity, `Order ${order_number}`, id);
    } catch {}
    const p = await db.prepare('SELECT name, stock FROM products WHERE id=?').get(item.id);
    if (p && p.stock <= 3) {
      await db.prepare('INSERT INTO notifications (id,type,title,message,link) VALUES (?,?,?,?,?)').run(uuid(), 'stock', '⚠️ Low Stock Alert', `${p.name} — only ${p.stock} left`, '/admin/products');
    }
  }
  await db.prepare('INSERT INTO notifications (id, type, title, message, link) VALUES (?, ?, ?, ?, ?)')
    .run(uuid(), 'order', 'New Order', `Order ${order_number} placed for ₹${total}`, `/admin/orders`);

  // WhatsApp notification — phone from user profile OR checkout address
  const order = await db.prepare('SELECT * FROM orders WHERE id=?').get(id);
  const user = await db.prepare('SELECT name, phone FROM users WHERE id=?').get(req.user.id);
  const addr = JSON.parse(order.address || '{}');
  const phone = user?.phone || addr.phone || addr.mobile;
  const name = user?.name || addr.name || 'Customer';
  if (phone) {
    notifyOrderPlaced(order, phone, name);
    // Save phone to user profile if missing
    if (!user?.phone && phone) await db.prepare('UPDATE users SET phone=? WHERE id=?').run(phone, req.user.id);
  }

  res.status(201).json({ order_number, id });
});

// GET /api/orders/my — user's own orders
router.get('/my', authMiddleware, async (req, res) => {
  const orders = await db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id)
    .then(rows => (rows || []).map(o => ({ ...o, items: JSON.parse(o.items), address: JSON.parse(o.address || '{}') })));
  res.json(orders);
});

// GET /api/orders/track/:orderNumber — public tracking
router.get('/track/:orderNumber', async (req, res) => {
  const order = await db.prepare('SELECT order_number, status, tracking_id, courier, created_at FROM orders WHERE order_number = ?').get(req.params.orderNumber);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// GET /api/orders — admin: all orders
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  const { status, from, to } = req.query;
  let query = 'SELECT o.*, u.name as customer_name, u.email as customer_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE 1=1';
  const params = [];
  if (status) { query += ' AND o.status = ?'; params.push(status); }
  if (from) { query += ' AND o.created_at::timestamptz >= ?::timestamptz'; params.push(from); }
  if (to) { query += ' AND o.created_at::timestamptz <= ?::timestamptz'; params.push(to); }
  query += ' ORDER BY o.created_at DESC';
  const orders = (await db.prepare(query).all(...params)).map(o => ({ ...o, items: JSON.parse(o.items), address: JSON.parse(o.address || '{}') }));
  res.json(orders);
});

// PUT /api/orders/:id/status — admin update status
router.put('/:id/status', authMiddleware, adminOnly, async (req, res) => {
  const { status, tracking_id, courier } = req.body;
  await db.prepare('UPDATE orders SET status = ?, tracking_id = ?, courier = ? WHERE id = ?').run(status, tracking_id, courier, req.params.id);

  // WhatsApp notification on status change
  const order = await db.prepare('SELECT o.*, u.name as uname, u.phone as uphone FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE o.id=?').get(req.params.id);
  if (order) {
    const addr = JSON.parse(order.address || '{}');
    const phone = order.uphone || addr.phone || addr.mobile;
    const name = order.uname || addr.name || 'Customer';
    if (phone) {
      if (status === 'shipped') notifyOrderShipped({ ...order, tracking_id, courier }, phone, name);
      if (status === 'delivered') {
        notifyOrderDelivered(order, phone, name);
        notifyInvoiceReady(order, phone, name);
        // Auto-earn loyalty points
        try {
          const { v4: uuid } = await import('uuid');
          const pts = Math.floor((order.total || 0) / 100);
          if (pts > 0 && phone) {
            const cleanPhone = phone.replace(/\D/g, '').slice(-10);
            const existing = await db.prepare('SELECT * FROM loyalty_points WHERE phone=?').get(cleanPhone);
            if (existing) {
              await db.prepare('UPDATE loyalty_points SET points=points+?,total_earned=total_earned+? WHERE phone=?').run(pts, pts, cleanPhone);
            } else {
              await db.prepare('INSERT INTO loyalty_points (id,phone,customer_name,points,total_earned) VALUES (?,?,?,?,?)').run(uuid(), cleanPhone, name, pts, pts);
            }
            await db.prepare('INSERT INTO loyalty_transactions (id,phone,type,points,ref_id,ref_type,note) VALUES (?,?,?,?,?,?,?)').run(uuid(), cleanPhone, 'earn', pts, order.id, 'order', `Earned ${pts} pts on order ₹${order.total}`);
          }
        } catch {}
      }
    }
  }
  res.json({ message: 'Status updated' });
});

export default router;

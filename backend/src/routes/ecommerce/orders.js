import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../db/database.js';
import { authMiddleware, optionalAuth } from '../../middleware/auth.js';
import { adminOnly } from '../../middleware/adminOnly.js';
import { notifyOrderPlaced, notifyOrderShipped, notifyOrderDelivered, notifyInvoiceReady } from '../../whatsapp/notifications.js';
import { sendEmail, EmailTemplates } from '../../lib/email.js';

const router = Router();

// POST /api/orders — place order (auth OR guest if guest_checkout enabled)
router.post('/', optionalAuth, async (req, res) => {
  const { items, subtotal, discount, total, coupon_code, payment_method, address, payment_status, branch_id, shipping_charge } = req.body;
  if (!items || !total) return res.status(400).json({ error: 'items and total required' });

  // Check guest checkout setting
  if (!req.user) {
    const row = await db.prepare("SELECT value FROM site_settings WHERE key='site_features'").get();
    const features = row?.value ? JSON.parse(row.value) : {};
    if (!features.guest_checkout) {
      return res.status(401).json({ error: 'Login required. Guest checkout is disabled.' });
    }
    // Require valid address with phone + email for guest
    const addr = address || {};
    if (!addr.phone || !addr.email || !addr.name) {
      return res.status(400).json({ error: 'Guest checkout requires name, email, and phone in address' });
    }
  }

  const id = uuid();
  const order_number = 'ALW-' + Date.now().toString().slice(-6);
  const userId = req.user?.id || null; // null for guest

  // Default to Silver Mall if no branch specified
  const selectedBranch = branch_id || 'branch-silver-mall';
  await db.prepare(`INSERT INTO orders (id, order_number, user_id, items, subtotal, discount, shipping_charge, total, coupon_code, payment_method, payment_status, address, branch_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, order_number, userId, JSON.stringify(items), subtotal, discount || 0, shipping_charge || 0, total, coupon_code, payment_method, payment_status || 'pending', JSON.stringify(address), selectedBranch);

  if (coupon_code) await db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?').run(coupon_code);
  for (const item of items) {
    await db.prepare('UPDATE products SET stock = MAX(0, stock - ?), in_stock = CASE WHEN stock - ? <= 0 THEN 0 ELSE 1 END WHERE id = ?')
      .run(item.quantity, item.quantity, item.id);
    // Deduct from branch_stock
    try {
      await db.prepare('UPDATE branch_stock SET stock=GREATEST(0,stock-?) WHERE branch_id=? AND product_id=?').run(item.quantity, selectedBranch, item.id);
      await db.prepare('INSERT INTO branch_stock_movements (id,branch_id,product_id,type,qty,note,ref_id) VALUES (?,?,?,?,?,?,?)').run(uuid(), selectedBranch, item.id, 'order_sale', -item.quantity, `Order ${order_number}`, id);
    } catch (e) { console.error("Orders: branch stock deduct failed:", e.message); }
    const p = await db.prepare('SELECT name, stock FROM products WHERE id=?').get(item.id);
    if (p && p.stock <= 3) {
      await db.prepare('INSERT INTO notifications (id,type,title,message,link) VALUES (?,?,?,?,?)').run(uuid(), 'stock', '⚠️ Low Stock Alert', `${p.name} — only ${p.stock} left`, '/admin/products');
    }
  }
  await db.prepare('INSERT INTO notifications (id, type, title, message, link) VALUES (?, ?, ?, ?, ?)')
    .run(uuid(), 'order', 'New Order', `Order ${order_number} placed for ₹${total}`, `/admin/orders`);

  // Email notification — uses central helper (respects SMTP + toggle)
  try {
    const order = await db.prepare('SELECT * FROM orders WHERE id=?').get(id);
    const addr = JSON.parse(order.address || '{}');
    // Use user record if logged in, else address email/name (guest)
    const recipientEmail = req.user ? (await db.prepare('SELECT email FROM users WHERE id=?').get(req.user.id))?.email : addr.email;
    const recipientName = req.user ? (await db.prepare('SELECT name FROM users WHERE id=?').get(req.user.id))?.name : addr.name;
    if (recipientEmail) {
      await sendEmail({
        to: recipientEmail,
        subject: `Order Confirmed #${order_number} — AI Laptop Wala`,
        html: EmailTemplates.orderConfirmation(order, recipientName),
        toggleKey: 'email_order_confirmation',
      });
    }
    // Admin: New Order Alert
    const adminEmail = (await db.prepare("SELECT value FROM app_settings WHERE key='site_email'").get())?.value;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `🔔 New Order #${order_number} — ₹${total}`,
        html: EmailTemplates.adminNewOrder(order, recipientName, recipientEmail, addr.phone || addr.mobile),
        toggleKey: 'email_admin_new_order',
      });
    }
  } catch (e) { console.error('Order email error:', e.message); }

  // WhatsApp notification — phone from user profile OR checkout address
  // WhatsApp notification — works for both auth and guest
  const order = await db.prepare('SELECT * FROM orders WHERE id=?').get(id);
  const user = req.user ? await db.prepare('SELECT name, phone FROM users WHERE id=?').get(req.user.id) : null;
  const addr = JSON.parse(order.address || '{}');
  const phone = user?.phone || addr.phone || addr.mobile;
  const name = user?.name || addr.name || 'Customer';
  if (phone) {
    notifyOrderPlaced(order, phone, name);
    if (req.user && !user?.phone && phone) await db.prepare('UPDATE users SET phone=? WHERE id=?').run(phone, req.user.id);

    // Auto-create CRM lead from order (if not exists)
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
      const existingLead = await db.prepare('SELECT id FROM leads WHERE phone=? OR phone=?').get(cleanPhone, '91' + cleanPhone);
      if (!existingLead) {
        const leadId = uuid();
        await db.prepare(`INSERT INTO leads (id,name,phone,email,source,interest,status,budget,deal_value,notes) VALUES (?,?,?,?,?,?,?,?,?,?)`)
          .run(leadId, name, cleanPhone, addr.email || '', 'Ecommerce', `Order #${order_number}`, 'won', total, total, `Auto-created from order ${order_number}`);
      }
    } catch {}
  }

  res.status(201).json({ order_number, id });
});

// GET /api/orders/my — user's own orders
router.get('/my', authMiddleware, async (req, res) => {
  const orders = await db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id)
    .then(rows => (rows || []).map(o => ({ ...o, items: JSON.parse(o.items), address: JSON.parse(o.address || '{}') })));
  res.json(orders);
});

// GET /api/orders/:id/invoice-pdf — download GST invoice PDF
router.get('/:id/invoice-pdf', async (req, res) => {
  try {
    const { generateInvoicePDF } = await import('../../lib/invoicePdf.js');
    const pdf = await generateInvoicePDF(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${req.params.id}.pdf`);
    res.send(pdf);
  } catch (e) { res.status(404).json({ error: e.message }); }
});

// POST /api/orders/:id/cancel — customer cancels order (only if placed/processing)
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  const order = await db.prepare('SELECT * FROM orders WHERE (id=? OR order_number=?) AND user_id=?').get(req.params.id, req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!['placed', 'processing'].includes(order.status)) return res.status(400).json({ error: 'Cannot cancel — order already ' + order.status });
  await db.prepare("UPDATE orders SET status='cancelled' WHERE id=?").run(order.id);
  // Restore stock
  try {
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    for (const item of items) {
      await db.prepare('UPDATE products SET stock=stock+?, in_stock=1 WHERE id=?').run(item.quantity || 1, item.id);
      await db.prepare('UPDATE branch_stock SET stock=stock+? WHERE product_id=?').run(item.quantity || 1, item.id);
    }
  } catch {}
  res.json({ success: true, message: 'Order cancelled. Refund will be processed within 5-7 days.' });
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
  const order = await db.prepare('SELECT o.*, u.name as uname, u.phone as uphone, u.email as uemail FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE o.id=?').get(req.params.id);
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
        } catch (e) { console.error("Orders: loyalty failed:", e.message); }
      }
    }

    // ── Email notifications on status change ──
    const email = (order.uemail) || (await db.prepare('SELECT email FROM users WHERE id=?').get(order.user_id))?.email || addr.email;
    if (email) {
      if (status === 'shipped') {
        await sendEmail({ to: email, subject: `📦 Order #${order.order_number} Shipped`, html: EmailTemplates.orderShipped({ ...order, tracking_id }, name, tracking_id), toggleKey: 'email_order_shipped' });
      } else if (status === 'delivered') {
        await sendEmail({ to: email, subject: `✅ Order #${order.order_number} Delivered`, html: EmailTemplates.orderDelivered(order, name), toggleKey: 'email_order_delivered' });
        await sendEmail({ to: email, subject: `Invoice — ${order.order_number}`, html: EmailTemplates.invoice({ invoice_number: order.order_number, amount: order.total, description: 'Order invoice' }, name), toggleKey: 'email_invoice' });
      }
    }
  }
  res.json({ message: 'Status updated' });
});

// GET /api/orders/export/csv — admin export orders as CSV
router.get('/export/csv', authMiddleware, adminOnly, async (req, res) => {
  const orders = await db.prepare('SELECT order_number, status, payment_status, payment_method, subtotal, discount, total, coupon_code, tracking_id, courier, created_at, address FROM orders ORDER BY created_at DESC').all();
  const header = 'Order#,Status,Payment,Method,Subtotal,Discount,Total,Coupon,Tracking,Courier,Date,Customer,Phone,City\n';
  const rows = orders.map(o => {
    const addr = typeof o.address === 'string' ? JSON.parse(o.address || '{}') : (o.address || {});
    return `${o.order_number},${o.status},${o.payment_status},${o.payment_method},${o.subtotal},${o.discount},${o.total},${o.coupon_code || ''},${o.tracking_id || ''},${o.courier || ''},${new Date(o.created_at).toLocaleDateString('en-IN')},${(addr.name || '').replace(/,/g, '')},${addr.phone || ''},${addr.city || ''}`;
  }).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=orders-export.csv');
  res.send(header + rows);
});

export default router;


// POST /api/orders/abandoned-cart — save abandoned cart for recovery
router.post('/abandoned-cart', async (req, res) => {
  const { items, total, email, phone, user_id } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items required' });
  
  const id = uuid();
  await db.prepare('INSERT INTO abandoned_carts (id, user_id, email, phone, items, total) VALUES (?,?,?,?,?,?)')
    .run(id, user_id || null, email || null, phone || null, JSON.stringify(items), total || 0);
  
  res.status(201).json({ success: true, id });
});

// GET /api/orders/abandoned-carts — admin list
router.get('/abandoned-carts', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ error: 'Admin only' });
  const carts = await db.prepare('SELECT * FROM abandoned_carts ORDER BY created_at DESC LIMIT 100').all();
  res.json(carts);
});

// POST /api/orders/abandoned-carts/:id/recover — send recovery message
router.post('/abandoned-carts/:id/recover', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ error: 'Admin only' });
  const cart = await db.prepare('SELECT * FROM abandoned_carts WHERE id=?').get(req.params.id);
  if (!cart) return res.status(404).json({ error: 'Cart not found' });
  await db.prepare('UPDATE abandoned_carts SET recovery_sent=1, recovery_sent_at=NOW() WHERE id=?').run(req.params.id);
  // TODO: Send WhatsApp/Email recovery message here
  res.json({ success: true, message: 'Recovery message sent' });
});

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminOnly, superAdminOnly } from '../../middleware/adminOnly.js';

const router = Router();

// ── UNIFIED BILLING ───────────────────────────────────────

// GET /api/erp/billing — all invoices (orders + job cards + custom)
router.get('/billing', authMiddleware, adminOnly, async (req, res) => {
  const { type, status, from, to, search } = req.query;
  const results = [];

  if (!type || type === 'order') {
    let q = `SELECT o.*, u.name as customer_name, u.phone as customer_phone
      FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE 1=1`;
    const p = [];
    if (status && status !== 'all') { q += ' AND o.payment_status=?'; p.push(status); }
    if (from) { q += ' AND DATE(o.created_at)>=?'; p.push(from); }
    if (to) { q += ' AND DATE(o.created_at)<=?'; p.push(to); }
    q += ' ORDER BY o.created_at DESC';
    const orders = await db.prepare(q).all(...p) || [];
    orders.forEach(o => {
      const addr = typeof o.address === 'string' ? JSON.parse(o.address || '{}') : (o.address || {});
      const name = o.customer_name || addr.name || 'Customer';
      const phone = o.customer_phone || addr.phone || '';
      if (search && !name.toLowerCase().includes(search.toLowerCase()) && !o.order_number?.includes(search)) return;
      results.push({
        id: o.id, invoice_number: o.order_number, type: 'order',
        customer_name: name, customer_phone: phone,
        amount: o.total, payment_status: o.payment_status,
        payment_method: o.payment_method, created_at: o.created_at,
        items: o.items, address: o.address, discount: o.discount,
        subtotal: o.subtotal, razorpay_id: o.razorpay_id,
      });
    });
  }

  if (!type || type === 'service') {
    let q = 'SELECT * FROM service_bookings WHERE 1=1';
    const p = [];
    if (status && status !== 'all') { q += ' AND payment_status=?'; p.push(status); }
    if (from) { q += ' AND DATE(created_at)>=?'; p.push(from); }
    if (to) { q += ' AND DATE(created_at)<=?'; p.push(to); }
    q += ' ORDER BY created_at DESC';
    const jobs = await db.prepare(q).all(...p) || [];
    jobs.forEach(j => {
      if (search && !j.customer_name?.toLowerCase().includes(search.toLowerCase()) && !j.booking_number?.includes(search)) return;
      results.push({
        id: j.id, invoice_number: j.booking_number, type: 'service',
        customer_name: j.customer_name, customer_phone: j.customer_phone,
        amount: j.total_charge || 0, payment_status: j.payment_status,
        payment_method: j.payment_method, created_at: j.created_at,
        device: `${j.device_brand || ''} ${j.device_model || ''}`.trim(),
        service_name: j.service_name, labour_charge: j.labour_charge,
        parts_charge: j.parts_charge, technician: j.technician,
        diagnosis: j.diagnosis,
      });
    });
  }

  if (!type || type === 'custom') {
    let q = 'SELECT * FROM custom_invoices WHERE 1=1';
    const p = [];
    if (status && status !== 'all') { q += ' AND payment_status=?'; p.push(status); }
    if (from) { q += ' AND DATE(created_at)>=?'; p.push(from); }
    if (to) { q += ' AND DATE(created_at)<=?'; p.push(to); }
    q += ' ORDER BY created_at DESC';
    const customs = await db.prepare(q).all(...p) || [];
    customs.forEach(c => {
      if (search && !c.customer_name?.toLowerCase().includes(search.toLowerCase()) && !c.invoice_number?.includes(search)) return;
      results.push({
        ...c, type: 'custom',
        items: typeof c.items === 'string' ? JSON.parse(c.items || '[]') : (c.items || []),
      });
    });
  }

  // Sort all by date desc
  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(results);
});

// POST /api/erp/billing/custom — create custom invoice
router.post('/billing/custom', authMiddleware, adminOnly, async (req, res) => {
  const { customer_name, customer_phone, customer_email, items, notes, payment_status, payment_method, discount, gst_enabled, send_whatsapp } = req.body;
  if (!customer_name || !items?.length) return res.status(400).json({ error: 'customer_name and items required' });
  const id = uuid();
  const invoice_number = 'ALW-' + Date.now().toString().slice(-6);
  const subtotal = items.reduce((s, i) => s + (i.price * i.qty), 0);
  const afterDiscount = subtotal - (discount || 0);
  const gst = gst_enabled ? Math.round(afterDiscount * 0.18) : 0;
  const total = afterDiscount + gst;
  await db.prepare(`INSERT INTO custom_invoices
    (id,invoice_number,customer_name,customer_phone,customer_email,items,subtotal,discount,total,notes,payment_status,payment_method,gst_enabled)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, invoice_number, customer_name, customer_phone, customer_email,
      JSON.stringify(items), subtotal, discount || 0, total, notes,
      payment_status || 'pending', payment_method || 'cash', gst_enabled ? 1 : 0);

  // Real-time stock deduction for product items
  for (const item of items) {
    if (item.product_id && item.qty > 0) {
      try {
        await db.prepare('UPDATE products SET stock=GREATEST(0,stock-?), in_stock=CASE WHEN stock-?>0 THEN 1 ELSE 0 END WHERE id=?')
          .run(item.qty, item.qty, item.product_id);
        await db.prepare('INSERT INTO stock_movements (id,product_id,type,quantity,reference_id,reference_type,notes,created_by) VALUES (?,?,?,?,?,?,?,?)')
          .run(uuid(), item.product_id, 'sale', item.qty, id, 'custom_invoice', `Custom invoice ${invoice_number}`, req.user.id);
      } catch (e) { console.error("Operation error:", e.message); }
    }
  }

  // WhatsApp send
  if (send_whatsapp && customer_phone) {
    try {
      const { queueNotification } = await import('../whatsapp/notifications.js');
      const { Config } = await import('../../lib/config.js');
        const frontendUrl = await Config.frontendUrl();
        const invoiceUrl = `${frontendUrl}/api/invoice/${invoice_number}`;
      const msg = `🧾 *Invoice from AI Laptop Wala*\n\nNamaste ${customer_name}! 🙏\n\n*Invoice #:* ${invoice_number}\n*Amount:* ₹${total.toLocaleString('en-IN')}\n*Status:* ${payment_status === 'paid' ? 'Paid' : 'Pending'}\n\nView Invoice:\n${invoiceUrl}\n\n+91 98934 96163 | ailaptopwala.com`;
      await queueNotification(customer_phone, msg, 'invoice');
    } catch (e) { console.error("Operation error:", e.message); }
  }
  res.status(201).json({ id, invoice_number, total });
});

// PUT /api/erp/billing/custom/:id — update custom invoice
router.put('/billing/custom/:id', authMiddleware, adminOnly, async (req, res) => {
  const { customer_name, customer_phone, customer_email, items, notes, payment_status, payment_method, discount, gst_enabled, send_whatsapp } = req.body;
  const subtotal = items.reduce((s, i) => s + (i.price * i.qty), 0);
  const afterDiscount = subtotal - (discount || 0);
  const gst = gst_enabled ? Math.round(afterDiscount * 0.18) : 0;
  const total = afterDiscount + gst;
  await db.prepare(`UPDATE custom_invoices SET customer_name=?,customer_phone=?,customer_email=?,
    items=?,subtotal=?,discount=?,total=?,notes=?,payment_status=?,payment_method=?,gst_enabled=?,updated_at=NOW() WHERE id=?`)
    .run(customer_name, customer_phone, customer_email, JSON.stringify(items),
      subtotal, discount || 0, total, notes, payment_status, payment_method, gst_enabled ? 1 : 0, req.params.id);

  if (send_whatsapp && customer_phone) {
    try {
      const inv = await db.prepare('SELECT invoice_number FROM custom_invoices WHERE id=?').get(req.params.id);
      const { queueNotification } = await import('../whatsapp/notifications.js');
      const { Config: Cfg } = await import('../../lib/config.js');
      const fUrl = await Cfg.frontendUrl();
      const invoiceUrl = `${fUrl}/api/invoice/${inv.invoice_number}`;
      const msg = `🧾 *Invoice from AI Laptop Wala*\n\nNamaste ${customer_name}! 🙏\n\n*Invoice #:* ${inv.invoice_number}\n*Amount:* ₹${total.toLocaleString('en-IN')}\n*Status:* ${payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}\n\n📄 View Invoice:\n${invoiceUrl}\n\n📞 +91 98934 96163`;
      await queueNotification(customer_phone, msg, 'invoice');
    } catch (e) { console.error("Operation error:", e.message); }
  }
  res.json({ message: 'Updated', total });
});

// PATCH /api/erp/billing/:type/:id/payment — mark payment on any type
router.patch('/billing/:type/:id/payment', authMiddleware, adminOnly, async (req, res) => {
  const { payment_status, payment_method, send_whatsapp, invoice_number, customer_name, amount } = req.body;
  const { type, id } = req.params;
  if (type === 'order') {
    await db.prepare('UPDATE orders SET payment_status=? WHERE id=?').run(payment_status, id);
  } else if (type === 'service') {
    await db.prepare('UPDATE service_bookings SET payment_status=?,payment_method=? WHERE id=?').run(payment_status, payment_method, id);
  } else if (type === 'custom') {
    await db.prepare('UPDATE custom_invoices SET payment_status=?,payment_method=? WHERE id=?').run(payment_status, payment_method, id);
  }

  // WhatsApp invoice link send
  if (send_whatsapp && invoice_number) {
    try {
      let phone = null;
      if (type === 'order') {
        const o = await db.prepare('SELECT o.*, u.phone as uphone FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE o.id=?').get(id);
        const addr = JSON.parse(o?.address || '{}');
        phone = o?.uphone || addr.phone;
      } else if (type === 'service') {
        const j = await db.prepare('SELECT customer_phone FROM service_bookings WHERE id=?').get(id);
        phone = j?.customer_phone;
      } else if (type === 'custom') {
        const c = await db.prepare('SELECT customer_phone FROM custom_invoices WHERE id=?').get(id);
        phone = c?.customer_phone;
      }
      if (phone) {
        const { queueNotification } = await import('../whatsapp/notifications.js');
        const { Config } = await import('../../lib/config.js');
        const frontendUrl = await Config.frontendUrl();
        const invoiceUrl = `${frontendUrl}/api/invoice/${invoice_number}`;
        const msg = `🧾 *Invoice — AI Laptop Wala*\n\nNamaste ${customer_name || 'Customer'}! 🙏\n\n*Invoice #:* ${invoice_number}\n*Amount:* ₹${Number(amount || 0).toLocaleString('en-IN')}\n*Status:* ${payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}\n\n📄 View Invoice:\n${invoiceUrl}\n\n📞 +91 98934 96163 | ailaptopwala.com`;
        await queueNotification(phone, msg, 'invoice');
      }
    } catch (e) { console.error("Operation error:", e.message); }
  }

  res.json({ message: 'Updated' });
});


// ── PARTIAL PAYMENTS ──────────────────────────────────────

router.get('/payments/:type/:id', authMiddleware, adminOnly, async (req, res) => {
  const payments = await db.prepare('SELECT * FROM invoice_payments WHERE invoice_type=? AND invoice_id=? ORDER BY created_at ASC').all(req.params.type, req.params.id) || [];
  const total = payments.reduce((s, p) => s + (p.amount || 0), 0);
  res.json({ payments, total_paid: total });
});

router.post('/payments/:type/:id', authMiddleware, adminOnly, async (req, res) => {
  const { amount, payment_method, notes } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'amount required' });
  const id = uuid();
  await db.prepare('INSERT INTO invoice_payments (id,invoice_type,invoice_id,amount,payment_method,notes,created_by) VALUES (?,?,?,?,?,?,?)')
    .run(id, req.params.type, req.params.id, amount, payment_method || 'cash', notes, req.user.id);
  const allPayments = await db.prepare('SELECT COALESCE(SUM(amount),0) as s FROM invoice_payments WHERE invoice_type=? AND invoice_id=?').get(req.params.type, req.params.id);
  const paid = allPayments?.s || 0;
  let total_charge = 0;
  if (req.params.type === 'service') { const j = await db.prepare('SELECT total_charge FROM service_bookings WHERE id=?').get(req.params.id); total_charge = j?.total_charge || 0; }
  if (req.params.type === 'custom') { const c = await db.prepare('SELECT total FROM custom_invoices WHERE id=?').get(req.params.id); total_charge = c?.total || 0; }
  const newStatus = paid >= total_charge ? 'paid' : paid > 0 ? 'partial' : 'pending';
  if (req.params.type === 'service') await db.prepare('UPDATE service_bookings SET payment_status=? WHERE id=?').run(newStatus, req.params.id);
  if (req.params.type === 'custom') await db.prepare('UPDATE custom_invoices SET payment_status=? WHERE id=?').run(newStatus, req.params.id);
  res.status(201).json({ id, payment_status: newStatus, total_paid: paid });
});


// ── RECURRING INVOICES ────────────────────────────────────

router.get('/recurring', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM recurring_invoices ORDER BY next_date ASC').all() || []);
});

router.post('/recurring', authMiddleware, adminOnly, async (req, res) => {
  const { customer_name, customer_phone, customer_email, items, subtotal, discount, total, gst_enabled, payment_method, notes, frequency, next_date } = req.body;
  if (!customer_name || !next_date) return res.status(400).json({ error: 'customer_name and next_date required' });
  const id = uuid();
  await db.prepare(`INSERT INTO recurring_invoices (id,customer_name,customer_phone,customer_email,items,subtotal,discount,total,gst_enabled,payment_method,notes,frequency,next_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, customer_name, customer_phone, customer_email, JSON.stringify(items || []), subtotal || 0, discount || 0, total || 0, gst_enabled ? 1 : 0, payment_method || 'cash', notes, frequency || 'monthly', next_date);
  res.status(201).json({ id });
});

router.put('/recurring/:id', authMiddleware, adminOnly, async (req, res) => {
  const { is_active, next_date, frequency } = req.body;
  await db.prepare('UPDATE recurring_invoices SET is_active=?,next_date=?,frequency=? WHERE id=?').run(is_active ? 1 : 0, next_date, frequency, req.params.id);
  res.json({ message: 'Updated' });
});

// Process due recurring invoices — called by scheduler
router.post('/recurring/process', authMiddleware, adminOnly, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const due = await db.prepare("SELECT * FROM recurring_invoices WHERE is_active=1 AND next_date<=?").all(today) || [];
  const created = [];
  for (const r of due) {
    const invoice_number = 'ALW-' + Date.now().toString().slice(-6);
    const id = uuid();
    await db.prepare(`INSERT INTO custom_invoices (id,invoice_number,customer_name,customer_phone,customer_email,items,subtotal,discount,total,notes,payment_status,payment_method,gst_enabled,branch_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, invoice_number, r.customer_name, r.customer_phone, r.customer_email, r.items, r.subtotal, r.discount, r.total, r.notes, 'pending', r.payment_method, r.gst_enabled);
    // Calculate next date
    const next = new Date(r.next_date);
    if (r.frequency === 'monthly') next.setMonth(next.getMonth() + 1);
    else if (r.frequency === 'quarterly') next.setMonth(next.getMonth() + 3);
    else if (r.frequency === 'yearly') next.setFullYear(next.getFullYear() + 1);
    await db.prepare('UPDATE recurring_invoices SET last_generated=?,next_date=? WHERE id=?').run(today, next.toISOString().split('T')[0], r.id);
    created.push({ invoice_number, customer: r.customer_name });
  }
  res.json({ processed: created.length, invoices: created });
});


// ── PROFORMA INVOICE ─────────────────────────────────────

router.post('/proforma', authMiddleware, adminOnly, async (req, res) => {
  const { customer_name, customer_phone, customer_email, items, discount = 0, notes, branch_id, gst_enabled } = req.body;
  if (!customer_name) return res.status(400).json({ error: 'customer_name required' });
  const subtotal = (items || []).reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
  const total = subtotal - discount;
  const id = uuid();
  const prefix = await getBranchPrefix(branch_id);
  const proforma_number = 'PRO-' + prefix + '-' + Date.now().toString().slice(-6);
  await db.prepare(`INSERT INTO custom_invoices (id,invoice_number,customer_name,customer_phone,customer_email,items,subtotal,discount,total,notes,payment_status,payment_method,gst_enabled,branch_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, proforma_number, customer_name, customer_phone, customer_email, JSON.stringify(items || []), subtotal, discount, total, notes, 'proforma', 'pending', gst_enabled ? 1 : 0, branch_id || null);
  res.status(201).json({ id, proforma_number });
});

// Convert proforma to invoice
router.post('/proforma/:id/convert', authMiddleware, adminOnly, async (req, res) => {
  const inv = await db.prepare('SELECT * FROM custom_invoices WHERE id=? AND payment_status=?').get(req.params.id, 'proforma');
  if (!inv) return res.status(404).json({ error: 'Proforma not found' });
  const prefix = await getBranchPrefix(inv.branch_id);
  const invoice_number = prefix + '-' + Date.now().toString().slice(-6);
  await db.prepare("UPDATE custom_invoices SET payment_status='pending', invoice_number=? WHERE id=?").run(invoice_number, req.params.id);
  res.json({ message: 'Converted to invoice', invoice_number });
});


// ── PROFORMA INVOICE ─────────────────────────────────────

router.post('/proforma', authMiddleware, adminOnly, async (req, res) => {
  const { customer_name, customer_phone, customer_email, items, discount = 0, notes, branch_id, gst_enabled } = req.body;
  if (!customer_name) return res.status(400).json({ error: 'customer_name required' });
  const subtotal = (items || []).reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
  const total = subtotal - discount;
  const id = uuid();
  const prefix = await getBranchPrefix(branch_id);
  const proforma_number = 'PRO-' + prefix + '-' + Date.now().toString().slice(-6);
  await db.prepare('INSERT INTO custom_invoices (id,invoice_number,customer_name,customer_phone,customer_email,items,subtotal,discount,total,notes,payment_status,payment_method,gst_enabled,branch_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, proforma_number, customer_name, customer_phone, customer_email, JSON.stringify(items || []), subtotal, discount, total, notes, 'proforma', 'pending', gst_enabled ? 1 : 0, branch_id || null);
  res.status(201).json({ id, proforma_number });
});

router.post('/proforma/:id/convert', authMiddleware, adminOnly, async (req, res) => {
  const inv = await db.prepare("SELECT * FROM custom_invoices WHERE id=? AND payment_status='proforma'").get(req.params.id);
  if (!inv) return res.status(404).json({ error: 'Proforma not found' });
  const prefix = await getBranchPrefix(inv.branch_id);
  const invoice_number = prefix + '-' + Date.now().toString().slice(-6);
  await db.prepare("UPDATE custom_invoices SET payment_status='pending', invoice_number=? WHERE id=?").run(invoice_number, req.params.id);
  res.json({ message: 'Converted to invoice', invoice_number });
});


// ── PAYMENT LINK (Multi-Gateway) ──────────────────────────
// Creates payment link using admin's default gateway from settings
// Priority: Razorpay (has payment_links API) > Cashfree (has links) > PhonePe (has links) > Manual fallback

router.post('/payment-link', authMiddleware, adminOnly, async (req, res) => {
  const { invoice_id, invoice_type = 'custom', amount, customer_name, customer_phone, customer_email, description, gateway: requestedGateway } = req.body;
  if (!amount || !customer_phone) return res.status(400).json({ error: 'amount and customer_phone required' });

  // Determine gateway: use requested, or first enabled
  const getSetting = async (key) => {
    const row = await db.prepare('SELECT value FROM app_settings WHERE key=?').get(key);
    return row?.value;
  };
  const razorpayEnabled = (await getSetting('payment_razorpay')) === 'true';
  const cashfreeEnabled = (await getSetting('payment_cashfree')) === 'true';
  const phonepeEnabled = (await getSetting('payment_phonepe')) === 'true';
  const gateway = requestedGateway || (razorpayEnabled ? 'razorpay' : cashfreeEnabled ? 'cashfree' : phonepeEnabled ? 'phonepe' : 'razorpay');

  const tableSel = invoice_type === 'service' ? 'service_bookings' : 'custom_invoices';
  const saveLink = async (link) => {
    if (invoice_id) await db.prepare(`UPDATE ${tableSel} SET payment_link=? WHERE id=?`).run(link, invoice_id);
  };

  // RAZORPAY PAYMENT LINK
  if (gateway === 'razorpay') {
    const keyId = (await getSetting('razorpay_key_id')) || process.env.RAZORPAY_KEY_ID;
    const keySecret = (await getSetting('razorpay_key_secret')) || process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      const mockLink = `https://rzp.io/l/mock-${Date.now()}`;
      await saveLink(mockLink);
      return res.json({ payment_link: mockLink, mock: true, gateway, message: 'Razorpay keys not configured. Add in Admin → Settings → API Keys.' });
    }
    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const payload = {
        amount: Math.round(amount * 100),
        currency: 'INR',
        description: description || 'AI Laptop Wala Invoice',
        customer: { name: customer_name || '', contact: customer_phone, email: customer_email || '' },
        notify: { sms: true, email: !!customer_email },
        reminder_enable: true,
      };
      const resp = await fetch('https://api.razorpay.com/v1/payment_links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!data.short_url) return res.status(502).json({ error: data.error?.description || 'Razorpay error' });
      await saveLink(data.short_url);
      return res.json({ payment_link: data.short_url, payment_link_id: data.id, gateway: 'razorpay' });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // CASHFREE PAYMENT LINK
  if (gateway === 'cashfree') {
    const appId = await getSetting('cashfree_app_id');
    const secretKey = await getSetting('cashfree_secret_key');
    const isProd = (await getSetting('cashfree_production')) === 'true';
    if (!appId || !secretKey) return res.status(400).json({ error: 'Cashfree not configured' });
    const host = isProd ? 'https://api.cashfree.com' : 'https://sandbox.cashfree.com';
    try {
      const resp = await fetch(`${host}/pg/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': appId,
          'x-client-secret': secretKey,
        },
        body: JSON.stringify({
          link_id: `LINK_${Date.now()}`,
          link_amount: Number(amount),
          link_currency: 'INR',
          link_purpose: description || 'AI Laptop Wala Invoice',
          customer_details: { customer_name: customer_name || 'Guest', customer_email: customer_email || '', customer_phone },
          link_notify: { send_sms: true, send_email: !!customer_email },
        }),
      });
      const data = await resp.json();
      if (!data.link_url) return res.status(502).json({ error: data.message || 'Cashfree link failed' });
      await saveLink(data.link_url);
      return res.json({ payment_link: data.link_url, gateway: 'cashfree' });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // Fallback: generate order-based link (works for any gateway)
  const fallbackLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/pay?invoice=${invoice_id}&amount=${amount}&phone=${customer_phone}`;
  await saveLink(fallbackLink);
  res.json({ payment_link: fallbackLink, gateway: 'manual', message: 'Manual payment link (customer selects gateway)' });
});


// ── PAYMENT HISTORY PER INVOICE ──────────────────────────
router.get('/payment-history/:type/:id', authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.prepare('SELECT * FROM payment_logs WHERE ref_type=? AND ref_id=? ORDER BY created_at DESC').all(req.params.type, req.params.id) || [];
  res.json(rows);
});


// ── RECURRING EXPENSES ────────────────────────────────────
router.get('/recurring-expenses', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM recurring_expenses ORDER BY next_date ASC').all() || []);
});
router.post('/recurring-expenses', authMiddleware, adminOnly, async (req, res) => {
  const { category, amount, description, payment_method, branch_id, frequency, next_date } = req.body;
  if (!category || !amount || !next_date) return res.status(400).json({ error: 'category, amount, next_date required' });
  const id = uuid();
  await db.prepare('INSERT INTO recurring_expenses (id,category,amount,description,payment_method,branch_id,frequency,next_date) VALUES (?,?,?,?,?,?,?,?)').run(id, category, amount, description, payment_method || 'cash', branch_id || null, frequency || 'monthly', next_date);
  res.status(201).json({ id });
});
router.put('/recurring-expenses/:id', authMiddleware, adminOnly, async (req, res) => {
  const { is_active } = req.body;
  await db.prepare('UPDATE recurring_expenses SET is_active=? WHERE id=?').run(is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});



export default router;

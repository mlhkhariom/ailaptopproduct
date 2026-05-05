import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// ── JOB CARDS (service_bookings extended) ────────────────

router.get('/job-cards', authMiddleware, adminOnly, async (req, res) => {
  const { status, branch_id, from, to, search } = req.query;
  let q = 'SELECT * FROM service_bookings WHERE 1=1';
  const params = [];
  if (status && status !== 'all') { q += ' AND status=?'; params.push(status); }
  if (branch_id) { q += ' AND branch_id=?'; params.push(branch_id); }
  if (from) { q += ' AND DATE(created_at)>=?'; params.push(from); }
  if (to) { q += ' AND DATE(created_at)<=?'; params.push(to); }
  if (search) { q += ' AND (customer_name ILIKE ? OR booking_number ILIKE ? OR device_brand ILIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  q += ' ORDER BY created_at DESC';
  const rows = await db.prepare(q).all(...params);
  res.json((rows || []).map(r => ({ ...r, parts_used: typeof r.parts_used === 'string' ? JSON.parse(r.parts_used || '[]') : (r.parts_used || []) })));
});

router.post('/job-cards', authMiddleware, adminOnly, async (req, res) => {
  const { customer_name, customer_phone, customer_email, service_id, service_name,
    device_brand, device_model, issue_description, priority, technician, diagnosis,
    parts_used, labour_charge, parts_charge, preferred_date } = req.body;
  if (!customer_name || !customer_phone) return res.status(400).json({ error: 'name and phone required' });
  const id = uuid();
  const booking_number = 'JC-' + Date.now().toString().slice(-6);
  const total_charge = (labour_charge || 0) + (parts_charge || 0);
  await db.prepare(`INSERT INTO service_bookings 
    (id,booking_number,customer_name,customer_phone,customer_email,service_id,service_name,
    device_brand,device_model,issue_description,priority,technician,diagnosis,
    parts_used,labour_charge,parts_charge,total_charge,preferred_date,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')`)
    .run(id, booking_number, customer_name, customer_phone, customer_email,
      service_id || null, service_name || 'General Repair',
      device_brand, device_model, issue_description,
      priority || 'normal', technician, diagnosis,
      JSON.stringify(parts_used || []), labour_charge || 0, parts_charge || 0, total_charge,
      preferred_date);
  await db.prepare('INSERT INTO notifications (id,type,title,message,link) VALUES (?,?,?,?,?)')
    .run(uuid(), 'service', 'New Job Card', `${customer_name} - ${device_brand} ${device_model}`, '/admin/erp/job-cards');
  res.status(201).json({ id, booking_number });
});

router.put('/job-cards/:id', authMiddleware, adminOnly, async (req, res) => {
  const { status, technician, diagnosis, parts_used, labour_charge, parts_charge,
    payment_status, payment_method, notes, priority } = req.body;
  const total_charge = (labour_charge || 0) + (parts_charge || 0);
  const completed_at = status === 'completed' ? new Date().toISOString() : null;
  await db.prepare(`UPDATE service_bookings SET status=?,technician=?,diagnosis=?,
    parts_used=?,labour_charge=?,parts_charge=?,total_charge=?,
    payment_status=?,payment_method=?,notes=?,priority=?,
    completed_at=COALESCE(?,completed_at) WHERE id=?`)
    .run(status, technician, diagnosis, JSON.stringify(parts_used || []),
      labour_charge || 0, parts_charge || 0, total_charge,
      payment_status, payment_method, notes, priority || 'normal',
      completed_at, req.params.id);

  // WhatsApp notification on status change
  try {
    const job = await db.prepare('SELECT * FROM service_bookings WHERE id=?').get(req.params.id);
    if (job?.customer_phone) {
      const { queueNotification } = await import('../whatsapp/notifications.js');
      let msg = null;
      if (status === 'in_progress') msg = `🔧 *Job Update — AI Laptop Wala*\n\nNamaste ${job.customer_name}! 🙏\n\nAapka ${job.device_brand} ${job.device_model} repair shuru ho gaya hai.\n*Job ID:* ${job.booking_number}\n*Technician:* ${technician || 'Our Expert'}\n\nUpdate milte rahenge. 📞 +91 98934 96163`;
      if (status === 'completed') msg = `✅ *Repair Complete — AI Laptop Wala*\n\nNamaste ${job.customer_name}! 🙏\n\nAapka ${job.device_brand} ${job.device_model} repair ho gaya hai!\n*Job ID:* ${job.booking_number}\n*Total:* ₹${((labour_charge || 0) + (parts_charge || 0)).toLocaleString('en-IN')}\n\nPickup ke liye call karein: 📞 +91 98934 96163\nSilver Mall, RNT Marg, Indore`;
      if (msg) await queueNotification(job.customer_phone, msg, 'job_update');
    }
  } catch {}

  res.json({ message: 'Updated' });
});

router.delete('/job-cards/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM service_bookings WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── EXPENSES ──────────────────────────────────────────────

router.get('/expenses', authMiddleware, adminOnly, async (req, res) => {
  const { from, to } = req.query;
  let q = 'SELECT * FROM expenses WHERE 1=1';
  const params = [];
  if (from) { q += ' AND date>=?'; params.push(from); }
  if (to) { q += ' AND date<=?'; params.push(to); }
  q += ' ORDER BY date DESC, created_at DESC';
  res.json(await db.prepare(q).all(...params) || []);
});

router.post('/expenses', authMiddleware, adminOnly, async (req, res) => {
  const { category, amount, description, payment_method, date } = req.body;
  if (!category || !amount) return res.status(400).json({ error: 'category and amount required' });
  const id = uuid();
  await db.prepare('INSERT INTO expenses (id,category,amount,description,payment_method,date,created_by) VALUES (?,?,?,?,?,?,?)')
    .run(id, category, amount, description, payment_method || 'cash', date || new Date().toISOString().split('T')[0], req.user.id);
  res.status(201).json({ id });
});

router.delete('/expenses/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM expenses WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

router.put('/expenses/:id', authMiddleware, adminOnly, async (req, res) => {
  const { category, amount, description, payment_method, date } = req.body;
  await db.prepare('UPDATE expenses SET category=?,amount=?,description=?,payment_method=?,date=? WHERE id=?')
    .run(category, amount, description, payment_method, date, req.params.id);
  res.json({ message: 'Updated' });
});

// ── STAFF ─────────────────────────────────────────────────

router.get('/staff', authMiddleware, adminOnly, async (req, res) => {
  const { include_inactive } = req.query;
  const q = include_inactive
    ? 'SELECT * FROM staff ORDER BY is_active DESC, name ASC'
    : 'SELECT * FROM staff WHERE is_active=1 ORDER BY name ASC';
  res.json(await db.prepare(q).all() || []);
});

router.post('/staff', authMiddleware, adminOnly, async (req, res) => {
  const { name, role, phone, email, salary, joining_date, address } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  await db.prepare('INSERT INTO staff (id,name,role,phone,email,salary,joining_date,address) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, name, role, phone, email, salary || 0, joining_date, address);
  res.status(201).json({ id });
});

router.put('/staff/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, role, phone, email, salary, joining_date, address, is_active } = req.body;
  await db.prepare('UPDATE staff SET name=?,role=?,phone=?,email=?,salary=?,joining_date=?,address=?,is_active=? WHERE id=?')
    .run(name, role, phone, email, salary, joining_date, address, is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

router.delete('/staff/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('UPDATE staff SET is_active=0 WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── ERP DASHBOARD STATS ───────────────────────────────────

router.get('/dashboard', authMiddleware, adminOnly, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.slice(0, 7) + '-01';

  const [pendingJobs, completedToday, monthRevenue, monthExpenses, totalStaff, pendingPayments] = await Promise.all([
    db.prepare("SELECT COUNT(*) as c FROM service_bookings WHERE status IN ('pending','in_progress')").get(),
    db.prepare("SELECT COUNT(*) as c FROM service_bookings WHERE DATE(completed_at)=?").get(today),
    db.prepare("SELECT COALESCE(SUM(total_charge),0) as v FROM service_bookings WHERE payment_status='paid' AND DATE(created_at)>=?").get(monthStart),
    db.prepare("SELECT COALESCE(SUM(amount),0) as v FROM expenses WHERE date>=?").get(monthStart),
    db.prepare("SELECT COUNT(*) as c FROM staff WHERE is_active=1").get(),
    db.prepare("SELECT COUNT(*) as c FROM service_bookings WHERE payment_status='pending' AND status='completed'").get(),
  ]);

  res.json({
    pendingJobs: pendingJobs?.c || 0,
    completedToday: completedToday?.c || 0,
    monthRevenue: monthRevenue?.v || 0,
    monthExpenses: monthExpenses?.v || 0,
    netProfit: (monthRevenue?.v || 0) - (monthExpenses?.v || 0),
    totalStaff: totalStaff?.c || 0,
    pendingPayments: pendingPayments?.c || 0,
  });
});

// ── CRM / LEADS ───────────────────────────────────────────

// CRM Analytics — registered FIRST to avoid :id conflict
router.get('/leads/analytics', authMiddleware, adminOnly, async (req, res) => {
  const [total, byStatus, bySource, byStaff, overdue, pipelineValue] = await Promise.all([
    db.prepare('SELECT COUNT(*) as c FROM leads').get(),
    db.prepare("SELECT status, COUNT(*) as count FROM leads GROUP BY status").all(),
    db.prepare("SELECT source, COUNT(*) as count, SUM(CASE WHEN status='won' THEN 1 ELSE 0 END) as won FROM leads GROUP BY source ORDER BY count DESC").all(),
    db.prepare("SELECT assigned_to, COUNT(*) as total, SUM(CASE WHEN status='won' THEN 1 ELSE 0 END) as won FROM leads WHERE assigned_to IS NOT NULL AND assigned_to!='' GROUP BY assigned_to ORDER BY won DESC").all(),
    db.prepare("SELECT * FROM leads WHERE next_followup < CURRENT_DATE AND status NOT IN ('won','lost') ORDER BY next_followup ASC LIMIT 10").all(),
    db.prepare("SELECT COALESCE(SUM(deal_value),0) as v FROM leads WHERE status NOT IN ('won','lost')").get(),
  ]);
  const statusMap = {};
  (byStatus || []).forEach(r => { statusMap[r.status] = r.count; });
  const conversionRate = total?.c ? Math.round(((statusMap.won || 0) / total.c) * 100) : 0;
  res.json({
    total: total?.c || 0, byStatus: statusMap, bySource: bySource || [],
    byStaff: byStaff || [], overdue: overdue || [],
    pipelineValue: pipelineValue?.v || 0, conversionRate,
  });
});

router.get('/leads', authMiddleware, adminOnly, async (req, res) => {
  const { status, source, priority, assigned_to, search } = req.query;
  let q = 'SELECT * FROM leads WHERE 1=1';
  const params = [];
  if (status && status !== 'all') { q += ' AND status=?'; params.push(status); }
  if (source && source !== 'all') { q += ' AND source=?'; params.push(source); }
  if (priority && priority !== 'all') { q += ' AND priority=?'; params.push(priority); }
  if (assigned_to) { q += ' AND assigned_to=?'; params.push(assigned_to); }
  if (search) { q += ' AND (name ILIKE ? OR phone ILIKE ? OR interest ILIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  q += ' ORDER BY next_followup ASC NULLS LAST, created_at DESC';
  res.json(await db.prepare(q).all(...params) || []);
});

router.post('/leads', authMiddleware, adminOnly, async (req, res) => {
  const { name, phone, email, source, interest, budget, deal_value, status, priority, assigned_to, notes, next_followup, expected_close, tags, score } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  await db.prepare(`INSERT INTO leads (id,name,phone,email,source,interest,budget,deal_value,status,priority,assigned_to,notes,next_followup,expected_close,tags,score)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, name, phone, email, source || 'walk-in', interest, budget || 0, deal_value || budget || 0,
      status || 'new', priority || 'normal', assigned_to, notes, next_followup, expected_close,
      JSON.stringify(tags || []), score || 0);
  res.status(201).json({ id });
});

router.put('/leads/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, phone, email, source, interest, budget, deal_value, status, priority, assigned_to, notes, next_followup, expected_close, lost_reason, tags, score } = req.body;
  await db.prepare(`UPDATE leads SET name=?,phone=?,email=?,source=?,interest=?,budget=?,deal_value=?,
    status=?,priority=?,assigned_to=?,notes=?,next_followup=?,expected_close=?,lost_reason=?,tags=?,score=?,updated_at=NOW() WHERE id=?`)
    .run(name, phone, email, source, interest, budget || 0, deal_value || budget || 0,
      status, priority, assigned_to, notes, next_followup, expected_close, lost_reason,
      JSON.stringify(tags || []), score || 0, req.params.id);
  res.json({ message: 'Updated' });
});

// PATCH — quick status update
router.patch('/leads/:id/status', authMiddleware, adminOnly, async (req, res) => {
  const { status, lost_reason } = req.body;
  await db.prepare('UPDATE leads SET status=?,lost_reason=?,updated_at=NOW() WHERE id=?').run(status, lost_reason || null, req.params.id);
  res.json({ message: 'Updated' });
});

router.delete('/leads/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM leads WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

router.get('/leads/:id/followups', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM followups WHERE lead_id=? ORDER BY created_at DESC').all(req.params.id) || []);
});

router.post('/leads/:id/followups', authMiddleware, adminOnly, async (req, res) => {
  const { type, notes, outcome, next_date } = req.body;
  const id = uuid();
  await db.prepare('INSERT INTO followups (id,lead_id,type,notes,outcome,next_date,created_by) VALUES (?,?,?,?,?,?,?)')
    .run(id, req.params.id, type || 'call', notes, outcome, next_date, req.user.id);
  if (next_date) await db.prepare('UPDATE leads SET next_followup=?,updated_at=NOW() WHERE id=?').run(next_date, req.params.id);
  // Auto-update lead score based on followup count
  const count = (await db.prepare('SELECT COUNT(*) as c FROM followups WHERE lead_id=?').get(req.params.id))?.c || 0;
  const score = Math.min(100, count * 15);
  await db.prepare('UPDATE leads SET score=? WHERE id=?').run(score, req.params.id);
  res.status(201).json({ id });
});
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
      } catch {}
    }
  }

  // WhatsApp send
  if (send_whatsapp && customer_phone) {
    try {
      const { queueNotification } = await import('../whatsapp/notifications.js');
      const invoiceUrl = `${process.env.FRONTEND_URL || 'https://ailaptopwala.com'}/api/invoice/${invoice_number}`;
      const msg = `🧾 *Invoice from AI Laptop Wala*\n\nNamaste ${customer_name}! 🙏\n\n*Invoice #:* ${invoice_number}\n*Amount:* ₹${total.toLocaleString('en-IN')}\n*Status:* ${payment_status === 'paid' ? 'Paid' : 'Pending'}\n\nView Invoice:\n${invoiceUrl}\n\n+91 98934 96163 | ailaptopwala.com`;
      await queueNotification(customer_phone, msg, 'invoice');
    } catch {}
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
      const invoiceUrl = `${process.env.FRONTEND_URL || 'https://ailaptopwala.com'}/api/invoice/${inv.invoice_number}`;
      const msg = `🧾 *Invoice from AI Laptop Wala*\n\nNamaste ${customer_name}! 🙏\n\n*Invoice #:* ${inv.invoice_number}\n*Amount:* ₹${total.toLocaleString('en-IN')}\n*Status:* ${payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}\n\n📄 View Invoice:\n${invoiceUrl}\n\n📞 +91 98934 96163`;
      await queueNotification(customer_phone, msg, 'invoice');
    } catch {}
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
        const invoiceUrl = `${process.env.FRONTEND_URL || 'https://ailaptopwala.com'}/api/invoice/${invoice_number}`;
        const msg = `🧾 *Invoice — AI Laptop Wala*\n\nNamaste ${customer_name || 'Customer'}! 🙏\n\n*Invoice #:* ${invoice_number}\n*Amount:* ₹${Number(amount || 0).toLocaleString('en-IN')}\n*Status:* ${payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}\n\n📄 View Invoice:\n${invoiceUrl}\n\n📞 +91 98934 96163 | ailaptopwala.com`;
        await queueNotification(phone, msg, 'invoice');
      }
    } catch {}
  }

  res.json({ message: 'Updated' });
});

// ── BRANCHES ──────────────────────────────────────────────

router.get('/branches', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM branches ORDER BY name ASC').all() || []);
});

router.post('/branches', authMiddleware, adminOnly, async (req, res) => {
  const { name, address, phone, manager } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  await db.prepare('INSERT INTO branches (id,name,address,phone,manager) VALUES (?,?,?,?,?)').run(id, name, address, phone, manager);
  res.status(201).json({ id });
});

router.put('/branches/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, address, phone, manager, is_active } = req.body;
  await db.prepare('UPDATE branches SET name=?,address=?,phone=?,manager=?,is_active=? WHERE id=?').run(name, address, phone, manager, is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

// Branch stats
router.get('/branches/:id/stats', authMiddleware, adminOnly, async (req, res) => {
  const bid = req.params.id;
  const [orders, jobs] = await Promise.all([
    db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(total),0) as rev FROM orders WHERE branch_id=? AND payment_status='paid'").get(bid),
    db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(total_charge),0) as rev FROM service_bookings WHERE branch_id=? AND payment_status='paid'").get(bid),
  ]);
  res.json({ orders: orders?.c || 0, orderRevenue: orders?.rev || 0, jobs: jobs?.c || 0, jobRevenue: jobs?.rev || 0 });
});

export default router;

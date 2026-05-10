import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// ── JOB CARDS (service_bookings extended) ────────────────

// Public repair tracking — no auth required
router.get('/job-cards/track/:query', async (req, res) => {
  const q = req.params.query.trim();
  const row = await db.prepare(`SELECT booking_number, customer_name, device_brand, device_model,
    service_name, status, technician, diagnosis, total_charge, payment_status, gst_enabled,
    created_at, completed_at, warranty_days, warranty_expires_at
    FROM service_bookings WHERE booking_number=? OR customer_phone LIKE ?`)
    .get(q, `%${q.slice(-10)}%`);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

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
  // Auto-format: JC-YYYY-NNNN (sequential)
  const year = new Date().getFullYear();
  const lastJob = await db.prepare("SELECT booking_number FROM service_bookings WHERE booking_number LIKE ? ORDER BY created_at DESC LIMIT 1").get(`JC-${year}-%`);
  let seq = 1;
  if (lastJob?.booking_number) {
    const parts = lastJob.booking_number.split('-');
    seq = (parseInt(parts[2] || '0') || 0) + 1;
  }
  const booking_number = `JC-${year}-${String(seq).padStart(4, '0')}`;
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
    payment_status, payment_method, notes, priority, branch_id, gst_enabled } = req.body;
  const total_charge = (labour_charge || 0) + (parts_charge || 0);
  const completed_at = status === 'completed' ? new Date().toISOString() : null;

  // Get previous status to detect transition
  const prev = await db.prepare('SELECT status, parts_used FROM service_bookings WHERE id=?').get(req.params.id);

  const { sla_hours } = req.body;
  await db.prepare(`UPDATE service_bookings SET status=?,technician=?,diagnosis=?,
    parts_used=?,labour_charge=?,parts_charge=?,total_charge=?,
    payment_status=?,payment_method=?,notes=?,priority=?,branch_id=?,gst_enabled=?,
    sla_hours=COALESCE(?,sla_hours),completed_at=COALESCE(?,completed_at) WHERE id=?`)
    .run(status, technician, diagnosis, JSON.stringify(parts_used || []),
      labour_charge || 0, parts_charge || 0, total_charge,
      payment_status, payment_method, notes, priority || 'normal', branch_id,
      gst_enabled ? 1 : 0, sla_hours || null, completed_at, req.params.id);


  // Auto-earn loyalty points on job completion
  if (status === 'completed' && payment_status === 'paid' && req.body.total_charge > 0) {
    try {
      const job = await db.prepare('SELECT * FROM service_bookings WHERE id=?').get(req.params.id);
      if (job?.customer_phone) {
        const pts = Math.floor((req.body.total_charge || 0) / 100);
        if (pts > 0) {
          const existing = await db.prepare('SELECT * FROM loyalty_points WHERE phone=?').get(job.customer_phone);
          if (existing) {
            await db.prepare('UPDATE loyalty_points SET points=points+?,total_earned=total_earned+? WHERE phone=?').run(pts, pts, job.customer_phone);
          } else {
            await db.prepare('INSERT INTO loyalty_points (id,phone,customer_name,points,total_earned) VALUES (?,?,?,?,?)').run(uuid(), job.customer_phone, job.customer_name || '', pts, pts);
          }
          await db.prepare('INSERT INTO loyalty_transactions (id,phone,type,points,ref_id,ref_type,note) VALUES (?,?,?,?,?,?,?)').run(uuid(), job.customer_phone, 'earn', pts, req.params.id, 'job_card', `Earned ${pts} pts on repair ₹${req.body.total_charge}`);
        }
      }
    } catch (e) { console.error('Loyalty earn error:', e.message); }
  }

  // Auto-deduct parts from inventory when job completed (only on first completion)
  if (status === 'completed' && prev?.status !== 'completed' && parts_used?.length) {
    for (const part of parts_used) {
      if (part.product_id && part.qty > 0) {
        try {
          await db.prepare('UPDATE products SET stock=GREATEST(0,stock-?), in_stock=CASE WHEN stock-?>0 THEN 1 ELSE 0 END WHERE id=?')
            .run(part.qty, part.qty, part.product_id);
          await db.prepare('INSERT INTO stock_movements (id,product_id,type,quantity,reference_id,reference_type,notes,created_by) VALUES (?,?,?,?,?,?,?,?)')
            .run(uuid(), part.product_id, 'sale', part.qty, req.params.id, 'job_card', `Job card ${prev?.booking_number || req.params.id}`, req.user?.id || 'system');
          // Also deduct from branch_stock if branch_id set
          if (branch_id) {
            const bs = await db.prepare('SELECT * FROM branch_stock WHERE branch_id=? AND product_id=?').get(branch_id, part.product_id);
            if (bs) {
              await db.prepare('UPDATE branch_stock SET stock=GREATEST(0,stock-?) WHERE branch_id=? AND product_id=?').run(part.qty, branch_id, part.product_id);
              await db.prepare('INSERT INTO branch_stock_movements (id,branch_id,product_id,type,qty,note,ref_id) VALUES (?,?,?,?,?,?,?)').run(uuid(), branch_id, part.product_id, 'job_card_use', -part.qty, `Job card ${req.params.id}`, req.params.id);
            }
          }
        } catch (e) { console.error("Stock deduct error:", e.message); }
      }
    }
  }

  // WhatsApp notification on status change
  try {
    const job = await db.prepare('SELECT * FROM service_bookings WHERE id=?').get(req.params.id);
    if (job?.customer_phone) {
      const { queueNotification } = await import('../whatsapp/notifications.js');
      let msg = null;
      if (status === 'in_progress' && prev?.status !== 'in_progress')
        msg = `Job Update - AI Laptop Wala\n\nNamaste ${job.customer_name}!\n\nAapka ${job.device_brand} ${job.device_model} repair shuru ho gaya hai.\nJob ID: ${job.booking_number}\nTechnician: ${technician || 'Our Expert'}\n\n+91 98934 96163`;
      if (status === 'completed' && prev?.status !== 'completed')
        msg = `Repair Complete - AI Laptop Wala\n\nNamaste ${job.customer_name}!\n\nAapka ${job.device_brand} ${job.device_model} repair ho gaya hai!\nJob ID: ${job.booking_number}\nTotal: Rs.${total_charge.toLocaleString('en-IN')}\n\nPickup: +91 98934 96163\nSilver Mall, RNT Marg, Indore`;
      if (msg) await queueNotification(job.customer_phone, msg, 'job_update');
    }
  } catch (e) { console.error("Operation error:", e.message); }

  res.json({ message: 'Updated' });
});

router.delete('/job-cards/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM service_bookings WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── EXPENSES ──────────────────────────────────────────────

router.get('/expenses', authMiddleware, adminOnly, async (req, res) => {
  const { from, to, branch_id } = req.query;
  let q = 'SELECT * FROM expenses WHERE 1=1';
  const params = [];
  if (from) { q += ' AND date>=?'; params.push(from); }
  if (to) { q += ' AND date<=?'; params.push(to); }
  if (branch_id) { q += ' AND branch_id=?'; params.push(branch_id); }
  q += ' ORDER BY date DESC, created_at DESC';
  res.json(await db.prepare(q).all(...params) || []);
});

router.post('/expenses', authMiddleware, adminOnly, async (req, res) => {
  const { category, amount, description, payment_method, date, branch_id } = req.body;
  if (!category || !amount) return res.status(400).json({ error: 'category and amount required' });
  const id = uuid();
  await db.prepare('INSERT INTO expenses (id,category,amount,description,payment_method,date,branch_id,created_by) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, category, amount, description, payment_method || 'cash', date || new Date().toISOString().split('T')[0], branch_id || null, req.user.id);
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
  const { include_inactive, branch_id } = req.query;
  let q = include_inactive ? 'SELECT * FROM staff WHERE 1=1' : 'SELECT * FROM staff WHERE is_active=1';
  const params = [];
  if (branch_id) { q += ' AND branch_id=?'; params.push(branch_id); }
  q += ' ORDER BY is_active DESC, name ASC';
  res.json(await db.prepare(q).all(...params) || []);
});

router.post('/staff', authMiddleware, adminOnly, async (req, res) => {
  const { name, role, phone, email, salary, joining_date, address, branch_id, aadhaar_url, pan_url, offer_letter_url, other_doc_url, bank_account, bank_ifsc, bank_name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  await db.prepare('INSERT INTO staff (id,name,role,phone,email,salary,joining_date,address,branch_id,aadhaar_url,pan_url,offer_letter_url,other_doc_url,bank_account,bank_ifsc,bank_name) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, name, role, phone, email, salary || 0, joining_date, address, branch_id||null, aadhaar_url||null, pan_url||null, offer_letter_url||null, other_doc_url||null, bank_account||null, bank_ifsc||null, bank_name||null);
  res.status(201).json({ id });
});

router.put('/staff/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, role, phone, email, salary, joining_date, address, is_active, branch_id } = req.body;
  await db.prepare('UPDATE staff SET name=?,role=?,phone=?,email=?,salary=?,joining_date=?,address=?,is_active=?,branch_id=? WHERE id=?')
    .run(name, role, phone, email, salary, joining_date, address, is_active ? 1 : 0, branch_id || null, req.params.id);
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
  const { branch_id } = req.query;
  const bFilter = branch_id ? ' AND branch_id=?' : '';
  const bParam = branch_id ? [branch_id] : [];

  const [pendingJobs, completedToday, monthRevenue, monthExpenses, totalStaff, pendingPayments] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as c FROM service_bookings WHERE status IN ('pending','in_progress')${bFilter}`).get(...bParam),
    db.prepare(`SELECT COUNT(*) as c FROM service_bookings WHERE DATE(completed_at)=?${bFilter}`).get(today, ...bParam),
    db.prepare(`SELECT COALESCE(SUM(total_charge),0) as v FROM service_bookings WHERE payment_status='paid' AND DATE(created_at)>=?${bFilter}`).get(monthStart, ...bParam),
    db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM expenses WHERE date>=?${bFilter}`).get(monthStart, ...bParam),
    db.prepare(`SELECT COUNT(*) as c FROM staff WHERE is_active=1${bFilter}`).get(...bParam),
    db.prepare(`SELECT COUNT(*) as c FROM service_bookings WHERE payment_status='pending' AND status='completed'${bFilter}`).get(...bParam),
  ]);

  res.json({
    pendingJobs: pendingJobs?.c || 0,
    completedToday: completedToday?.c || 0,
    monthRevenue: monthRevenue?.v || 0,
    monthExpenses: monthExpenses?.v || 0,
    netProfit: (monthRevenue?.v || 0) - (monthExpenses?.v || 0),
    totalStaff: totalStaff?.c || 0,
    pendingPayments: pendingPayments?.c || 0,
    branch_id: branch_id || 'all',
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

  // Duplicate detection (skip if _force flag)
  if (!req.body._force && (phone || email)) {
    const existing = await db.prepare('SELECT id, name, status FROM leads WHERE (phone=? AND phone!=\'\') OR (email=? AND email!=\'\') LIMIT 1').get(phone || '', email || '');
    if (existing) return res.status(409).json({ error: 'duplicate', existing, message: `Lead already exists: ${existing.name} (${existing.status})` });
  }

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
  // Auto-score on update
  const statusBonus2 = { new: 0, contacted: 10, interested: 20, negotiation: 30, won: 40, lost: 0 };
  const budgetScore = budget > 50000 ? 20 : budget > 20000 ? 10 : budget > 5000 ? 5 : 0;
  const followupCount = (await db.prepare('SELECT COUNT(*) as c FROM followups WHERE lead_id=?').get(req.params.id))?.c || 0;
  const autoScore2 = Math.min(100, Math.min(40, followupCount * 10) + (statusBonus2[status] || 0) + budgetScore);
  const finalScore = score || autoScore2;
  await db.prepare(`UPDATE leads SET name=?,phone=?,email=?,source=?,interest=?,budget=?,deal_value=?,
    status=?,priority=?,assigned_to=?,notes=?,next_followup=?,expected_close=?,lost_reason=?,tags=?,score=?,updated_at=NOW() WHERE id=?`)
    .run(name, phone, email, source, interest, budget || 0, deal_value || budget || 0,
      status, priority, assigned_to, notes, next_followup, expected_close, lost_reason,
      JSON.stringify(tags || []), finalScore, req.params.id);
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
  // Auto-update lead score: followups + budget + status + recency
  const lead = await db.prepare('SELECT * FROM leads WHERE id=?').get(req.params.id);
  const count = (await db.prepare('SELECT COUNT(*) as c FROM followups WHERE lead_id=?').get(req.params.id))?.c || 0;
  let autoScore = 0;
  autoScore += Math.min(40, count * 10); // followups: max 40pts
  if (lead?.budget > 50000) autoScore += 20;
  else if (lead?.budget > 20000) autoScore += 10;
  else if (lead?.budget > 5000) autoScore += 5;
  const statusBonus = { new: 0, contacted: 10, interested: 20, negotiation: 30, won: 40, lost: 0 };
  autoScore += statusBonus[lead?.status] || 0;
  if (lead?.next_followup) {
    const daysUntil = Math.ceil((new Date(lead.next_followup) - new Date()) / 86400000);
    if (daysUntil >= 0 && daysUntil <= 3) autoScore += 10; // upcoming followup
  }
  await db.prepare('UPDATE leads SET score=? WHERE id=?').run(Math.min(100, autoScore), req.params.id);
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
      } catch (e) { console.error("Operation error:", e.message); }
    }
  }

  // WhatsApp send
  if (send_whatsapp && customer_phone) {
    try {
      const { queueNotification } = await import('../whatsapp/notifications.js');
      const invoiceUrl = `${process.env.FRONTEND_URL || 'https://ailaptopwala.com'}/api/invoice/${invoice_number}`;
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
      const invoiceUrl = `${process.env.FRONTEND_URL || 'https://ailaptopwala.com'}/api/invoice/${inv.invoice_number}`;
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
        const invoiceUrl = `${process.env.FRONTEND_URL || 'https://ailaptopwala.com'}/api/invoice/${invoice_number}`;
        const msg = `🧾 *Invoice — AI Laptop Wala*\n\nNamaste ${customer_name || 'Customer'}! 🙏\n\n*Invoice #:* ${invoice_number}\n*Amount:* ₹${Number(amount || 0).toLocaleString('en-IN')}\n*Status:* ${payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}\n\n📄 View Invoice:\n${invoiceUrl}\n\n📞 +91 98934 96163 | ailaptopwala.com`;
        await queueNotification(phone, msg, 'invoice');
      }
    } catch (e) { console.error("Operation error:", e.message); }
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

// ── JOB CARD TIMELINE ─────────────────────────────────────

router.get('/job-cards/:id/timeline', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM job_card_timeline WHERE job_id=? ORDER BY created_at ASC').all(req.params.id) || []);
});

router.post('/job-cards/:id/timeline', authMiddleware, adminOnly, async (req, res) => {
  const { status, notes } = req.body;
  const id = uuid();
  await db.prepare('INSERT INTO job_card_timeline (id,job_id,status,notes,created_by) VALUES (?,?,?,?,?)').run(id, req.params.id, status, notes, req.user.id);
  res.status(201).json({ id });
});

// ── WARRANTY ──────────────────────────────────────────────

router.get('/warranty/expiring', authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.prepare(`SELECT * FROM service_bookings WHERE warranty_expires_at IS NOT NULL AND warranty_expires_at >= CURRENT_DATE AND warranty_expires_at <= CURRENT_DATE + INTERVAL '30 days' ORDER BY warranty_expires_at ASC`).all();
  res.json(rows || []);
});

// ── ATTENDANCE ────────────────────────────────────────────

router.get('/attendance', authMiddleware, adminOnly, async (req, res) => {
  const { date, staff_id, month } = req.query;
  let q = `SELECT a.*, s.name as staff_name, s.role FROM attendance a LEFT JOIN staff s ON a.staff_id=s.id WHERE 1=1`;
  const p = [];
  if (date) { q += ' AND a.date=?'; p.push(date); }
  if (staff_id) { q += ' AND a.staff_id=?'; p.push(staff_id); }
  if (month) { q += ' AND TO_CHAR(a.date,\'YYYY-MM\')=?'; p.push(month); }
  q += ' ORDER BY a.date DESC, s.name ASC';
  res.json(await db.prepare(q).all(...p) || []);
});

router.post('/attendance', authMiddleware, adminOnly, async (req, res) => {
  const { staff_id, date, status, check_in, check_out, notes } = req.body;
  if (!staff_id || !date) return res.status(400).json({ error: 'staff_id and date required' });
  const id = uuid();
  await db.prepare(`INSERT INTO attendance (id,staff_id,date,status,check_in,check_out,notes) VALUES (?,?,?,?,?,?,?)
    ON CONFLICT (staff_id,date) DO UPDATE SET status=EXCLUDED.status,check_in=EXCLUDED.check_in,check_out=EXCLUDED.check_out,notes=EXCLUDED.notes`)
    .run(id, staff_id, date, status || 'present', check_in, check_out, notes);
  res.status(201).json({ message: 'Saved' });
});

router.get('/attendance/stats', authMiddleware, adminOnly, async (req, res) => {
  const { month } = req.query;
  const m = month || new Date().toISOString().slice(0, 7);
  const rows = await db.prepare(`SELECT s.id, s.name, s.role,
    COUNT(CASE WHEN a.status='present' THEN 1 END) as present,
    COUNT(CASE WHEN a.status='absent' THEN 1 END) as absent,
    COUNT(CASE WHEN a.status='half_day' THEN 1 END) as half_day,
    COUNT(CASE WHEN a.status='leave' THEN 1 END) as leave
    FROM staff s LEFT JOIN attendance a ON s.id=a.staff_id AND TO_CHAR(a.date,'YYYY-MM')=?
    WHERE s.is_active=1 GROUP BY s.id, s.name, s.role ORDER BY s.name`).all(m);
  res.json(rows || []);
});

// ── WHATSAPP TEMPLATES ────────────────────────────────────

router.get('/wa-templates', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM whatsapp_templates WHERE is_active=1 ORDER BY category, name').all() || []);
});

router.post('/wa-templates', authMiddleware, adminOnly, async (req, res) => {
  const { name, category, message, variables } = req.body;
  if (!name || !message) return res.status(400).json({ error: 'name and message required' });
  const id = uuid();
  await db.prepare('INSERT INTO whatsapp_templates (id,name,category,message,variables) VALUES (?,?,?,?,?)').run(id, name, category || 'general', message, JSON.stringify(variables || []));
  res.status(201).json({ id });
});

router.put('/wa-templates/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, category, message, variables, is_active } = req.body;
  await db.prepare('UPDATE whatsapp_templates SET name=?,category=?,message=?,variables=?,is_active=? WHERE id=?').run(name, category, message, JSON.stringify(variables || []), is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

router.delete('/wa-templates/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM whatsapp_templates WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// Send template to a contact
router.post('/wa-templates/:id/send', authMiddleware, adminOnly, async (req, res) => {
  const { phone, variables } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  const tmpl = await db.prepare('SELECT * FROM whatsapp_templates WHERE id=?').get(req.params.id);
  if (!tmpl) return res.status(404).json({ error: 'Template not found' });
  let msg = tmpl.message;
  if (variables) Object.entries(variables).forEach(([k, v]) => { msg = msg.replace(new RegExp(`{{${k}}}`, 'g'), v); });
  try {
    const { queueNotification } = await import('../whatsapp/notifications.js');
    await queueNotification(phone, msg, 'template');
    res.json({ message: 'Queued' });
  } catch { res.status(500).json({ error: 'Failed to queue' }); }
});


// ── JOB CARD PHOTOS ───────────────────────────────────────

router.put('/job-cards/:id/photos', authMiddleware, adminOnly, async (req, res) => {
  const { photos_before, photos_after } = req.body;
  await db.prepare('UPDATE service_bookings SET photos_before=?,photos_after=? WHERE id=?')
    .run(JSON.stringify(photos_before || []), JSON.stringify(photos_after || []), req.params.id);
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

// ── TECHNICIAN PERFORMANCE ────────────────────────────────

router.get('/technician-performance', authMiddleware, adminOnly, async (req, res) => {
  const { from, to } = req.query;
  let q = `SELECT technician, COUNT(*) as total_jobs,
    COUNT(CASE WHEN status='completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status IN ('pending','in_progress') THEN 1 END) as active,
    COALESCE(SUM(CASE WHEN payment_status='paid' THEN total_charge ELSE 0 END),0) as revenue,
    COALESCE(AVG(CASE WHEN completed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (completed_at::timestamptz - created_at::timestamptz))/3600 END),0) as avg_hours
    FROM service_bookings WHERE technician IS NOT NULL AND technician!=''`;
  const p = [];
  if (from) { q += ' AND DATE(created_at)>=?'; p.push(from); }
  if (to) { q += ' AND DATE(created_at)<=?'; p.push(to); }
  q += ' GROUP BY technician ORDER BY revenue DESC';
  res.json(await db.prepare(q).all(...p) || []);
});

// ── CUSTOMER 360 VIEW ─────────────────────────────────────

router.get('/customer360/:phone', authMiddleware, adminOnly, async (req, res) => {
  const phone = req.params.phone.replace(/[^0-9]/g, '');
  const phoneVariants = [phone, `+91${phone}`, `91${phone}`, phone.slice(-10)];
  const placeholders = phoneVariants.map(() => '?').join(',');

  const [orders, jobs, invoices, leads, contacts] = await Promise.all([
    db.prepare(`SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE u.phone IN (${placeholders}) OR JSON_EXTRACT(o.address,'$.phone') IN (${placeholders}) ORDER BY o.created_at DESC LIMIT 20`).all(...phoneVariants, ...phoneVariants),
    db.prepare(`SELECT * FROM service_bookings WHERE customer_phone IN (${placeholders}) ORDER BY created_at DESC LIMIT 20`).all(...phoneVariants),
    db.prepare(`SELECT * FROM custom_invoices WHERE customer_phone IN (${placeholders}) ORDER BY created_at DESC LIMIT 20`).all(...phoneVariants),
    db.prepare(`SELECT * FROM leads WHERE phone IN (${placeholders}) ORDER BY created_at DESC LIMIT 10`).all(...phoneVariants),
    db.prepare(`SELECT * FROM contact_queries WHERE phone IN (${placeholders}) ORDER BY created_at DESC LIMIT 10`).all(...phoneVariants),
  ]);

  const totalSpent = [
    ...orders.filter(o => o.payment_status === 'paid').map(o => o.total || 0),
    ...jobs.filter(j => j.payment_status === 'paid').map(j => j.total_charge || 0),
    ...invoices.filter(i => i.payment_status === 'paid').map(i => i.total || 0),
  ].reduce((s, v) => s + v, 0);

  res.json({ phone, orders, jobs, invoices, leads, contacts, totalSpent, totalTransactions: orders.length + jobs.length + invoices.length });
});

// ── GST REPORT ────────────────────────────────────────────

router.get('/gst-report', authMiddleware, adminOnly, async (req, res) => {
  const { from, to } = req.query;
  const today = new Date().toISOString().split('T')[0];
  const f = from || today.slice(0, 7) + '-01';
  const t = to || today;

  // B2C sales (orders)
  const orders = await db.prepare(`SELECT o.order_number, o.total, o.created_at, u.name as customer_name, u.phone
    FROM orders o LEFT JOIN users u ON o.user_id=u.id
    WHERE o.payment_status='paid' AND DATE(o.created_at) BETWEEN ? AND ?`).all(f, t) || [];

  // Service invoices with GST
  const services = await db.prepare(`SELECT booking_number, customer_name, customer_phone, total_charge, labour_charge, parts_charge, gst_enabled, created_at
    FROM service_bookings WHERE payment_status='paid' AND DATE(created_at) BETWEEN ? AND ?`).all(f, t) || [];

  // Custom invoices with GST
  const customs = await db.prepare(`SELECT invoice_number, customer_name, customer_phone, total, subtotal, discount, gst_enabled, created_at
    FROM custom_invoices WHERE payment_status='paid' AND DATE(created_at) BETWEEN ? AND ?`).all(f, t) || [];

  const serviceGST = services.filter(s => s.gst_enabled).reduce((sum, s) => sum + Math.round((s.total_charge || 0) * 0.18), 0);
  const customGST = customs.filter(c => c.gst_enabled).reduce((sum, c) => {
    const after = (c.subtotal || 0) - (c.discount || 0);
    return sum + Math.round(after * 0.18);
  }, 0);
  const totalGST = serviceGST + customGST;

  res.json({
    period: { from: f, to: t },
    orders: { count: orders.length, total: orders.reduce((s, o) => s + (o.total || 0), 0), items: orders },
    services: { count: services.length, total: services.reduce((s, j) => s + (j.total_charge || 0), 0), gst: serviceGST, items: services },
    customs: { count: customs.length, total: customs.reduce((s, c) => s + (c.total || 0), 0), gst: customGST, items: customs },
    summary: { totalGST, cgst: Math.round(totalGST / 2), sgst: Math.round(totalGST / 2) },
  });
});

// ── SALES FORECASTING ─────────────────────────────────────

router.get('/forecast', authMiddleware, adminOnly, async (req, res) => {
  // Last 3 months revenue by week
  const rows = await db.prepare(`
    SELECT DATE_TRUNC('week', created_at::timestamptz) as week,
      COALESCE(SUM(total),0) as order_rev
    FROM orders WHERE payment_status='paid' AND created_at >= NOW() - INTERVAL '90 days'
    GROUP BY week ORDER BY week ASC`).all() || [];

  const serviceRows = await db.prepare(`
    SELECT DATE_TRUNC('week', created_at::timestamptz) as week,
      COALESCE(SUM(total_charge),0) as service_rev
    FROM service_bookings WHERE payment_status='paid' AND created_at >= NOW() - INTERVAL '90 days'
    GROUP BY week ORDER BY week ASC`).all() || [];

  // Simple linear regression for next 4 weeks
  const weekMap = {};
  rows.forEach(r => { weekMap[r.week] = (weekMap[r.week] || 0) + (r.order_rev || 0); });
  serviceRows.forEach(r => { weekMap[r.week] = (weekMap[r.week] || 0) + (r.service_rev || 0); });

  const weeks = Object.entries(weekMap).sort(([a], [b]) => a.localeCompare(b));
  const n = weeks.length;
  const avgRevenue = n ? weeks.reduce((s, [, v]) => s + v, 0) / n : 0;
  const trend = n > 1 ? (weeks[n - 1][1] - weeks[0][1]) / n : 0;

  const forecast = [1, 2, 3, 4].map(i => ({
    week: `Week +${i}`,
    predicted: Math.max(0, Math.round(avgRevenue + trend * i)),
  }));

  // Pipeline value from CRM
  const pipeline = await db.prepare("SELECT COALESCE(SUM(deal_value),0) as v FROM leads WHERE status NOT IN ('won','lost')").get();

  res.json({ historical: weeks.map(([week, rev]) => ({ week, rev })), forecast, avgWeeklyRevenue: Math.round(avgRevenue), pipelineValue: pipeline?.v || 0 });
});

// ── INTER-BRANCH STOCK TRANSFER ───────────────────────────

router.post('/stock-transfer', authMiddleware, adminOnly, async (req, res) => {
  const { product_id, from_branch, to_branch, quantity, notes } = req.body;
  if (!product_id || !from_branch || !to_branch || !quantity) return res.status(400).json({ error: 'All fields required' });
  if (from_branch === to_branch) return res.status(400).json({ error: 'Same branch' });

  const product = await db.prepare('SELECT * FROM products WHERE id=?').get(product_id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if ((product.stock || 0) < quantity) return res.status(400).json({ error: `Insufficient stock. Available: ${product.stock}` });

  const transferId = uuid();
  // Deduct from source
  await db.prepare('UPDATE products SET stock=stock-? WHERE id=?').run(quantity, product_id);
  await db.prepare('INSERT INTO stock_movements (id,product_id,type,quantity,reference_id,reference_type,notes,created_by) VALUES (?,?,?,?,?,?,?,?)')
    .run(uuid(), product_id, 'transfer_out', quantity, transferId, 'branch_transfer', `Transfer to ${to_branch}: ${notes || ''}`, req.user.id);

  // In a real multi-branch system, each branch would have its own stock table
  // For now, log the transfer and notify
  await db.prepare('INSERT INTO stock_movements (id,product_id,type,quantity,reference_id,reference_type,notes,created_by) VALUES (?,?,?,?,?,?,?,?)')
    .run(uuid(), product_id, 'transfer_in', quantity, transferId, 'branch_transfer', `Transfer from ${from_branch}: ${notes || ''}`, req.user.id);

  await db.prepare('INSERT INTO notifications (id,type,title,message,link) VALUES (?,?,?,?,?)')
    .run(uuid(), 'inventory', 'Stock Transfer', `${quantity}x ${product.name} transferred to ${to_branch}`, '/admin/inventory');

  res.status(201).json({ transfer_id: transferId, message: `${quantity} units transferred` });
});

// ── LEAVE MANAGEMENT ─────────────────────────────────────

router.get('/leaves', authMiddleware, adminOnly, async (req, res) => {
  const { staff_id, status } = req.query;
  let q = `SELECT l.*, s.name as staff_name, s.role FROM leave_requests l LEFT JOIN staff s ON l.staff_id=s.id WHERE 1=1`;
  const p = [];
  if (staff_id) { q += ' AND l.staff_id=?'; p.push(staff_id); }
  if (status) { q += ' AND l.status=?'; p.push(status); }
  q += ' ORDER BY l.created_at DESC';
  res.json(await db.prepare(q).all(...p) || []);
});

router.post('/leaves', authMiddleware, adminOnly, async (req, res) => {
  const { staff_id, type, from_date, to_date, reason } = req.body;
  if (!staff_id || !from_date || !to_date) return res.status(400).json({ error: 'staff_id, from_date, to_date required' });
  const days = Math.ceil((new Date(to_date) - new Date(from_date)) / 86400000) + 1;
  const id = uuid();
  await db.prepare('INSERT INTO leave_requests (id,staff_id,type,from_date,to_date,days,reason) VALUES (?,?,?,?,?,?,?)').run(id, staff_id, type || 'casual', from_date, to_date, days, reason);
  res.status(201).json({ id, days });
});

router.patch('/leaves/:id', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.body;
  await db.prepare('UPDATE leave_requests SET status=?,approved_by=? WHERE id=?').run(status, req.user.id, req.params.id);
  if (status === 'approved') {
    const leave = await db.prepare('SELECT * FROM leave_requests WHERE id=?').get(req.params.id);
    if (leave) {
      const d = new Date(leave.from_date);
      while (d <= new Date(leave.to_date)) {
        const ds = d.toISOString().split('T')[0];
        await db.prepare(`INSERT INTO attendance (id,staff_id,date,status) VALUES (?,?,?,'leave') ON CONFLICT (staff_id,date) DO UPDATE SET status='leave'`).run(uuid(), leave.staff_id, ds);
        d.setDate(d.getDate() + 1);
      }
    }
  }
  res.json({ message: 'Updated' });
});

// ── SERIAL NUMBERS ────────────────────────────────────────

router.get('/serials', authMiddleware, adminOnly, async (req, res) => {
  const { product_id, status } = req.query;
  let q = `SELECT sn.*, p.name as product_name FROM serial_numbers sn LEFT JOIN products p ON sn.product_id=p.id WHERE 1=1`;
  const p = [];
  if (product_id) { q += ' AND sn.product_id=?'; p.push(product_id); }
  if (status) { q += ' AND sn.status=?'; p.push(status); }
  q += ' ORDER BY sn.created_at DESC';
  res.json(await db.prepare(q).all(...p) || []);
});

router.post('/serials', authMiddleware, adminOnly, async (req, res) => {
  const { product_id, serial, notes } = req.body;
  if (!product_id || !serial) return res.status(400).json({ error: 'product_id and serial required' });
  const id = uuid();
  await db.prepare('INSERT INTO serial_numbers (id,product_id,serial,notes) VALUES (?,?,?,?)').run(id, product_id, serial.trim().toUpperCase(), notes);
  res.status(201).json({ id });
});

router.get('/serials/lookup/:serial', async (req, res) => {
  const row = await db.prepare(`SELECT sn.*, p.name as product_name FROM serial_numbers sn LEFT JOIN products p ON sn.product_id=p.id WHERE sn.serial=?`).get(req.params.serial.trim().toUpperCase());
  if (!row) return res.status(404).json({ error: 'Serial not found' });
  res.json(row);
});

// ── COMMISSION TRACKING ───────────────────────────────────

router.get('/commissions', authMiddleware, adminOnly, async (req, res) => {
  const { staff_id, status } = req.query;
  let q = 'SELECT * FROM commissions WHERE 1=1';
  const p = [];
  if (staff_id) { q += ' AND staff_id=?'; p.push(staff_id); }
  if (status) { q += ' AND status=?'; p.push(status); }
  q += ' ORDER BY created_at DESC';
  res.json(await db.prepare(q).all(...p) || []);
});

router.post('/commissions', authMiddleware, adminOnly, async (req, res) => {
  const { staff_id, staff_name, reference_type, reference_id, amount, rate } = req.body;
  if (!staff_id || !amount) return res.status(400).json({ error: 'staff_id and amount required' });
  const id = uuid();
  await db.prepare('INSERT INTO commissions (id,staff_id,staff_name,reference_type,reference_id,amount,rate) VALUES (?,?,?,?,?,?,?)').run(id, staff_id, staff_name, reference_type || 'manual', reference_id || '', amount, rate || 0);
  res.status(201).json({ id });
});

router.patch('/commissions/:id/pay', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare("UPDATE commissions SET status='paid' WHERE id=?").run(req.params.id);
  res.json({ message: 'Marked as paid' });
});

router.get('/commissions/summary', authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.prepare(`SELECT staff_id, staff_name,
    COALESCE(SUM(amount),0) as total,
    COALESCE(SUM(CASE WHEN status='pending' THEN amount ELSE 0 END),0) as pending,
    COALESCE(SUM(CASE WHEN status='paid' THEN amount ELSE 0 END),0) as paid,
    COUNT(*) as count FROM commissions GROUP BY staff_id, staff_name ORDER BY total DESC`).all();
  res.json(rows || []);
});

export default router;

// ── SLA TRACKING ──────────────────────────────────────────

router.get('/sla-report', authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.prepare(`
    SELECT *, 
      EXTRACT(EPOCH FROM (NOW() - created_at::timestamptz))/3600 as hours_elapsed,
      CASE WHEN EXTRACT(EPOCH FROM (NOW() - created_at::timestamptz))/3600 > COALESCE(sla_hours,24) 
           AND status NOT IN ('completed','cancelled') THEN 1 ELSE 0 END as is_breached
    FROM service_bookings 
    WHERE status NOT IN ('completed','cancelled')
    ORDER BY created_at ASC
  `).all() || [];
  // Auto-mark breached
  for (const r of rows) {
    if (r.is_breached && !r.sla_breached) {
      await db.prepare('UPDATE service_bookings SET sla_breached=1 WHERE id=?').run(r.id);
    }
  }
  res.json(rows);
});

router.patch('/job-cards/:id/sla', authMiddleware, adminOnly, async (req, res) => {
  const { sla_hours } = req.body;
  await db.prepare('UPDATE service_bookings SET sla_hours=? WHERE id=?').run(sla_hours || 24, req.params.id);
  res.json({ message: 'SLA updated' });
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

// ── PRODUCT BUNDLES ───────────────────────────────────────

router.get('/bundles', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM product_bundles WHERE is_active=1 ORDER BY name ASC').all() || []);
});

router.post('/bundles', authMiddleware, adminOnly, async (req, res) => {
  const { name, description, price, components } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'name and price required' });
  const id = uuid();
  await db.prepare('INSERT INTO product_bundles (id,name,description,price,components) VALUES (?,?,?,?,?)').run(id, name, description, price, JSON.stringify(components || []));
  res.status(201).json({ id });
});

router.put('/bundles/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, description, price, components, is_active } = req.body;
  await db.prepare('UPDATE product_bundles SET name=?,description=?,price=?,components=?,is_active=? WHERE id=?').run(name, description, price, JSON.stringify(components || []), is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

// ── STOCK AGING REPORT ────────────────────────────────────

router.get('/stock-aging', authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.prepare(`
    SELECT p.id, p.name, p.category, p.stock, p.price, p.created_at,
      EXTRACT(DAY FROM NOW() - p.created_at::timestamptz) as days_in_stock,
      p.stock * p.price as stock_value
    FROM products p
    WHERE p.status='active' AND p.stock > 0
    ORDER BY days_in_stock DESC
  `).all() || [];
  const aged30 = rows.filter(r => r.days_in_stock >= 30 && r.days_in_stock < 60);
  const aged60 = rows.filter(r => r.days_in_stock >= 60 && r.days_in_stock < 90);
  const aged90 = rows.filter(r => r.days_in_stock >= 90);
  res.json({ all: rows, aged30, aged60, aged90, totalValue: rows.reduce((s, r) => s + (r.stock_value || 0), 0) });
});

// ── BRANCH COMPARISON ─────────────────────────────────────

router.get('/branch-comparison', authMiddleware, adminOnly, async (req, res) => {
  const { from, to } = req.query;
  const f = from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const t = to || new Date().toISOString().split('T')[0];
  const branches = await db.prepare('SELECT * FROM branches WHERE is_active=1').all() || [];
  const result = await Promise.all(branches.map(async b => {
    const [orders, jobs, leads] = await Promise.all([
      db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(total),0) as rev FROM orders WHERE branch_id=? AND payment_status='paid' AND DATE(created_at) BETWEEN ? AND ?").get(b.id, f, t),
      db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(total_charge),0) as rev, COUNT(CASE WHEN status='completed' THEN 1 END) as completed FROM service_bookings WHERE branch_id=? AND DATE(created_at) BETWEEN ? AND ?").get(b.id, f, t),
      db.prepare("SELECT COUNT(*) as c FROM leads WHERE DATE(created_at) BETWEEN ? AND ?").get(f, t),
    ]);
    return {
      branch: b,
      orders: { count: orders?.c || 0, revenue: orders?.rev || 0 },
      jobs: { count: jobs?.c || 0, revenue: jobs?.rev || 0, completed: jobs?.completed || 0 },
      totalRevenue: (orders?.rev || 0) + (jobs?.rev || 0),
    };
  }));
  res.json({ period: { from: f, to: t }, branches: result });
});

// ── GSTR-1 EXPORT ─────────────────────────────────────────

router.get('/gstr1-export', authMiddleware, adminOnly, async (req, res) => {
  const { from, to, branch_id } = req.query;
  const f = from || new Date().toISOString().slice(0, 7) + '-01';
  const t = to || new Date().toISOString().split('T')[0];

  const bFilter = branch_id ? ' AND branch_id=?' : '';
  const bParam = branch_id ? [branch_id] : [];
  const services = await db.prepare(`SELECT booking_number as invoice_no, customer_name, customer_phone, total_charge as taxable_value, gst_enabled, created_at FROM service_bookings WHERE payment_status='paid' AND gst_enabled=1 AND DATE(created_at) BETWEEN ? AND ?${bCond}`).all(f, t) || [];
  const customs = await db.prepare(`SELECT invoice_number as invoice_no, customer_name, customer_phone, (subtotal-discount) as taxable_value, gst_enabled, created_at FROM custom_invoices WHERE payment_status='paid' AND gst_enabled=1 AND DATE(created_at) BETWEEN ? AND ?${bCond}`).all(f, t) || [];

  const allInvoices = [...services, ...customs].map(inv => ({
    invoice_no: inv.invoice_no,
    invoice_date: new Date(inv.created_at).toLocaleDateString('en-IN'),
    customer_name: inv.customer_name,
    customer_phone: inv.customer_phone,
    taxable_value: Math.round(inv.taxable_value || 0),
    cgst_rate: 9, cgst_amount: Math.round((inv.taxable_value || 0) * 0.09),
    sgst_rate: 9, sgst_amount: Math.round((inv.taxable_value || 0) * 0.09),
    total_tax: Math.round((inv.taxable_value || 0) * 0.18),
    invoice_value: Math.round((inv.taxable_value || 0) * 1.18),
  }));

  const totalTaxable = allInvoices.reduce((s, i) => s + i.taxable_value, 0);
  const totalTax = allInvoices.reduce((s, i) => s + i.total_tax, 0);

  // CSV format
  const headers = ['Invoice No', 'Invoice Date', 'Customer Name', 'Phone', 'Taxable Value', 'CGST Rate', 'CGST Amount', 'SGST Rate', 'SGST Amount', 'Total Tax', 'Invoice Value'];
  const rows = allInvoices.map(i => [i.invoice_no, i.invoice_date, i.customer_name, i.customer_phone, i.taxable_value, i.cgst_rate + '%', i.cgst_amount, i.sgst_rate + '%', i.sgst_amount, i.total_tax, i.invoice_value]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=GSTR1_${f}_${t}.csv`);
  res.send(csv);
});

// ── E-INVOICE (IRN) ───────────────────────────────────────
// NIC IRP API integration — sandbox mode by default
// Set EINVOICE_USERNAME, EINVOICE_PASSWORD, EINVOICE_GSTIN in .env for live

const EINVOICE_BASE = process.env.EINVOICE_BASE || 'https://einv-apisandbox.nic.in';
const EINVOICE_GSTIN = process.env.EINVOICE_GSTIN || '23AABCU9603R1ZX'; // test GSTIN
const EINVOICE_USER = process.env.EINVOICE_USERNAME || '';
const EINVOICE_PASS = process.env.EINVOICE_PASSWORD || '';

// Build invoice payload per NIC schema
function buildIRNPayload(inv, gstin) {
  const items = (() => { try { return typeof inv.items === 'string' ? JSON.parse(inv.items) : (inv.items || []); } catch { return []; } })();
  const taxable = inv.subtotal || inv.total_charge || 0;
  const discount = inv.discount || 0;
  const net = taxable - discount;
  const cgst = parseFloat((net * 0.09).toFixed(2));
  const sgst = parseFloat((net * 0.09).toFixed(2));
  const total = parseFloat((net + cgst + sgst).toFixed(2));

  return {
    Version: '1.1',
    TranDtls: { TaxSch: 'GST', SupTyp: 'B2B', RegRev: 'N' },
    DocDtls: {
      Typ: 'INV',
      No: inv.invoice_number || inv.booking_number || inv.id.slice(0, 16),
      Dt: new Date(inv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/'),
    },
    SellerDtls: {
      Gstin: gstin, LglNm: 'AI Laptop Wala',
      Addr1: 'Silver Mall, Vijay Nagar', Loc: 'Indore', Pin: 452010, Stcd: '23',
    },
    BuyerDtls: {
      Gstin: inv.buyer_gstin || 'URP',
      LglNm: inv.customer_name || 'Consumer',
      Pos: '23', Addr1: inv.customer_address || 'Indore', Loc: 'Indore', Pin: 452001, Stcd: '23',
    },
    ItemList: items.length ? items.map((item, i) => ({
      SlNo: String(i + 1), PrdDesc: item.name || 'Service', IsServc: 'Y',
      Qty: item.qty || 1, Unit: 'NOS', UnitPrice: item.price || 0,
      TotAmt: (item.qty || 1) * (item.price || 0),
      Discount: 0, AssAmt: (item.qty || 1) * (item.price || 0),
      GstRt: 18, IgstAmt: 0, CgstAmt: parseFloat(((item.qty || 1) * (item.price || 0) * 0.09).toFixed(2)),
      SgstAmt: parseFloat(((item.qty || 1) * (item.price || 0) * 0.09).toFixed(2)),
      TotItemVal: parseFloat(((item.qty || 1) * (item.price || 0) * 1.18).toFixed(2)),
    })) : [{
      SlNo: '1', PrdDesc: 'Repair Service', IsServc: 'Y',
      Qty: 1, Unit: 'NOS', UnitPrice: net, TotAmt: net,
      Discount: 0, AssAmt: net, GstRt: 18,
      IgstAmt: 0, CgstAmt: cgst, SgstAmt: sgst, TotItemVal: total,
    }],
    ValDtls: {
      AssVal: net, CgstVal: cgst, SgstVal: sgst, IgstVal: 0,
      TotInvVal: total, Discount: discount,
    },
  };
}

// Generate IRN for a custom invoice
router.post('/einvoice/generate', authMiddleware, adminOnly, async (req, res) => {
  const { invoice_id, invoice_type = 'custom', buyer_gstin, customer_address } = req.body;
  if (!invoice_id) return res.status(400).json({ error: 'invoice_id required' });

  const table = invoice_type === 'service' ? 'service_bookings' : 'custom_invoices';
  const inv = await db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(invoice_id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  if (inv.irn) return res.status(400).json({ error: 'IRN already generated', irn: inv.irn });

  const payload = buildIRNPayload({ ...inv, buyer_gstin, customer_address }, EINVOICE_GSTIN);

  // If credentials set → call real NIC API, else mock
  let irnData;
  if (EINVOICE_USER && EINVOICE_PASS) {
    try {
      // Step 1: Authenticate
      const authRes = await fetch(`${EINVOICE_BASE}/eivital/v1.03/Auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Gstin': EINVOICE_GSTIN, 'user_name': EINVOICE_USER, 'password': EINVOICE_PASS, 'AppKey': process.env.EINVOICE_APPKEY || '', 'AuthToken': '' },
        body: JSON.stringify({ UserName: EINVOICE_USER, Password: EINVOICE_PASS, AppKey: process.env.EINVOICE_APPKEY || '', ForceRefreshAccessToken: false }),
      });
      const authData = await authRes.json();
      const token = authData?.Data?.AuthToken;
      if (!token) return res.status(502).json({ error: 'NIC auth failed', detail: authData });

      // Step 2: Generate IRN
      const irnRes = await fetch(`${EINVOICE_BASE}/eicore/v1.03/Invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Gstin': EINVOICE_GSTIN, 'user_name': EINVOICE_USER, 'AuthToken': token },
        body: JSON.stringify(payload),
      });
      irnData = await irnRes.json();
      if (!irnData?.Data?.Irn) return res.status(502).json({ error: 'IRN generation failed', detail: irnData });
      irnData = irnData.Data;
    } catch (e) {
      return res.status(502).json({ error: 'NIC API error', detail: e.message });
    }
  } else {
    // Sandbox mock — generate fake IRN for testing
    const hash = Buffer.from(`${EINVOICE_GSTIN}${payload.DocDtls.No}${payload.DocDtls.Dt}`).toString('hex').slice(0, 64);
    irnData = {
      Irn: hash,
      AckNo: Math.floor(Math.random() * 9000000000) + 1000000000,
      AckDt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      SignedQRCode: `MOCK_QR_${hash.slice(0, 20)}`,
      Status: 'ACT',
      _mock: true,
    };
  }

  // Save to DB
  await db.prepare(`UPDATE ${table} SET irn=?,ack_no=?,ack_date=?,irn_status=?,qr_code=? WHERE id=?`)
    .run(irnData.Irn, String(irnData.AckNo), irnData.AckDt, 'generated', irnData.SignedQRCode || '', invoice_id);

  res.json({ success: true, irn: irnData.Irn, ack_no: irnData.AckNo, ack_date: irnData.AckDt, qr_code: irnData.SignedQRCode, mock: !!irnData._mock });
});

// Cancel IRN
router.post('/einvoice/cancel', authMiddleware, adminOnly, async (req, res) => {
  const { invoice_id, invoice_type = 'custom', reason = '1' } = req.body;
  const table = invoice_type === 'service' ? 'service_bookings' : 'custom_invoices';
  const inv = await db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(invoice_id);
  if (!inv?.irn) return res.status(400).json({ error: 'No IRN found for this invoice' });

  await db.prepare(`UPDATE ${table} SET irn_status='cancelled' WHERE id=?`).run(invoice_id);
  res.json({ success: true, message: 'IRN marked cancelled' });
});

// Get IRN status
router.get('/einvoice/:invoice_id', authMiddleware, adminOnly, async (req, res) => {
  const { type = 'custom' } = req.query;
  const table = type === 'service' ? 'service_bookings' : 'custom_invoices';
  const inv = await db.prepare(`SELECT id,irn,ack_no,ack_date,irn_status,qr_code FROM ${table} WHERE id=?`).get(req.params.invoice_id);
  if (!inv) return res.status(404).json({ error: 'Not found' });
  res.json(inv);
});

// ── PAYROLL ───────────────────────────────────────────────

// List payroll — filter by month
router.get('/payroll', authMiddleware, adminOnly, async (req, res) => {
  const { month, branch_id } = req.query;
  let q = `SELECT p.*, s.name as staff_name, s.role, s.salary as base_salary, s.branch_id as staff_branch FROM payroll p LEFT JOIN staff s ON s.id=p.staff_id WHERE 1=1`;
  const params = [];
  if (month) { q += ' AND p.month=?'; params.push(month); }
  if (branch_id) { q += ' AND s.branch_id=?'; params.push(branch_id); }
  q += ' ORDER BY p.month DESC, s.name';
  res.json(await db.prepare(q).all(...params) || []);
});

// Auto-generate payroll for all active staff for a month
router.post('/payroll/generate', authMiddleware, adminOnly, async (req, res) => {
  const { month, branch_id } = req.body;
  if (!month) return res.status(400).json({ error: 'month required (YYYY-MM)' });
  const staffQ = branch_id ? "SELECT * FROM staff WHERE is_active=1 AND branch_id=?" : "SELECT * FROM staff WHERE is_active=1";
  const staff = branch_id ? await db.prepare(staffQ).all(branch_id) || [] : await db.prepare(staffQ).all() || [];
  const created = [];
  for (const s of staff) {
    const exists = await db.prepare('SELECT id FROM payroll WHERE staff_id=? AND month=?').get(s.id, month);
    if (exists) continue;
    // Get present days from attendance
    const att = await db.prepare(`SELECT COUNT(*) as c FROM attendance WHERE staff_id=? AND DATE(date) BETWEEN ? AND ? AND status='present'`).get(s.id, `${month}-01`, `${month}-31`);
    const present = att?.c || 26;
    const basic = s.salary || 0;
    const perDay = basic / 26;
    const earnedBasic = parseFloat((perDay * present).toFixed(2));
    const hra = parseFloat((earnedBasic * 0.4).toFixed(2));
    const gross = parseFloat((earnedBasic + hra).toFixed(2));
    // PF: 12% employee + 12% employer on basic (if basic > 15000, cap at 1800)
    const pfBase = Math.min(earnedBasic, 15000);
    const pf_employee = parseFloat((pfBase * 0.12).toFixed(2));
    const pf_employer = parseFloat((pfBase * 0.12).toFixed(2));
    // ESI: 0.75% employee + 3.25% employer (if gross <= 21000)
    const esi_employee = gross <= 21000 ? parseFloat((gross * 0.0075).toFixed(2)) : 0;
    const esi_employer = gross <= 21000 ? parseFloat((gross * 0.0325).toFixed(2)) : 0;
    // Advance deduction
    const adv = await db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM staff_advances WHERE staff_id=? AND month=? AND deducted=0").get(s.id, month);
    const advance_deduction = adv?.total || 0;
    const net = parseFloat((gross - pf_employee - esi_employee - advance_deduction).toFixed(2));
    const id = uuid();
    await db.prepare(`INSERT INTO payroll (id,staff_id,month,basic,hra,gross,pf_employee,pf_employer,esi_employee,esi_employer,advance_deduction,net,working_days,present_days) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, s.id, month, earnedBasic, hra, gross, pf_employee, pf_employer, esi_employee, esi_employer, advance_deduction, net, 26, present);
    created.push({ id, staff: s.name, net });
  }
  res.json({ generated: created.length, records: created });
});

// Update single payroll record
router.put('/payroll/:id', authMiddleware, adminOnly, async (req, res) => {
  const { basic, hra, allowances, pf_employee, esi_employee, tds, advance_deduction, other_deduction, present_days, notes, status, paid_on } = req.body;
  const gross = (basic || 0) + (hra || 0) + (allowances || 0);
  const net = gross - (pf_employee || 0) - (esi_employee || 0) - (tds || 0) - (advance_deduction || 0) - (other_deduction || 0);
  await db.prepare(`UPDATE payroll SET basic=?,hra=?,allowances=?,pf_employee=?,esi_employee=?,tds=?,advance_deduction=?,other_deduction=?,gross=?,net=?,present_days=?,notes=?,status=?,paid_on=? WHERE id=?`)
    .run(basic, hra, allowances || 0, pf_employee, esi_employee, tds || 0, advance_deduction, other_deduction || 0, gross, net, present_days, notes, status || 'draft', paid_on || null, req.params.id);
  res.json({ message: 'Updated' });
});

// Mark as paid
router.patch('/payroll/:id/pay', authMiddleware, adminOnly, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  await db.prepare("UPDATE payroll SET status='paid', paid_on=? WHERE id=?").run(today, req.params.id);
  res.json({ message: 'Marked as paid' });
});

// Salary slip data
router.get('/payroll/:id/slip', authMiddleware, adminOnly, async (req, res) => {
  const row = await db.prepare(`SELECT p.*, s.name as staff_name, s.role, s.phone FROM payroll p LEFT JOIN staff s ON s.id=p.staff_id WHERE p.id=?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// Staff advances
router.get('/staff-advances', authMiddleware, adminOnly, async (req, res) => {
  const { staff_id } = req.query;
  const rows = staff_id
    ? await db.prepare('SELECT * FROM staff_advances WHERE staff_id=? ORDER BY created_at DESC').all(staff_id)
    : await db.prepare('SELECT a.*, s.name as staff_name FROM staff_advances a LEFT JOIN staff s ON s.id=a.staff_id ORDER BY a.created_at DESC').all();
  res.json(rows || []);
});

router.post('/staff-advances', authMiddleware, adminOnly, async (req, res) => {
  const { staff_id, amount, month, reason } = req.body;
  if (!staff_id || !amount) return res.status(400).json({ error: 'staff_id and amount required' });
  const id = uuid();
  await db.prepare('INSERT INTO staff_advances (id,staff_id,amount,month,reason) VALUES (?,?,?,?,?)').run(id, staff_id, amount, month || new Date().toISOString().slice(0, 7), reason || '');
  res.status(201).json({ id });
});

// ── CUSTOM REPORT BUILDER ─────────────────────────────────

const REPORT_SOURCES = {
  orders: { table: 'orders', label: 'Orders', fields: ['id','invoice_number','customer_name','customer_phone','total','payment_status','payment_method','created_at'] },
  service_bookings: { table: 'service_bookings', label: 'Job Cards', fields: ['booking_number','customer_name','customer_phone','service_name','device_brand','device_model','technician','status','total_charge','payment_status','created_at'] },
  custom_invoices: { table: 'custom_invoices', label: 'Custom Invoices', fields: ['invoice_number','customer_name','customer_phone','subtotal','discount','total','payment_status','payment_method','created_at'] },
  leads: { table: 'leads', label: 'CRM Leads', fields: ['name','phone','email','source','status','budget','assigned_to','created_at'] },
  products: { table: 'products', label: 'Products', fields: ['name','category','price','stock','status','created_at'] },
  staff: { table: 'staff', label: 'Staff', fields: ['name','role','phone','email','salary','is_active','created_at'] },
  expenses: { table: 'expenses', label: 'Expenses', fields: ['title','category','amount','date','staff_name','notes'] },
  payroll: { table: 'payroll', label: 'Payroll', fields: ['month','basic','hra','gross','pf_employee','esi_employee','net','status','paid_on'] },
};

router.post('/report-builder/run', authMiddleware, adminOnly, async (req, res) => {
  const { source, fields, filters = [], sort_by, sort_dir = 'DESC', limit = 500 } = req.body;
  const src = REPORT_SOURCES[source];
  if (!src) return res.status(400).json({ error: 'Invalid source' });

  // Only allow whitelisted fields
  const allowed = src.fields;
  const cols = (fields?.length ? fields.filter(f => allowed.includes(f)) : allowed);
  if (!cols.length) return res.status(400).json({ error: 'No valid fields' });

  // Build WHERE
  const conditions = [];
  const params = [];
  for (const f of filters) {
    if (!allowed.includes(f.field)) continue;
    if (f.op === 'eq')   { conditions.push(`${f.field} = ?`); params.push(f.value); }
    if (f.op === 'like') { conditions.push(`${f.field} ILIKE ?`); params.push(`%${f.value}%`); }
    if (f.op === 'gte')  { conditions.push(`${f.field} >= ?`); params.push(f.value); }
    if (f.op === 'lte')  { conditions.push(`${f.field} <= ?`); params.push(f.value); }
    if (f.op === 'date_from') { conditions.push(`DATE(${f.field}) >= ?`); params.push(f.value); }
    if (f.op === 'date_to')   { conditions.push(`DATE(${f.field}) <= ?`); params.push(f.value); }
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = sort_by && allowed.includes(sort_by) ? `ORDER BY ${sort_by} ${sort_dir === 'ASC' ? 'ASC' : 'DESC'}` : 'ORDER BY created_at DESC';
  const sql = `SELECT ${cols.join(',')} FROM ${src.table} ${where} ${orderBy} LIMIT ?`;

  try {
    const rows = await db.prepare(sql).all(...params, Math.min(limit, 1000)) || [];
    res.json({ rows, cols, total: rows.length, source: src.label });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Export CSV
router.post('/report-builder/export', authMiddleware, adminOnly, async (req, res) => {
  const { source, fields, filters = [], sort_by, sort_dir = 'DESC' } = req.body;
  const src = REPORT_SOURCES[source];
  if (!src) return res.status(400).json({ error: 'Invalid source' });
  const allowed = src.fields;
  const cols = (fields?.length ? fields.filter(f => allowed.includes(f)) : allowed);

  const conditions = [];
  const params = [];
  for (const f of filters) {
    if (!allowed.includes(f.field)) continue;
    if (f.op === 'eq')   { conditions.push(`${f.field} = ?`); params.push(f.value); }
    if (f.op === 'like') { conditions.push(`${f.field} ILIKE ?`); params.push(`%${f.value}%`); }
    if (f.op === 'gte')  { conditions.push(`${f.field} >= ?`); params.push(f.value); }
    if (f.op === 'lte')  { conditions.push(`${f.field} <= ?`); params.push(f.value); }
    if (f.op === 'date_from') { conditions.push(`DATE(${f.field}) >= ?`); params.push(f.value); }
    if (f.op === 'date_to')   { conditions.push(`DATE(${f.field}) <= ?`); params.push(f.value); }
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = sort_by && allowed.includes(sort_by) ? `ORDER BY ${sort_by} ${sort_dir === 'ASC' ? 'ASC' : 'DESC'}` : '';
  const rows = await db.prepare(`SELECT ${cols.join(',')} FROM ${src.table} ${where} ${orderBy} LIMIT 10000`).all(...params) || [];

  const csv = [cols, ...rows.map(r => cols.map(c => `"${(r[c] ?? '').toString().replace(/"/g, '""')}"`))]
    .map(r => r.join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=report_${source}_${Date.now()}.csv`);
  res.send(csv);
});

// Get available sources + fields
router.get('/report-builder/sources', authMiddleware, adminOnly, (req, res) => {
  res.json(Object.entries(REPORT_SOURCES).map(([key, v]) => ({ key, label: v.label, fields: v.fields })));
});

// ── BRANCH-WISE INVENTORY ─────────────────────────────────

// Get stock for all products in a branch
router.get('/branch-stock', authMiddleware, adminOnly, async (req, res) => {
  const { branch_id } = req.query;
  const rows = branch_id
    ? await db.prepare(`SELECT bs.*, p.name as product_name, p.category, p.price, p.sku FROM branch_stock bs LEFT JOIN products p ON p.id=bs.product_id WHERE bs.branch_id=? ORDER BY p.name`).all(branch_id)
    : await db.prepare(`SELECT bs.*, p.name as product_name, p.category, p.price, p.sku, b.name as branch_name FROM branch_stock bs LEFT JOIN products p ON p.id=bs.product_id LEFT JOIN branches b ON b.id=bs.branch_id ORDER BY b.name, p.name`).all();
  res.json(rows || []);
});

// Update stock for a product in a branch
router.post('/branch-stock/adjust', authMiddleware, adminOnly, async (req, res) => {
  const { branch_id, product_id, qty, type = 'manual', note = '' } = req.body;
  if (!branch_id || !product_id || qty === undefined) return res.status(400).json({ error: 'branch_id, product_id, qty required' });

  // Upsert branch_stock
  const existing = await db.prepare('SELECT * FROM branch_stock WHERE branch_id=? AND product_id=?').get(branch_id, product_id);
  if (existing) {
    const newStock = Math.max(0, (existing.stock || 0) + qty);
    await db.prepare('UPDATE branch_stock SET stock=? WHERE branch_id=? AND product_id=?').run(newStock, branch_id, product_id);
  } else {
    await db.prepare('INSERT INTO branch_stock (id,branch_id,product_id,stock) VALUES (?,?,?,?)').run(uuid(), branch_id, product_id, Math.max(0, qty));
  }
  // Sync global stock = sum of all branch stocks
  const totalStock = await db.prepare('SELECT COALESCE(SUM(stock),0) as t FROM branch_stock WHERE product_id=?').get(product_id);
  await db.prepare('UPDATE products SET stock=? WHERE id=?').run(totalStock?.t || 0, product_id);
  // Sync global stock = sum of all branch stocks
  // Log movement
  await db.prepare('INSERT INTO branch_stock_movements (id,branch_id,product_id,type,qty,note) VALUES (?,?,?,?,?,?)').run(uuid(), branch_id, product_id, type, qty, note);
  res.json({ message: 'Stock updated' });
});

// Transfer stock between branches
router.post('/branch-stock/transfer', authMiddleware, adminOnly, async (req, res) => {
  const { from_branch, to_branch, product_id, qty, note = '' } = req.body;
  if (!from_branch || !to_branch || !product_id || !qty) return res.status(400).json({ error: 'All fields required' });

  const src = await db.prepare('SELECT * FROM branch_stock WHERE branch_id=? AND product_id=?').get(from_branch, product_id);
  if (!src || src.stock < qty) return res.status(400).json({ error: `Insufficient stock. Available: ${src?.stock || 0}` });

  await db.prepare('UPDATE branch_stock SET stock=stock-? WHERE branch_id=? AND product_id=?').run(qty, from_branch, product_id);
  const dest = await db.prepare('SELECT * FROM branch_stock WHERE branch_id=? AND product_id=?').get(to_branch, product_id);
  if (dest) {
    await db.prepare('UPDATE branch_stock SET stock=stock+? WHERE branch_id=? AND product_id=?').run(qty, to_branch, product_id);
  } else {
    await db.prepare('INSERT INTO branch_stock (id,branch_id,product_id,stock) VALUES (?,?,?,?)').run(uuid(), to_branch, product_id, qty);
  }
  // Log both movements
  await db.prepare('INSERT INTO branch_stock_movements (id,branch_id,product_id,type,qty,note) VALUES (?,?,?,?,?,?)').run(uuid(), from_branch, product_id, 'transfer_out', -qty, note);
  await db.prepare('INSERT INTO branch_stock_movements (id,branch_id,product_id,type,qty,note) VALUES (?,?,?,?,?,?)').run(uuid(), to_branch, product_id, 'transfer_in', qty, note);
  res.json({ message: `Transferred ${qty} units` });
});

// Stock movements log
router.get('/branch-stock/movements', authMiddleware, adminOnly, async (req, res) => {
  const { branch_id, product_id } = req.query;
  let sql = `SELECT m.*, p.name as product_name, b.name as branch_name FROM branch_stock_movements m LEFT JOIN products p ON p.id=m.product_id LEFT JOIN branches b ON b.id=m.branch_id WHERE 1=1`;
  const params = [];
  if (branch_id) { sql += ' AND m.branch_id=?'; params.push(branch_id); }
  if (product_id) { sql += ' AND m.product_id=?'; params.push(product_id); }
  sql += ' ORDER BY m.created_at DESC LIMIT 200';
  res.json(await db.prepare(sql).all(...params) || []);
});

// Branch stock summary (for dashboard)
router.get('/branch-stock/summary', authMiddleware, adminOnly, async (req, res) => {
  const branches = await db.prepare('SELECT * FROM branches WHERE is_active=1').all() || [];
  const result = await Promise.all(branches.map(async b => {
    const stats = await db.prepare(`SELECT COUNT(*) as products, COALESCE(SUM(bs.stock),0) as total_stock, COALESCE(SUM(bs.stock * p.price),0) as stock_value, COUNT(CASE WHEN bs.stock <= bs.reorder_level THEN 1 END) as low_stock FROM branch_stock bs LEFT JOIN products p ON p.id=bs.product_id WHERE bs.branch_id=?`).get(b.id);
    return { branch: b, ...stats };
  }));
  res.json(result);
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

// ── CUSTOMER WHATSAPP APPROVAL ────────────────────────────

// Send diagnosis + quote to customer for approval
router.post('/job-cards/:id/send-approval', authMiddleware, adminOnly, async (req, res) => {
  const job = await db.prepare('SELECT * FROM service_bookings WHERE id=?').get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (!job.customer_phone) return res.status(400).json({ error: 'No customer phone' });

  const parts = typeof job.parts_used === 'string' ? JSON.parse(job.parts_used || '[]') : (job.parts_used || []);
  const partsText = parts.length ? parts.map(p => `  • ${p.name} x${p.qty} = ₹${p.price * p.qty}`).join('\n') : '  • No parts';
  const msg = `*AI Laptop Wala — Repair Quote*\n\n` +
    `Job: ${job.booking_number}\n` +
    `Device: ${job.device_brand || ''} ${job.device_model || ''}\n` +
    `Issue: ${job.issue_description || ''}\n\n` +
    `*Diagnosis:* ${job.diagnosis || 'Pending'}\n\n` +
    `*Parts:*\n${partsText}\n\n` +
    `Labour: ₹${job.labour_charge || 0}\n` +
    `*Total: ₹${job.total_charge || 0}*\n\n` +
    `Reply *YES* to approve or *NO* to cancel.`;

  try {
    const { queueNotification } = await import('../whatsapp/notifications.js');
    await queueNotification(job.customer_phone, msg, 'approval_request');
    await db.prepare("UPDATE service_bookings SET approval_status='pending' WHERE id=?").run(req.params.id);
    res.json({ message: 'Approval request sent' });
  } catch (e) {
    res.status(500).json({ error: 'WhatsApp send failed: ' + e.message });
  }
});

// Update approval status (called when customer replies YES/NO)
router.patch('/job-cards/:id/approval', authMiddleware, adminOnly, async (req, res) => {
  const { approval_status } = req.body; // 'approved' | 'rejected'
  await db.prepare("UPDATE service_bookings SET approval_status=? WHERE id=?").run(approval_status, req.params.id);
  res.json({ message: 'Approval updated' });
});

// ── KPI ALERTS ────────────────────────────────────────────

router.get('/kpi-alerts/config', authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.prepare('SELECT * FROM kpi_alerts ORDER BY created_at DESC').all() || [];
  res.json(rows);
});

router.post('/kpi-alerts/config', authMiddleware, adminOnly, async (req, res) => {
  const { metric, operator, threshold, message, is_active } = req.body;
  if (!metric || !threshold) return res.status(400).json({ error: 'metric and threshold required' });
  const id = uuid();
  await db.prepare('INSERT INTO kpi_alerts (id,metric,operator,threshold,message,is_active) VALUES (?,?,?,?,?,?)').run(id, metric, operator || 'lt', threshold, message || '', is_active ? 1 : 1);
  res.status(201).json({ id });
});

router.delete('/kpi-alerts/config/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM kpi_alerts WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// Check and fire KPI alerts — call this on a schedule or on dashboard load
router.post('/kpi-alerts/check', authMiddleware, adminOnly, async (req, res) => {
  const alerts = await db.prepare("SELECT * FROM kpi_alerts WHERE is_active=1").all() || [];
  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.slice(0, 7) + '-01';
  const OWNER_PHONE = process.env.OWNER_PHONE || '';
  const fired = [];

  for (const alert of alerts) {
    let value = 0;
    try {
      if (alert.metric === 'daily_revenue') {
        const r = await db.prepare("SELECT COALESCE(SUM(total_charge),0) as v FROM service_bookings WHERE payment_status='paid' AND DATE(created_at)=?").get(today);
        value = r?.v || 0;
      } else if (alert.metric === 'pending_jobs') {
        const r = await db.prepare("SELECT COUNT(*) as c FROM service_bookings WHERE status IN ('pending','in_progress')").get();
        value = r?.c || 0;
      } else if (alert.metric === 'monthly_revenue') {
        const r = await db.prepare("SELECT COALESCE(SUM(total_charge),0) as v FROM service_bookings WHERE payment_status='paid' AND DATE(created_at)>=?").get(monthStart);
        value = r?.v || 0;
      } else if (alert.metric === 'sla_breached') {
        const r = await db.prepare("SELECT COUNT(*) as c FROM service_bookings WHERE sla_breached=1 AND status NOT IN ('completed','cancelled')").get();
        value = r?.c || 0;
      }

      const triggered = alert.operator === 'lt' ? value < alert.threshold
        : alert.operator === 'gt' ? value > alert.threshold
        : value === alert.threshold;

      if (triggered && OWNER_PHONE) {
        const msg = alert.message || `⚠️ KPI Alert: ${alert.metric} = ${value} (threshold: ${alert.threshold})`;
        const { queueNotification } = await import('../whatsapp/notifications.js');
        await queueNotification(OWNER_PHONE, msg, 'kpi_alert');
        fired.push({ metric: alert.metric, value, threshold: alert.threshold });
      }
    } catch (e) { console.error("Operation error:", e.message); }
  }
  res.json({ checked: alerts.length, fired: fired.length, alerts: fired });
});

// ── LOYALTY PROGRAM ───────────────────────────────────────

router.get('/loyalty/:phone', authMiddleware, adminOnly, async (req, res) => {
  const row = await db.prepare('SELECT * FROM loyalty_points WHERE phone=?').get(req.params.phone);
  if (!row) return res.json({ phone: req.params.phone, points: 0, tier: 'Bronze', transactions: [] });
  const txns = await db.prepare('SELECT * FROM loyalty_transactions WHERE phone=? ORDER BY created_at DESC LIMIT 20').all(req.params.phone) || [];
  const tier = row.points >= 5000 ? 'Platinum' : row.points >= 2000 ? 'Gold' : row.points >= 500 ? 'Silver' : 'Bronze';
  res.json({ ...row, tier, transactions: txns });
});

router.post('/loyalty/earn', authMiddleware, adminOnly, async (req, res) => {
  const { phone, customer_name, amount, ref_id, ref_type } = req.body;
  if (!phone || !amount) return res.status(400).json({ error: 'phone and amount required' });
  const points = Math.floor(amount / 100); // 1 point per ₹100
  const existing = await db.prepare('SELECT * FROM loyalty_points WHERE phone=?').get(phone);
  if (existing) {
    await db.prepare('UPDATE loyalty_points SET points=points+?, total_earned=total_earned+?, customer_name=COALESCE(?,customer_name) WHERE phone=?').run(points, points, customer_name, phone);
  } else {
    await db.prepare('INSERT INTO loyalty_points (id,phone,customer_name,points,total_earned) VALUES (?,?,?,?,?)').run(uuid(), phone, customer_name || '', points, points);
  }
  await db.prepare('INSERT INTO loyalty_transactions (id,phone,type,points,ref_id,ref_type,note) VALUES (?,?,?,?,?,?,?)').run(uuid(), phone, 'earn', points, ref_id || null, ref_type || 'manual', `Earned ${points} pts on ₹${amount}`);
  res.json({ points_earned: points, message: `${points} points added` });
});

router.post('/loyalty/redeem', authMiddleware, adminOnly, async (req, res) => {
  const { phone, points, ref_id } = req.body;
  if (!phone || !points) return res.status(400).json({ error: 'phone and points required' });
  const existing = await db.prepare('SELECT * FROM loyalty_points WHERE phone=?').get(phone);
  if (!existing || existing.points < points) return res.status(400).json({ error: `Insufficient points. Available: ${existing?.points || 0}` });
  const discount = Math.floor(points / 10); // 10 points = ₹1 discount
  await db.prepare('UPDATE loyalty_points SET points=points-?, total_redeemed=total_redeemed+? WHERE phone=?').run(points, points, phone);
  await db.prepare('INSERT INTO loyalty_transactions (id,phone,type,points,ref_id,note) VALUES (?,?,?,?,?,?)').run(uuid(), phone, 'redeem', -points, ref_id || null, `Redeemed ${points} pts = ₹${discount} discount`);
  res.json({ points_redeemed: points, discount_amount: discount });
});

router.get('/loyalty', authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.prepare("SELECT *, CASE WHEN points>=5000 THEN 'Platinum' WHEN points>=2000 THEN 'Gold' WHEN points>=500 THEN 'Silver' ELSE 'Bronze' END as tier FROM loyalty_points ORDER BY points DESC LIMIT 100").all() || [];
  res.json(rows);
});

// ── RAZORPAY PAYMENT LINK ─────────────────────────────────

router.post('/payment-link', authMiddleware, adminOnly, async (req, res) => {
  const { invoice_id, invoice_type = 'custom', amount, customer_name, customer_phone, customer_email, description } = req.body;
  if (!amount || !customer_phone) return res.status(400).json({ error: 'amount and customer_phone required' });

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    // Mock link for testing
    const mockLink = `https://rzp.io/l/mock-${Date.now()}`;
    if (invoice_id) {
      const table = invoice_type === 'service' ? 'service_bookings' : 'custom_invoices';
      await db.prepare(`UPDATE ${table} SET payment_link=? WHERE id=?`).run(mockLink, invoice_id);
    }
    return res.json({ payment_link: mockLink, mock: true, message: 'Set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET in .env for live links' });
  }

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const payload = {
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      description: description || 'AI Laptop Wala Invoice',
      customer: { name: customer_name || '', contact: customer_phone, email: customer_email || '' },
      notify: { sms: true, email: !!customer_email },
      reminder_enable: true,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/payment-success`,
      callback_method: 'get',
    };
    const resp = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!data.short_url) return res.status(502).json({ error: data.error?.description || 'Razorpay error', detail: data });

    if (invoice_id) {
      const table = invoice_type === 'service' ? 'service_bookings' : 'custom_invoices';
      await db.prepare(`UPDATE ${table} SET payment_link=? WHERE id=?`).run(data.short_url, invoice_id);
    }
    res.json({ payment_link: data.short_url, payment_link_id: data.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── SCHEDULED REPORTS ─────────────────────────────────────

router.post('/scheduled-reports/send', authMiddleware, adminOnly, async (req, res) => {
  const { period = 'daily', branch_id } = req.body;
  const OWNER_PHONE = process.env.OWNER_PHONE || '';
  if (!OWNER_PHONE) return res.status(400).json({ error: 'OWNER_PHONE not set in .env' });

  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.slice(0, 7) + '-01';
  const bFilter = branch_id ? ' AND branch_id=?' : '';
  const bParam = branch_id ? [branch_id] : [];

  const [revenue, jobs, expenses, leads] = await Promise.all([
    db.prepare(`SELECT COALESCE(SUM(total_charge),0) as v FROM service_bookings WHERE payment_status='paid' AND DATE(created_at)=?${bFilter}`).get(today, ...bParam),
    db.prepare(`SELECT COUNT(*) as total, COUNT(CASE WHEN status='completed' THEN 1 END) as done, COUNT(CASE WHEN status IN ('pending','in_progress') THEN 1 END) as pending FROM service_bookings WHERE DATE(created_at)=?${bFilter}`).get(today, ...bParam),
    db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM expenses WHERE date=?${bFilter}`).get(today, ...bParam),
    db.prepare(`SELECT COUNT(*) as c FROM leads WHERE DATE(created_at)=?`).get(today),
  ]);

  const msg = `📊 *AI Laptop Wala — ${period === 'daily' ? 'Daily' : 'Monthly'} Report*
` +
    `📅 ${today}

` +
    `💰 Revenue: ₹${(revenue?.v || 0).toLocaleString('en-IN')}
` +
    `🔧 Jobs: ${jobs?.total || 0} total | ${jobs?.done || 0} done | ${jobs?.pending || 0} pending
` +
    `💸 Expenses: ₹${(expenses?.v || 0).toLocaleString('en-IN')}
` +
    `🎯 New Leads: ${leads?.c || 0}
` +
    `📈 Net: ₹${((revenue?.v || 0) - (expenses?.v || 0)).toLocaleString('en-IN')}`;

  try {
    const { queueNotification } = await import('../whatsapp/notifications.js');
    await queueNotification(OWNER_PHONE, msg, 'scheduled_report');
    res.json({ message: 'Report sent', phone: OWNER_PHONE });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── SAVED REPORTS ─────────────────────────────────────────

router.get('/saved-reports', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM saved_reports ORDER BY created_at DESC').all() || []);
});

router.post('/saved-reports', authMiddleware, adminOnly, async (req, res) => {
  const { name, source, fields, filters, sort_by, sort_dir } = req.body;
  if (!name || !source) return res.status(400).json({ error: 'name and source required' });
  const id = uuid();
  await db.prepare('INSERT INTO saved_reports (id,name,source,fields,filters,sort_by,sort_dir) VALUES (?,?,?,?,?,?,?)').run(id, name, source, JSON.stringify(fields || []), JSON.stringify(filters || []), sort_by || '', sort_dir || 'DESC');
  res.status(201).json({ id });
});

router.delete('/saved-reports/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM saved_reports WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── WHATSAPP → LEAD AUTO-LINK ─────────────────────────────

router.post('/leads/from-whatsapp', authMiddleware, adminOnly, async (req, res) => {
  const { phone, name, message, branch_id } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  // Check if lead already exists
  const existing = await db.prepare('SELECT id FROM leads WHERE phone=?').get(phone);
  if (existing) {
    // Add activity to existing lead
    await db.prepare("INSERT INTO lead_activities (id,lead_id,type,note,created_by) VALUES (?,?,?,?,?)").run(uuid(), existing.id, 'whatsapp', message || 'WhatsApp message received', 'system');
    return res.json({ lead_id: existing.id, created: false, message: 'Activity added to existing lead' });
  }
  // Create new lead
  const id = uuid();
  await db.prepare('INSERT INTO leads (id,name,phone,source,status,notes,branch_id) VALUES (?,?,?,?,?,?,?)').run(id, name || phone, phone, 'WhatsApp', 'new', message || '', branch_id || null);
  await db.prepare("INSERT INTO lead_activities (id,lead_id,type,note,created_by) VALUES (?,?,?,?,?)").run(uuid(), id, 'whatsapp', message || 'Lead created from WhatsApp', 'system');
  res.status(201).json({ lead_id: id, created: true, message: 'New lead created from WhatsApp' });
});

// ── SALARY HISTORY ────────────────────────────────────────
router.get('/staff/:id/salary-history', authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.prepare('SELECT * FROM salary_history WHERE staff_id=? ORDER BY created_at DESC').all(req.params.id) || [];
  res.json(rows);
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

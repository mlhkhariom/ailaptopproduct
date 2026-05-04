import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// ── JOB CARDS (service_bookings extended) ────────────────

router.get('/job-cards', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.query;
  let q = 'SELECT * FROM service_bookings WHERE 1=1';
  const params = [];
  if (status) { q += ' AND status=?'; params.push(status); }
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

// ── STAFF ─────────────────────────────────────────────────

router.get('/staff', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM staff WHERE is_active=1 ORDER BY name ASC').all() || []);
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

router.get('/leads', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.query;
  let q = 'SELECT * FROM leads WHERE 1=1';
  const params = [];
  if (status && status !== 'all') { q += ' AND status=?'; params.push(status); }
  q += ' ORDER BY next_followup ASC NULLS LAST, created_at DESC';
  res.json(await db.prepare(q).all(...params) || []);
});

router.post('/leads', authMiddleware, adminOnly, async (req, res) => {
  const { name, phone, email, source, interest, budget, status, priority, assigned_to, notes, next_followup } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  await db.prepare('INSERT INTO leads (id,name,phone,email,source,interest,budget,status,priority,assigned_to,notes,next_followup) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, name, phone, email, source || 'walk-in', interest, budget, status || 'new', priority || 'normal', assigned_to, notes, next_followup);
  res.status(201).json({ id });
});

router.put('/leads/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, phone, email, source, interest, budget, status, priority, assigned_to, notes, next_followup } = req.body;
  await db.prepare('UPDATE leads SET name=?,phone=?,email=?,source=?,interest=?,budget=?,status=?,priority=?,assigned_to=?,notes=?,next_followup=?,updated_at=NOW() WHERE id=?')
    .run(name, phone, email, source, interest, budget, status, priority, assigned_to, notes, next_followup, req.params.id);
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
  res.status(201).json({ id });
});

export default router;

// ── CRM / LEADS ───────────────────────────────────────────

router.get('/leads', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.query;
  let q = 'SELECT * FROM leads WHERE 1=1';
  const params = [];
  if (status && status !== 'all') { q += ' AND status=?'; params.push(status); }
  q += ' ORDER BY next_followup ASC NULLS LAST, created_at DESC';
  res.json(await db.prepare(q).all(...params) || []);
});

router.post('/leads', authMiddleware, adminOnly, async (req, res) => {
  const { name, phone, email, source, interest, budget, status, priority, assigned_to, notes, next_followup } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  await db.prepare('INSERT INTO leads (id,name,phone,email,source,interest,budget,status,priority,assigned_to,notes,next_followup) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, name, phone, email, source || 'walk-in', interest, budget, status || 'new', priority || 'normal', assigned_to, notes, next_followup);
  res.status(201).json({ id });
});

router.put('/leads/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, phone, email, source, interest, budget, status, priority, assigned_to, notes, next_followup } = req.body;
  await db.prepare('UPDATE leads SET name=?,phone=?,email=?,source=?,interest=?,budget=?,status=?,priority=?,assigned_to=?,notes=?,next_followup=?,updated_at=NOW() WHERE id=?')
    .run(name, phone, email, source, interest, budget, status, priority, assigned_to, notes, next_followup, req.params.id);
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
  res.status(201).json({ id });
});

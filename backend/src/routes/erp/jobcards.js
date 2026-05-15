import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminOnly, superAdminOnly } from '../../middleware/adminOnly.js';

const router = Router();

async function auditLog(req, module, action, ref_id, old_value, new_value) {
  try {
    await db.prepare('INSERT INTO audit_log (id, module, action, ref_id, old_value, new_value, user_id, user_name, ip, created_at) VALUES (?,?,?,?,?,?,?,?,?,NOW())')
      .run(uuid(), module, action, ref_id || null, old_value ? JSON.stringify(old_value) : null, new_value ? JSON.stringify(new_value) : null, req.user?.id || 'system', req.user?.name || req.user?.email || 'system', req.ip || '');
  } catch (e) { console.error('Audit log error:', e.message); }
}

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
  const prevJob = await db.prepare('SELECT status,payment_status FROM service_bookings WHERE id=?').get(req.params.id);
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
      const { queueNotification } = await import('../../whatsapp/notifications.js');
      let msg = null;
      if (status === 'in_progress' && prev?.status !== 'in_progress')
        msg = `Job Update - AI Laptop Wala\n\nNamaste ${job.customer_name}!\n\nAapka ${job.device_brand} ${job.device_model} repair shuru ho gaya hai.\nJob ID: ${job.booking_number}\nTechnician: ${technician || 'Our Expert'}\n\n+91 98934 96163`;
      if (status === 'completed' && prev?.status !== 'completed')
        msg = `Repair Complete - AI Laptop Wala\n\nNamaste ${job.customer_name}!\n\nAapka ${job.device_brand} ${job.device_model} repair ho gaya hai!\nJob ID: ${job.booking_number}\nTotal: Rs.${total_charge.toLocaleString('en-IN')}\n\nPickup: +91 98934 96163\nSilver Mall, RNT Marg, Indore`;
      if (msg) await queueNotification(job.customer_phone, msg, 'job_update');
    }

    // Email notification on status change
    if (job?.customer_email && status && prev?.status !== status) {
      const { sendEmail, EmailTemplates } = await import('../../lib/email.js');
      const statusLabel = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled', waiting_parts: 'Waiting for Parts' }[status] || status;
      await sendEmail({
        to: job.customer_email,
        subject: `🛠️ Service Update — ${job.booking_number} — ${statusLabel}`,
        html: EmailTemplates.serviceUpdate(job, job.customer_name, statusLabel),
        toggleKey: 'email_service_update',
      });
      // Invoice email when completed + paid
      if (status === 'completed' && payment_status === 'paid') {
        await sendEmail({
          to: job.customer_email,
          subject: `Invoice — ${job.booking_number}`,
          html: EmailTemplates.invoice(job, job.customer_name),
          toggleKey: 'email_invoice',
        });
      }
    }
  } catch (e) { console.error("Operation error:", e.message); }

  // Audit log for job card update
  if (status && prev?.status !== status) {
    await auditLog(req, 'job_card', 'status_changed', req.params.id, { status: prev?.status }, { status });
  }

  res.json({ message: 'Updated' });
});

router.delete('/job-cards/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM service_bookings WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
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


// ── JOB CARD PHOTOS ───────────────────────────────────────

router.put('/job-cards/:id/photos', authMiddleware, adminOnly, async (req, res) => {
  const { photos_before, photos_after } = req.body;
  await db.prepare('UPDATE service_bookings SET photos_before=?,photos_after=? WHERE id=?')
    .run(JSON.stringify(photos_before || []), JSON.stringify(photos_after || []), req.params.id);
  res.json({ message: 'Updated' });
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
    const { queueNotification } = await import('../../whatsapp/notifications.js');
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



// ── JOB CARD TIME TRACKING ────────────────────────────────

// POST /api/erp/job-cards/:id/timer/start
router.post('/job-cards/:id/timer/start', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare("UPDATE job_cards SET timer_start=NOW(), timer_running=1 WHERE id=?").run(req.params.id);
  res.json({ success: true, started_at: new Date().toISOString() });
});

// POST /api/erp/job-cards/:id/timer/stop
router.post('/job-cards/:id/timer/stop', authMiddleware, adminOnly, async (req, res) => {
  const job = await db.prepare('SELECT timer_start, time_spent FROM job_cards WHERE id=?').get(req.params.id);
  if (!job?.timer_start) return res.status(400).json({ error: 'Timer not running' });
  const elapsed = Math.round((Date.now() - new Date(job.timer_start).getTime()) / 60000); // minutes
  const totalMinutes = (job.time_spent || 0) + elapsed;
  await db.prepare("UPDATE job_cards SET timer_running=0, timer_start=NULL, time_spent=? WHERE id=?").run(totalMinutes, req.params.id);
  res.json({ success: true, elapsed_minutes: elapsed, total_minutes: totalMinutes });
});

// POST /api/erp/job-cards/:id/warranty-check
router.post('/job-cards/:id/warranty-check', authMiddleware, adminOnly, async (req, res) => {
  const job = await db.prepare('SELECT * FROM job_cards WHERE id=?').get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  // Check if device was sold by us (by serial/phone)
  const order = await db.prepare("SELECT order_number, created_at FROM orders WHERE items LIKE ? OR address LIKE ? ORDER BY created_at DESC LIMIT 1")
    .get(`%${job.device_serial || 'NONE'}%`, `%${job.customer_phone || 'NONE'}%`);
  const warrantyDays = 90;
  const inWarranty = order ? (Date.now() - new Date(order.created_at).getTime()) < warrantyDays * 24 * 3600 * 1000 : false;
  res.json({ in_warranty: inWarranty, order: order?.order_number || null, warranty_days: warrantyDays, message: inWarranty ? 'Device is under warranty' : 'Warranty expired or not purchased from us' });
});

// ── QUOTATION / ESTIMATE ──────────────────────────────────

// POST /api/erp/quotations — create quotation (before invoice)
router.post('/quotations', authMiddleware, adminOnly, async (req, res) => {
  const { customer_name, customer_phone, items, notes, valid_days } = req.body;
  const id = uuid();
  const quote_number = 'QT-' + Date.now().toString().slice(-6);
  const subtotal = (items || []).reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
  await db.prepare("INSERT INTO billing (id, invoice_number, customer_name, customer_phone, items, subtotal, total, status, type, notes, due_date) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
    .run(id, quote_number, customer_name, customer_phone, JSON.stringify(items), subtotal, subtotal, 'draft', 'quotation', notes || '', new Date(Date.now() + (valid_days || 7) * 86400000).toISOString().split('T')[0]);
  res.status(201).json({ success: true, id, quote_number });
});

// POST /api/erp/quotations/:id/convert — convert quotation to invoice
router.post('/quotations/:id/convert', authMiddleware, adminOnly, async (req, res) => {
  const quote = await db.prepare("SELECT * FROM billing WHERE id=? AND type='quotation'").get(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quotation not found' });
  const invoiceNumber = 'INV-' + Date.now().toString().slice(-6);
  await db.prepare("UPDATE billing SET type='invoice', invoice_number=?, status='unpaid' WHERE id=?").run(invoiceNumber, req.params.id);
  res.json({ success: true, invoice_number: invoiceNumber });
});

export default router;

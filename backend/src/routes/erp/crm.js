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

  // Reject invalid phone formats (@lid, too long, non-numeric)
  if (phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length > 12 || phone.includes('@lid') || phone.includes('@g.us')) {
      return res.status(400).json({ error: 'Invalid phone number. @lid and group IDs are not valid contacts.' });
    }
  }

  // Duplicate detection (skip if _force flag)
  if (!req.body._force && (phone || email)) {
    const existing = await db.prepare('SELECT id, name, status FROM leads WHERE (phone=? AND phone!=\'\') OR (email=? AND email!=\'\') LIMIT 1').get(phone || '', email || '');
    if (existing) return res.status(409).json({ error: 'duplicate', existing, message: `Lead already exists: ${existing.name} (${existing.status})` });
  }

  const id = uuid();
  await db.prepare(`INSERT INTO leads (id,name,phone,email,source,interest,budget,deal_value,status,priority,assigned_to,notes,next_followup,expected_close,tags,score,branch_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, name, phone, email, source || 'walk-in', interest, budget || 0, deal_value || budget || 0,
      status || 'new', priority || 'normal', assigned_to, notes, next_followup, expected_close,
      JSON.stringify(tags || []), score || 0, req.body.branch_id || null);
  // Auto-assign based on rules
  try {
    const rule = await db.prepare('SELECT * FROM lead_assignment_rules WHERE source=? AND is_active=1').get(source);
    if (rule) {
      await db.prepare('UPDATE leads SET assigned_to=?,branch_id=COALESCE(?,branch_id) WHERE id=?').run(rule.assigned_to, rule.branch_id, id);
    }
  } catch {}
  await auditLog(req, 'crm', 'lead_created', id, null, { name, source });
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

router.get('/leads/:id/activities', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM lead_activities WHERE lead_id=? ORDER BY created_at DESC').all(req.params.id) || []);
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


// ── WHATSAPP SEND TO LEAD ─────────────────────────────────
router.post('/leads/:id/whatsapp', authMiddleware, adminOnly, async (req, res) => {
  const { message } = req.body;
  const lead = await db.prepare('SELECT * FROM leads WHERE id=?').get(req.params.id);
  if (!lead?.phone) return res.status(400).json({ error: 'Lead has no phone number' });
  if (!message) return res.status(400).json({ error: 'message required' });

  try {
    const { queueNotification } = await import('../../whatsapp/notifications.js');
    await queueNotification(lead.phone, message, 'crm_lead');
    // Log activity
    await db.prepare("INSERT INTO lead_activities (id,lead_id,type,note,created_by) VALUES (?,?,?,?,?)")
      .run(uuid(), req.params.id, 'whatsapp', `Sent: ${message.slice(0, 100)}`, req.user?.id || 'admin');
    res.json({ message: 'WhatsApp message queued' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ── LEAD AUTO-ASSIGNMENT RULES ────────────────────────────
router.get('/lead-rules', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM lead_assignment_rules WHERE is_active=1 ORDER BY source').all() || []);
});
router.post('/lead-rules', authMiddleware, adminOnly, async (req, res) => {
  const { source, assigned_to, branch_id } = req.body;
  if (!source || !assigned_to) return res.status(400).json({ error: 'source and assigned_to required' });
  const id = uuid();
  await db.prepare('INSERT INTO lead_assignment_rules (id,source,assigned_to,branch_id) VALUES (?,?,?,?)').run(id, source, assigned_to, branch_id || null);
  res.status(201).json({ id });
});
router.delete('/lead-rules/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM lead_assignment_rules WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});


// ── EMAIL SEND (CRM) ─────────────────────────────────────
router.post('/leads/:id/email', authMiddleware, adminOnly, async (req, res) => {
  const { subject, body } = req.body;
  const lead = await db.prepare('SELECT * FROM leads WHERE id=?').get(req.params.id);
  if (!lead?.email) return res.status(400).json({ error: 'Lead has no email' });
  if (!subject || !body) return res.status(400).json({ error: 'subject and body required' });

  // Load SMTP from DB (fallback to env)
  const getS = async (k) => (await db.prepare('SELECT value FROM app_settings WHERE key=?').get(k))?.value;
  const smtpHost = (await getS('smtp_host')) || process.env.SMTP_HOST;
  const smtpPort = (await getS('smtp_port')) || process.env.SMTP_PORT || '587';
  const smtpUser = (await getS('smtp_user')) || process.env.SMTP_USER;
  const smtpPass = (await getS('smtp_pass')) || process.env.SMTP_PASS;
  const smtpFrom = (await getS('smtp_from')) || process.env.SMTP_FROM || 'info@ailaptopwala.com';
  const smtpSecure = (await getS('smtp_secure')) === 'true';

  if (smtpHost && smtpUser) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: smtpHost, port: parseInt(smtpPort), secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({ from: smtpFrom, to: lead.email, subject, html: body });
    } catch (e) { return res.status(500).json({ error: 'Email send failed: ' + e.message }); }
  } else {
    return res.status(400).json({ error: 'SMTP not configured. Go to Admin → Settings → API Keys → SMTP Email.' });
  }
  await db.prepare("INSERT INTO lead_activities (id,lead_id,type,note,created_by) VALUES (?,?,?,?,?)").run(uuid(), req.params.id, 'email', `Subject: ${subject}`, req.user?.id || 'admin');
  await auditLog(req, 'crm', 'email_sent', req.params.id, null, { to: lead.email, subject });
  res.json({ message: 'Email sent successfully' });
});


// ── SMTP TEST ─────────────────────────────────────────────
router.post('/smtp-test', authMiddleware, adminOnly, async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ error: 'to email required' });
  const getS = async (k) => (await db.prepare('SELECT value FROM app_settings WHERE key=?').get(k))?.value;
  const smtpHost = await getS('smtp_host');
  const smtpUser = await getS('smtp_user');
  const smtpPass = await getS('smtp_pass');
  if (!smtpHost || !smtpUser) return res.status(400).json({ error: 'Configure SMTP Host and User first' });

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: parseInt((await getS('smtp_port')) || '587'),
      secure: (await getS('smtp_secure')) === 'true',
      auth: { user: smtpUser, pass: smtpPass },
    });
    await transporter.verify();
    await transporter.sendMail({
      from: (await getS('smtp_from')) || smtpUser,
      to,
      subject: '✓ SMTP Test — AI Laptop Wala',
      html: `<h2>SMTP Configuration Working!</h2><p>This test email was sent from your AI Laptop Wala admin panel.</p><p><b>Host:</b> ${smtpHost}<br><b>From:</b> ${(await getS('smtp_from')) || smtpUser}</p><p>Your email system is ready to send customer notifications, invoices, and marketing emails.</p>`,
    });
    res.json({ message: 'Test email sent successfully to ' + to });
  } catch (e) {
    res.status(500).json({ error: 'SMTP test failed: ' + e.message });
  }
});



// ── LEAD SOURCE ANALYTICS ─────────────────────────────────

// GET /api/erp/leads/source-analytics
router.get('/leads/source-analytics', authMiddleware, adminOnly, async (req, res) => {
  const sources = await db.prepare(`
    SELECT source, COUNT(*) as total,
      SUM(CASE WHEN status='won' THEN 1 ELSE 0 END) as won,
      SUM(CASE WHEN status='lost' THEN 1 ELSE 0 END) as lost,
      COALESCE(SUM(deal_value),0) as total_value,
      COALESCE(AVG(score),0) as avg_score
    FROM leads WHERE source IS NOT NULL GROUP BY source ORDER BY total DESC
  `).all();
  res.json(sources.map(s => ({ ...s, conversion_rate: s.total > 0 ? Math.round((s.won / s.total) * 100) : 0 })));
});

// ── DEAL PIPELINE FORECAST ────────────────────────────────

// GET /api/erp/leads/pipeline-forecast
router.get('/leads/pipeline-forecast', authMiddleware, adminOnly, async (req, res) => {
  const pipeline = await db.prepare(`
    SELECT status, COUNT(*) as count, COALESCE(SUM(deal_value),0) as value,
      COALESCE(AVG(deal_value),0) as avg_deal
    FROM leads WHERE status NOT IN ('won','lost') GROUP BY status
  `).all();
  const wonThisMonth = await db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(deal_value),0) as v FROM leads WHERE status='won' AND updated_at > NOW() - INTERVAL '30 days'").get();
  const totalPipeline = pipeline.reduce((s, p) => s + (p.value || 0), 0);
  // Weighted forecast (each stage has probability)
  const weights = { new: 0.1, contacted: 0.2, interested: 0.4, negotiation: 0.7 };
  const forecast = pipeline.reduce((s, p) => s + (p.value || 0) * (weights[p.status] || 0.3), 0);
  res.json({ pipeline, total_pipeline: totalPipeline, weighted_forecast: Math.round(forecast), won_this_month: wonThisMonth });
});

// ── DUPLICATE DETECTION + MERGE ───────────────────────────

// GET /api/erp/leads/duplicates — find potential duplicates
router.get('/leads/duplicates', authMiddleware, adminOnly, async (req, res) => {
  const duplicates = await db.prepare(`
    SELECT l1.id as id1, l1.name as name1, l1.phone as phone1, l1.created_at as created1,
           l2.id as id2, l2.name as name2, l2.phone as phone2, l2.created_at as created2
    FROM leads l1 JOIN leads l2 ON l1.phone = l2.phone AND l1.id < l2.id
    LIMIT 20
  `).all();
  res.json(duplicates);
});

// POST /api/erp/leads/merge — merge two leads (keep first, delete second)
router.post('/leads/merge', authMiddleware, adminOnly, async (req, res) => {
  const { keep_id, merge_id } = req.body;
  if (!keep_id || !merge_id) return res.status(400).json({ error: 'keep_id and merge_id required' });
  // Move activities from merge to keep
  await db.prepare('UPDATE lead_activities SET lead_id=? WHERE lead_id=?').run(keep_id, merge_id);
  await db.prepare('UPDATE followups SET lead_id=? WHERE lead_id=?').run(keep_id, merge_id);
  // Delete merged lead
  await db.prepare('DELETE FROM leads WHERE id=?').run(merge_id);
  res.json({ success: true, message: 'Leads merged' });
});

// ── ROUND-ROBIN ASSIGNMENT ────────────────────────────────

// POST /api/erp/leads/auto-assign — assign next lead to staff in rotation
router.post('/leads/auto-assign', authMiddleware, adminOnly, async (req, res) => {
  const { lead_id } = req.body;
  if (!lead_id) return res.status(400).json({ error: 'lead_id required' });
  // Get active staff
  const staff = await db.prepare("SELECT id, name FROM staff WHERE is_active=1 AND role IN ('sales','manager','technician') ORDER BY name").all();
  if (staff.length === 0) return res.status(400).json({ error: 'No staff available' });
  // Get last assigned staff
  const lastAssigned = await db.prepare("SELECT assigned_to FROM leads WHERE assigned_to IS NOT NULL ORDER BY updated_at DESC LIMIT 1").get();
  const lastIdx = staff.findIndex(s => s.name === lastAssigned?.assigned_to);
  const nextIdx = (lastIdx + 1) % staff.length;
  const assignTo = staff[nextIdx];
  await db.prepare('UPDATE leads SET assigned_to=? WHERE id=?').run(assignTo.name, lead_id);
  res.json({ success: true, assigned_to: assignTo.name });
});

// ── CRM REPORTS ───────────────────────────────────────────

// GET /api/erp/leads/reports/conversion-funnel
router.get('/leads/reports/conversion-funnel', authMiddleware, adminOnly, async (req, res) => {
  const funnel = await db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status IN ('contacted','interested','negotiation','won') THEN 1 ELSE 0 END) as contacted,
      SUM(CASE WHEN status IN ('interested','negotiation','won') THEN 1 ELSE 0 END) as interested,
      SUM(CASE WHEN status IN ('negotiation','won') THEN 1 ELSE 0 END) as negotiation,
      SUM(CASE WHEN status='won' THEN 1 ELSE 0 END) as won
    FROM leads
  `).get();
  res.json(funnel);
});

// GET /api/erp/leads/reports/time-to-close
router.get('/leads/reports/time-to-close', authMiddleware, adminOnly, async (req, res) => {
  const avg = await db.prepare("SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_days FROM leads WHERE status='won' AND updated_at IS NOT NULL").get();
  const bySource = await db.prepare("SELECT source, AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_days, COUNT(*) as count FROM leads WHERE status='won' GROUP BY source").all();
  res.json({ average_days: Math.round(avg?.avg_days || 0), by_source: bySource });
});

// ── WHATSAPP TEMPLATES ────────────────────────────────────

// GET /api/erp/wa-templates — saved message templates
router.get('/wa-templates', authMiddleware, adminOnly, async (req, res) => {
  const templates = await db.prepare("SELECT * FROM app_settings WHERE key LIKE 'wa_template_%' ORDER BY key").all();
  res.json(templates.map(t => ({ id: t.key, name: t.key.replace('wa_template_', ''), message: t.value })));
});

// POST /api/erp/wa-templates — save template
router.post('/wa-templates', authMiddleware, adminOnly, async (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) return res.status(400).json({ error: 'name and message required' });
  const key = `wa_template_${name.toLowerCase().replace(/\s+/g, '_')}`;
  await db.prepare("INSERT INTO app_settings (key, value) VALUES (?,?) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value").run(key, message);
  res.json({ success: true });
});

// DELETE /api/erp/wa-templates/:name
router.delete('/wa-templates/:name', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare("DELETE FROM app_settings WHERE key=?").run(`wa_template_${req.params.name}`);
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════
// CRM ADVANCED FEATURES
// ══════════════════════════════════════════════════════════

// ── TASKS / CALENDAR ──────────────────────────────────────

// GET /api/erp/tasks — all tasks (calendar view)
router.get('/tasks', authMiddleware, adminOnly, async (req, res) => {
  const { from, to, assigned_to } = req.query;
  let q = "SELECT t.*, l.name as lead_name FROM crm_tasks t LEFT JOIN leads l ON t.lead_id=l.id WHERE 1=1";
  const params = [];
  if (from) { q += ' AND t.due_date >= ?'; params.push(from); }
  if (to) { q += ' AND t.due_date <= ?'; params.push(to); }
  if (assigned_to) { q += ' AND t.assigned_to = ?'; params.push(assigned_to); }
  q += ' ORDER BY t.due_date ASC';
  res.json(await db.prepare(q).all(...params));
});

// POST /api/erp/tasks
router.post('/tasks', authMiddleware, adminOnly, async (req, res) => {
  const { title, type, lead_id, assigned_to, due_date, due_time, notes, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const id = uuid();
  await db.prepare("INSERT INTO crm_tasks (id, title, type, lead_id, assigned_to, due_date, due_time, notes, priority, status) VALUES (?,?,?,?,?,?,?,?,?,?)")
    .run(id, title, type || 'task', lead_id || null, assigned_to || null, due_date || null, due_time || null, notes || '', priority || 'normal', 'pending');
  res.status(201).json({ success: true, id });
});

// PUT /api/erp/tasks/:id/complete
router.put('/tasks/:id/complete', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare("UPDATE crm_tasks SET status='completed', completed_at=NOW() WHERE id=?").run(req.params.id);
  res.json({ success: true });
});

// ── CALL LOG ──────────────────────────────────────────────

// POST /api/erp/leads/:id/call-log
router.post('/leads/:id/call-log', authMiddleware, adminOnly, async (req, res) => {
  const { duration, outcome, notes } = req.body;
  const id = uuid();
  await db.prepare("INSERT INTO lead_activities (id, lead_id, type, note, created_by) VALUES (?,?,?,?,?)")
    .run(id, req.params.id, 'call', `📞 Call (${duration || '0'}min) — ${outcome || 'no answer'}${notes ? ': ' + notes : ''}`, req.user?.name || 'Admin');
  // Update lead last contact
  await db.prepare("UPDATE leads SET updated_at=NOW() WHERE id=?").run(req.params.id);
  res.json({ success: true, id });
});

// ── LEAD SCORING RULES EDITOR ─────────────────────────────

// GET /api/erp/scoring-rules
router.get('/scoring-rules', authMiddleware, adminOnly, async (req, res) => {
  const rules = await db.prepare("SELECT * FROM app_settings WHERE key LIKE 'scoring_rule_%' ORDER BY key").all();
  if (rules.length === 0) {
    // Return defaults
    return res.json([
      { id: 'status', field: 'status', condition: 'equals', values: { contacted: 10, interested: 20, negotiation: 30, won: 40 }, weight: 1 },
      { id: 'budget', field: 'budget', condition: 'greater_than', values: { 50000: 20, 20000: 10, 5000: 5 }, weight: 1 },
      { id: 'followups', field: 'followup_count', condition: 'per_unit', values: { per: 10, max: 40 }, weight: 1 },
    ]);
  }
  res.json(rules.map(r => ({ id: r.key, ...JSON.parse(r.value) })));
});

// POST /api/erp/scoring-rules — save custom rules
router.post('/scoring-rules', authMiddleware, adminOnly, async (req, res) => {
  const { rules } = req.body;
  if (!Array.isArray(rules)) return res.status(400).json({ error: 'rules array required' });
  // Clear old rules
  await db.prepare("DELETE FROM app_settings WHERE key LIKE 'scoring_rule_%'").run();
  for (let i = 0; i < rules.length; i++) {
    await db.prepare("INSERT INTO app_settings (key, value) VALUES (?,?)").run(`scoring_rule_${i}`, JSON.stringify(rules[i]));
  }
  res.json({ success: true, count: rules.length });
});

// ── CAMPAIGN ATTRIBUTION ──────────────────────────────────

// GET /api/erp/leads/attribution — which campaign/source brought which leads
router.get('/leads/attribution', authMiddleware, adminOnly, async (req, res) => {
  const attribution = await db.prepare(`
    SELECT source, 
      COUNT(*) as leads,
      SUM(CASE WHEN status='won' THEN 1 ELSE 0 END) as conversions,
      COALESCE(SUM(CASE WHEN status='won' THEN deal_value ELSE 0 END), 0) as revenue,
      COALESCE(AVG(CASE WHEN status='won' THEN deal_value END), 0) as avg_deal
    FROM leads WHERE source IS NOT NULL GROUP BY source ORDER BY revenue DESC
  `).all();
  res.json(attribution);
});

// ── STAGE-WISE CONVERSION + LOST REASONS ──────────────────

// GET /api/erp/leads/stage-analysis
router.get('/leads/stage-analysis', authMiddleware, adminOnly, async (req, res) => {
  const stages = await db.prepare(`
    SELECT status, COUNT(*) as count, 
      COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400), 0) as avg_days_in_stage
    FROM leads GROUP BY status ORDER BY count DESC
  `).all();
  const lostReasons = await db.prepare(`
    SELECT lost_reason, COUNT(*) as count 
    FROM leads WHERE status='lost' AND lost_reason IS NOT NULL AND lost_reason != ''
    GROUP BY lost_reason ORDER BY count DESC LIMIT 10
  `).all();
  const stageTransitions = await db.prepare(`
    SELECT status, 
      SUM(CASE WHEN status='won' THEN 1 ELSE 0 END) as to_won,
      SUM(CASE WHEN status='lost' THEN 1 ELSE 0 END) as to_lost
    FROM leads GROUP BY status
  `).all();
  res.json({ stages, lost_reasons: lostReasons, transitions: stageTransitions });
});

// ── CUSTOMER COMPLAINT LINKAGE ────────────────────────────

// POST /api/erp/leads/:id/complaint
router.post('/leads/:id/complaint', authMiddleware, adminOnly, async (req, res) => {
  const { subject, description, priority, linked_order } = req.body;
  const id = uuid();
  await db.prepare("INSERT INTO lead_activities (id, lead_id, type, note, created_by) VALUES (?,?,?,?,?)")
    .run(id, req.params.id, 'complaint', `⚠️ Complaint: ${subject}${linked_order ? ' (Order: ' + linked_order + ')' : ''}\n${description || ''}`, req.user?.name || 'Admin');
  // Create notification
  await db.prepare("INSERT INTO notifications (id, type, title, message, link) VALUES (?,?,?,?,?)")
    .run(uuid(), 'complaint', 'Customer Complaint', `${subject} — Lead #${req.params.id}`, '/admin/erp/crm');
  res.json({ success: true, id });
});

export default router;

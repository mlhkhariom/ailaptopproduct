import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// POST /api/contacts — public submit
router.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'name, email, message required' });
  const id = uuid();
  await db.prepare('INSERT INTO contact_queries (id, name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, email, phone, subject, message);
  await db.prepare('INSERT INTO notifications (id, type, title, message, link) VALUES (?, ?, ?, ?, ?)')
    .run(uuid(), 'contact', 'New Contact Query', `${name} ne message bheja: ${subject || message.slice(0, 40)}`, '/admin/contacts');

  // Auto-create CRM lead
  try {
    const existing = await db.prepare('SELECT id FROM leads WHERE phone=? OR email=?').get(phone || '', email);
    if (!existing) {
      await db.prepare(`INSERT INTO leads (id,name,phone,email,source,interest,status,notes)
        VALUES (?,?,?,?,'Website',?,  'new',?)`)
        .run(uuid(), name, phone || '', email, subject || 'Contact Us inquiry', message.slice(0, 200));
    }
  } catch (e) { console.error("Contact → Lead error:", e.message); }

  res.status(201).json({ message: 'Query submitted' });
});

// POST /api/contacts/enquiry — Linktree form → CRM lead + WhatsApp auto-reply
router.post('/enquiry', async (req, res) => {
  const { name, phone, email, interest, budget, message } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });

  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  if (cleanPhone.length !== 10) return res.status(400).json({ error: 'Valid 10-digit phone required' });

  // Save/update CRM lead
  const existing = await db.prepare('SELECT id FROM leads WHERE phone=?').get(cleanPhone);
  let leadId;
  if (existing) {
    leadId = existing.id;
    await db.prepare("UPDATE leads SET interest=COALESCE(NULLIF(?,''),interest), notes=COALESCE(NULLIF(?,''),notes), updated_at=NOW() WHERE id=?")
      .run(interest, message, leadId);
  } else {
    leadId = uuid();
    await db.prepare(`INSERT INTO leads (id,name,phone,source,interest,status,notes) VALUES (?,?,?,?,?,?,?)`)
      .run(leadId, name, cleanPhone, 'Enquiry Form', interest || 'General', 'new', message || '');
  }

  try { await db.prepare("INSERT INTO lead_activities (id,lead_id,type,note,created_by) VALUES (?,?,?,?,?)")
    .run(uuid(), leadId, 'form', `Enquiry: ${interest || 'General'}${message ? ' | ' + message.slice(0, 100) : ''}`, 'system'); } catch {}

  await db.prepare('INSERT INTO notifications (id,type,title,message,link) VALUES (?,?,?,?,?)')
    .run(uuid(), 'lead', 'New Enquiry', `${name} (${cleanPhone}) — ${interest || 'General'}`, '/admin/erp/crm');

  // Auto WhatsApp thank you (non-blocking)
  import('../whatsapp/notifications.js').then(({ queueNotification }) => {
    queueNotification(cleanPhone, `🙏 *Thank You, ${name}!*\n\nAapki enquiry receive ho gayi hai.\n${interest ? `\n*Interest:* ${interest}` : ''}\n\nHamari team jaldi contact karegi.\n\n📞 +91 98934 96163\n🌐 ailaptopwala.com\n\n— AI Laptop Wala`, 'enquiry_thankyou');
  }).catch(() => {});

  // Run CRM automations (non-blocking)
  import('./crmTools.js').then(({ runLeadAutomations }) => {
    runLeadAutomations({ id: leadId, name, phone: cleanPhone, source: 'Enquiry Form', interest });
  }).catch(() => {});

  res.status(201).json({ success: true, message: 'Thank you! We will contact you soon.' });
});

// GET /api/contacts — admin
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM contact_queries WHERE 1=1';
  const params = [];
  if (status) { query += ' AND status = ?'; params.push(status); }
  query += ' ORDER BY created_at DESC';
  res.json(await db.prepare(query).all(...params));
});

// PUT /api/contacts/:id — admin update status/reply
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { status, reply, priority, starred } = req.body;
  await db.prepare('UPDATE contact_queries SET status=?, reply=?, priority=?, starred=? WHERE id=?').run(status, reply, priority, starred ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

export default router;

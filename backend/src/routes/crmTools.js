import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { sendEmail } from '../lib/email.js';

const router = Router();

// ══════════════════════════════════════════════════════════
// CRM AUTOMATIONS
// ══════════════════════════════════════════════════════════

// GET /api/crm-tools/automations
router.get('/automations', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM crm_automations ORDER BY created_at DESC').all());
});

// POST /api/crm-tools/automations
router.post('/automations', authMiddleware, adminOnly, async (req, res) => {
  const { name, trigger_type, trigger_conditions, action_type, action_config } = req.body;
  if (!name || !trigger_type || !action_type) return res.status(400).json({ error: 'name, trigger_type, action_type required' });
  const id = uuid();
  await db.prepare('INSERT INTO crm_automations (id, name, trigger_type, trigger_conditions, action_type, action_config) VALUES (?,?,?,?,?,?)')
    .run(id, name, trigger_type, JSON.stringify(trigger_conditions || {}), action_type, JSON.stringify(action_config || {}));
  res.status(201).json(await db.prepare('SELECT * FROM crm_automations WHERE id=?').get(id));
});

// PUT /api/crm-tools/automations/:id
router.put('/automations/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, trigger_type, trigger_conditions, action_type, action_config, is_active } = req.body;
  await db.prepare('UPDATE crm_automations SET name=COALESCE(?,name), trigger_type=COALESCE(?,trigger_type), trigger_conditions=COALESCE(?,trigger_conditions), action_type=COALESCE(?,action_type), action_config=COALESCE(?,action_config), is_active=COALESCE(?,is_active) WHERE id=?')
    .run(name, trigger_type, trigger_conditions ? JSON.stringify(trigger_conditions) : null, action_type, action_config ? JSON.stringify(action_config) : null, is_active, req.params.id);
  res.json({ success: true });
});

// DELETE /api/crm-tools/automations/:id
router.delete('/automations/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM crm_automations WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ── Run automations on new lead ──────────────────────────
export async function runLeadAutomations(lead) {
  try {
    const rules = await db.prepare('SELECT * FROM crm_automations WHERE is_active=1').all();
    for (const rule of rules) {
      const conditions = typeof rule.trigger_conditions === 'string' ? JSON.parse(rule.trigger_conditions) : rule.trigger_conditions;
      const config = typeof rule.action_config === 'string' ? JSON.parse(rule.action_config) : rule.action_config;
      let match = false;

      if (rule.trigger_type === 'new_lead') match = true;
      if (rule.trigger_type === 'source_match' && conditions.source && lead.source === conditions.source) match = true;
      if (rule.trigger_type === 'interest_contains' && conditions.keyword && lead.interest?.toLowerCase().includes(conditions.keyword.toLowerCase())) match = true;
      if (rule.trigger_type === 'budget_above' && conditions.amount && (lead.budget || 0) >= conditions.amount) match = true;

      if (match) {
        if (rule.action_type === 'assign' && config.assigned_to) {
          await db.prepare('UPDATE leads SET assigned_to=? WHERE id=?').run(config.assigned_to, lead.id);
        }
        if (rule.action_type === 'tag' && config.tag) {
          const existing = await db.prepare('SELECT tags FROM leads WHERE id=?').get(lead.id);
          const tags = existing?.tags ? `${existing.tags},${config.tag}` : config.tag;
          await db.prepare('UPDATE leads SET tags=? WHERE id=?').run(tags, lead.id);
        }
        if (rule.action_type === 'priority' && config.priority) {
          await db.prepare('UPDATE leads SET priority=? WHERE id=?').run(config.priority, lead.id);
        }
        if (rule.action_type === 'notify' && config.message) {
          await db.prepare('INSERT INTO notifications (id, type, title, message, link) VALUES (?,?,?,?,?)')
            .run(uuid(), 'crm', 'Automation: ' + rule.name, config.message.replace('{name}', lead.name), '/admin/erp/crm');
        }
        await db.prepare('UPDATE crm_automations SET run_count=run_count+1 WHERE id=?').run(rule.id);
      }
    }
  } catch (e) { console.error('Automation error:', e.message); }
}

// ══════════════════════════════════════════════════════════
// EMAIL CAMPAIGNS
// ══════════════════════════════════════════════════════════

// GET /api/crm-tools/campaigns
router.get('/campaigns', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM email_campaigns ORDER BY created_at DESC').all());
});

// POST /api/crm-tools/campaigns
router.post('/campaigns', authMiddleware, adminOnly, async (req, res) => {
  const { name, subject, body, recipients, filter_conditions, scheduled_at } = req.body;
  if (!name || !subject || !body) return res.status(400).json({ error: 'name, subject, body required' });
  const id = uuid();
  await db.prepare('INSERT INTO email_campaigns (id, name, subject, body, recipients, filter_conditions, scheduled_at) VALUES (?,?,?,?,?,?,?)')
    .run(id, name, subject, body, recipients || 'all', JSON.stringify(filter_conditions || {}), scheduled_at || null);
  res.status(201).json(await db.prepare('SELECT * FROM email_campaigns WHERE id=?').get(id));
});

// POST /api/crm-tools/campaigns/:id/send — send campaign
router.post('/campaigns/:id/send', authMiddleware, adminOnly, async (req, res) => {
  const campaign = await db.prepare('SELECT * FROM email_campaigns WHERE id=?').get(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  // Get recipients
  let emails = [];
  if (campaign.recipients === 'all') {
    emails = (await db.prepare("SELECT email FROM users WHERE email IS NOT NULL AND email != ''").all()).map(u => u.email);
  } else if (campaign.recipients === 'customers') {
    emails = (await db.prepare("SELECT email FROM users WHERE role='customer' AND email IS NOT NULL").all()).map(u => u.email);
  } else if (campaign.recipients === 'leads') {
    emails = (await db.prepare("SELECT email FROM leads WHERE email IS NOT NULL AND email != ''").all()).map(u => u.email);
  }

  let sent = 0;
  for (const email of emails) {
    try {
      await sendEmail({ to: email, subject: campaign.subject, html: campaign.body });
      sent++;
    } catch {}
  }

  await db.prepare("UPDATE email_campaigns SET status='sent', sent_count=?, sent_at=NOW() WHERE id=?").run(sent, req.params.id);
  res.json({ success: true, sent, total: emails.length });
});

// DELETE /api/crm-tools/campaigns/:id
router.delete('/campaigns/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM email_campaigns WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

export default router;

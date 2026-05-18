import { Router } from 'express';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminOnly, superAdminOnly } from '../../middleware/adminOnly.js';

const router = Router();


// GET /api/app-settings?category=general
router.get('/', async (req, res) => {
  const { category } = req.query;
  let q = 'SELECT key, value, category FROM app_settings WHERE 1=1';
  const params = [];
  if (category) { q += ' AND category = ?'; params.push(category); }
  const rows = await db.prepare(q).all(...params);
  const result = Object.fromEntries(rows.map(r => [r.key, r.value]));
  res.json(result);
});

// PUT /api/app-settings — admin
router.put('/', authMiddleware, adminOnly, async (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    await db.prepare(`INSERT INTO app_settings (key, value, category, updated_at) VALUES (?, ?, 'general', NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`).run(key, String(value));
  }
  // Invalidate config cache so changes take effect immediately
  try { const { invalidateCache } = await import('../lib/config.js'); invalidateCache(); } catch {}
  res.json({ message: 'Settings saved' });
});

export default router;

// POST /api/notifications/test-email
router.post('/test-email', authMiddleware, adminOnly, async (req, res) => {
  const { to } = req.body;
  try {
    const settings = Object.fromEntries((await db.prepare('SELECT key, value FROM app_settings').all()).map(r => [r.key, r.value]));
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: settings.smtp_host || 'smtp.gmail.com',
      port: parseInt(settings.smtp_port || '587'),
      secure: settings.smtp_encryption === 'ssl',
      auth: { user: settings.smtp_user, pass: settings.smtp_pass }
    });
    await transporter.sendMail({
      from: `"${settings.smtp_from_name || 'AI Laptop Wala'}" <${settings.smtp_user}>`,
      to: to || settings.store_email,
      subject: 'Test Email from AI Laptop Wala',
      html: '<h2>Test Email</h2><p>If you received this, your SMTP configuration is working correctly!</p><p>— AI Laptop Wala Admin Panel</p>'
    });
    res.json({ success: true, message: 'Test email sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/notifications/test-whatsapp
router.post('/test-whatsapp', authMiddleware, adminOnly, async (req, res) => {
  const { to } = req.body;
  try {
    const settings = Object.fromEntries((await db.prepare('SELECT key, value FROM app_settings').all()).map(r => [r.key, r.value]));
    const phone = to || settings.wa_business_phone || settings.whatsapp_number;
    // Simple fetch to WhatsApp API
    const apiUrl = settings.wa_api_url;
    const apiKey = settings.wa_api_key;
    if (!apiUrl || !apiKey) return res.status(400).json({ success: false, message: 'WhatsApp API URL and Key not configured' });
    const response = await fetch(`${apiUrl}/api/v1/sendSessionMessage/${phone}`, {
      method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageText: 'Test message from AI Laptop Wala Admin Panel. WhatsApp integration is working!' })
    });
    if (response.ok) res.json({ success: true, message: 'Test WhatsApp sent' });
    else res.status(500).json({ success: false, message: 'WhatsApp API returned error' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

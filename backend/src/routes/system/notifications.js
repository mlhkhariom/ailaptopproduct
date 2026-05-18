import { Router } from 'express';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminOnly } from '../../middleware/adminOnly.js';

const router = Router();

// GET /api/notifications — admin
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all());
});

// PUT /api/notifications/:id/read — mark read
router.put('/:id/read', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Marked read' });
});

// PUT /api/notifications/read-all — mark all read
router.put('/read-all', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('UPDATE notifications SET is_read = 1').run();
  res.json({ message: 'All marked read' });
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
      html: '<h2>Test Email</h2><p>Your SMTP configuration is working correctly!</p>'
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/notifications/test-whatsapp
router.post('/test-whatsapp', authMiddleware, adminOnly, async (req, res) => {
  const { to } = req.body;
  try {
    const settings = Object.fromEntries((await db.prepare('SELECT key, value FROM app_settings').all()).map(r => [r.key, r.value]));
    const phone = to || settings.wa_business_phone || settings.whatsapp_number;
    if (!settings.wa_api_url || !settings.wa_api_key) return res.status(400).json({ success: false, message: 'WhatsApp API not configured' });
    const response = await fetch(`${settings.wa_api_url}/api/v1/sendSessionMessage/${phone}`, {
      method: 'POST', headers: { Authorization: `Bearer ${settings.wa_api_key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageText: 'Test from AI Laptop Wala Admin. WhatsApp is working!' })
    });
    if (response.ok) res.json({ success: true }); else res.status(500).json({ success: false, message: 'API error' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

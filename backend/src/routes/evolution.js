import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { superAdminOnly } from '../middleware/adminOnly.js';
import { handleWebhook } from '../evolution/webhook.js';
import {
  evolutionFetch, testConnection, fetchInstances, createInstance,
  connectInstance, disconnectInstance, deleteInstance, getInstanceStatus,
  getQRCode, restartInstance, fetchChats, fetchMessages,
  sendText, sendMedia, sendReaction, fetchContacts, checkNumber, setWebhook
} from '../evolution/client.js';

const router = Router();

const getSettings = () => db.prepare("SELECT * FROM evolution_settings WHERE id='main'").get() || {};

// ── Settings (superadmin only) ────────────────────────────

// GET /api/evolution/settings
router.get('/settings', authMiddleware, superAdminOnly, (req, res) => {
  const s = getSettings();
  // Return masked key for display, but also provide ws_url for frontend WebSocket
  const masked = { ...s };
  if (masked.api_key) masked.api_key_masked = masked.api_key.replace(/.(?=.{4})/g, '•');
  // Don't mask for WebSocket connection
  res.json({ ...masked, ws_url: s.api_url });
});

// PUT /api/evolution/settings
router.put('/settings', authMiddleware, superAdminOnly, (req, res) => {
  const { api_url, api_key, default_instance, webhook_secret } = req.body;
  const existing = getSettings();
  db.prepare(`INSERT OR REPLACE INTO evolution_settings (id, api_url, api_key, default_instance, webhook_secret, is_visible_to_admin, updated_at)
    VALUES ('main', ?, ?, ?, ?, ?, datetime('now'))`)
    .run(api_url || existing.api_url, api_key && !api_key.includes('•') ? api_key : existing.api_key,
      default_instance || existing.default_instance, webhook_secret || existing.webhook_secret,
      existing.is_visible_to_admin || 0);
  res.json({ message: 'Settings saved' });
});

// POST /api/evolution/settings/test
router.post('/settings/test', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const result = await testConnection();
    res.json({ ok: true, ...result });
  } catch (e) { res.status(400).json({ ok: false, error: e.message }); }
});

// PUT /api/evolution/settings/visibility
router.put('/settings/visibility', authMiddleware, superAdminOnly, (req, res) => {
  db.prepare("UPDATE evolution_settings SET is_visible_to_admin=?, updated_at=datetime('now') WHERE id='main'").run(req.body.visible ? 1 : 0);
  res.json({ message: 'Updated' });
});

// ── Instances ─────────────────────────────────────────────

// GET /api/evolution/instances
router.get('/instances', authMiddleware, async (req, res) => {
  // Check visibility for non-superadmin
  if (req.user.role !== 'superadmin') {
    const s = getSettings();
    if (!s.is_visible_to_admin) return res.status(403).json({ error: 'Access denied' });
  }
  try {
    const remote = await fetchInstances();
    const local = db.prepare('SELECT * FROM evolution_instances WHERE is_active=1').all();
    // Merge remote status into local
    const merged = local.map(l => {
      const r = Array.isArray(remote) ? remote.find(ri => ri.instance?.instanceName === l.instance_name) : null;
      return { ...l, remote_status: r?.instance?.state || l.status };
    });
    res.json(merged);
  } catch (e) {
    const local = db.prepare('SELECT * FROM evolution_instances WHERE is_active=1').all();
    res.json(local);
  }
});

// POST /api/evolution/instances
router.post('/instances', authMiddleware, superAdminOnly, async (req, res) => {
  const { instance_name, connection_type = 'baileys', cloud_phone_id, cloud_business_id, cloud_access_token, cloud_webhook_token } = req.body;
  if (!instance_name) return res.status(400).json({ error: 'instance_name required' });
  try {
    const cloudConfig = connection_type === 'cloud' ? { phoneNumber: cloud_phone_id, token: cloud_access_token } : {};
    await createInstance(instance_name, connection_type, cloudConfig);
    const id = uuid();
    db.prepare('INSERT OR IGNORE INTO evolution_instances (id,instance_name,connection_type,cloud_phone_id,cloud_business_id,cloud_access_token,cloud_webhook_token) VALUES (?,?,?,?,?,?,?)')
      .run(id, instance_name, connection_type, cloud_phone_id || null, cloud_business_id || null, cloud_access_token || null, cloud_webhook_token || null);

    // Set webhook
    const webhookUrl = `${process.env.FRONTEND_URL?.replace('8080', '5000') || 'http://localhost:5000'}/api/evolution/webhook/${instance_name}`;
    await setWebhook(instance_name, webhookUrl).catch(() => {});

    res.status(201).json(db.prepare('SELECT * FROM evolution_instances WHERE id=?').get(id));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/evolution/instances/:name/status
router.get('/instances/:name/status', authMiddleware, async (req, res) => {
  try {
    const status = await getInstanceStatus(req.params.name);
    db.prepare("UPDATE evolution_instances SET status=?, updated_at=datetime('now') WHERE instance_name=?").run(status.instance?.state || 'unknown', req.params.name);
    res.json(status);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/evolution/instances/:name/qr
router.get('/instances/:name/qr', authMiddleware, async (req, res) => {
  try {
    const data = await getQRCode(req.params.name);
    if (data.base64) db.prepare("UPDATE evolution_instances SET qr_code=?, status='qr_code' WHERE instance_name=?").run(data.base64, req.params.name);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/evolution/instances/:name/connect
router.post('/instances/:name/connect', authMiddleware, superAdminOnly, async (req, res) => {
  try { res.json(await connectInstance(req.params.name)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/evolution/instances/:name/disconnect
router.post('/instances/:name/disconnect', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    await disconnectInstance(req.params.name);
    db.prepare("UPDATE evolution_instances SET status='disconnected' WHERE instance_name=?").run(req.params.name);
    res.json({ message: 'Disconnected' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/evolution/instances/:name/restart
router.post('/instances/:name/restart', authMiddleware, superAdminOnly, async (req, res) => {
  try { res.json(await restartInstance(req.params.name)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/evolution/instances/:name
router.delete('/instances/:name', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    await deleteInstance(req.params.name).catch(() => {});
    db.prepare("UPDATE evolution_instances SET is_active=0 WHERE instance_name=?").run(req.params.name);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Chats & Messages ──────────────────────────────────────

// GET /api/evolution/instances/:name/chats
router.get('/instances/:name/chats', authMiddleware, async (req, res) => {
  try {
    // Try remote first, fallback to DB
    const remote = await fetchChats(req.params.name).catch(() => null);
    if (remote && Array.isArray(remote)) return res.json(remote);
    const local = db.prepare('SELECT * FROM evolution_chats WHERE instance_name=? ORDER BY updated_at DESC').all(req.params.name);
    res.json(local);
  } catch (e) {
    const local = db.prepare('SELECT * FROM evolution_chats WHERE instance_name=? ORDER BY updated_at DESC').all(req.params.name);
    res.json(local);
  }
});

// GET /api/evolution/instances/:name/messages/:jid
router.get('/instances/:name/messages/:jid', authMiddleware, async (req, res) => {
  const jid = decodeURIComponent(req.params.jid);
  const phone = jid.replace('@s.whatsapp.net','').replace('@lid','').replace(/[^0-9]/g,'');

  try {
    // Fetch from both JID formats and merge
    const [r1, r2] = await Promise.allSettled([
      fetchMessages(req.params.name, jid, 50),
      // Also try @lid if given @s.whatsapp.net and vice versa
      fetchMessages(req.params.name, jid.includes('@lid') ? `${phone}@s.whatsapp.net` : `${phone}@lid`, 50),
    ]);

    const records1 = r1.status === 'fulfilled' ? (r1.value?.messages?.records || []) : [];
    const records2 = r2.status === 'fulfilled' ? (r2.value?.messages?.records || []) : [];

    // Merge and deduplicate by message ID
    const seen = new Set();
    const all = [...records1, ...records2].filter(m => {
      const id = m.key?.id || m.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    }).sort((a, b) => (a.messageTimestamp || 0) - (b.messageTimestamp || 0));

    if (all.length > 0) {
      return res.json(all.map(m => ({
        id: m.key?.id || m.id,
        body: m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || `[${m.messageType || 'media'}]`,
        fromMe: m.key?.fromMe || false,
        pushName: m.pushName || '',
        messageType: m.messageType,
        timestamp: m.messageTimestamp,
        time: m.messageTimestamp ? new Date(m.messageTimestamp * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
        status: m.status,
      })));
    }
  } catch {}

  // DB fallback
  const local = db.prepare(`
    SELECT * FROM evolution_messages 
    WHERE instance_name=? AND (remote_jid=? OR remote_jid LIKE ?)
    ORDER BY timestamp ASC LIMIT 50
  `).all(req.params.name, jid, `%${phone}%`);
  res.json(local.map(m => ({ ...m, fromMe: !!m.from_me, time: new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) })));
});

// POST /api/evolution/instances/:name/send/text
router.post('/instances/:name/send/text', authMiddleware, async (req, res) => {
  const { number, text, quotedMsgId } = req.body;
  if (!number || !text) return res.status(400).json({ error: 'number and text required' });
  try {
    const result = await sendText(req.params.name, number, text, quotedMsgId);
    // Save to DB
    const jid = number.includes('@') ? number : `${number}@s.whatsapp.net`;
    db.prepare('INSERT OR IGNORE INTO evolution_messages (id,instance_name,remote_jid,message_id,body,from_me,message_type,timestamp) VALUES (?,?,?,?,?,1,?,?)')
      .run(uuid(), req.params.name, jid, result?.key?.id || uuid(), text, 'text', Date.now());
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/evolution/instances/:name/send/media
router.post('/instances/:name/send/media', authMiddleware, async (req, res) => {
  const { number, mediaUrl, caption, mediaType } = req.body;
  try { res.json(await sendMedia(req.params.name, number, mediaUrl, caption, mediaType)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/evolution/instances/:name/send/reaction
router.post('/instances/:name/send/reaction', authMiddleware, async (req, res) => {
  const { remoteJid, msgId, reaction } = req.body;
  try { res.json(await sendReaction(req.params.name, remoteJid, msgId, reaction)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/evolution/instances/:name/contacts/check
router.post('/instances/:name/contacts/check', authMiddleware, async (req, res) => {
  try { res.json(await checkNumber(req.params.name, req.body.numbers)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Webhook (public — Evolution API calls this) ───────────

// POST /api/evolution/webhook/:instanceName
router.post('/webhook/:instanceName', async (req, res) => {
  const { instanceName } = req.params;
  const { event, data } = req.body;
  res.status(200).json({ status: 'ok' }); // Respond immediately
  if (event && data) await handleWebhook(instanceName, event, data);
});

export default router;

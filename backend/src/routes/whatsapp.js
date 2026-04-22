import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { initWhatsApp, getStatus, getQR, getClient, disconnectWhatsApp, sendMessage, sendSeen, sendTyping, pinChat, archiveChat, markUnread } from '../whatsapp/client.js';
import { fetchChatMessages, fetchAllChats } from '../whatsapp/chatHelper.js';

const router = Router();

// ── Connection ────────────────────────────────────────────

// GET /api/whatsapp/status
router.get('/status', authMiddleware, adminOnly, async (req, res) => {
  res.json({ status: getStatus(), qr: getQR() });
});

// POST /api/whatsapp/connect
router.post('/connect', authMiddleware, adminOnly, async (req, res) => {
  initWhatsApp();
  res.json({ message: 'WhatsApp initializing...' });
});

// POST /api/whatsapp/disconnect
router.post('/disconnect', authMiddleware, adminOnly, async (req, res) => {
  await disconnectWhatsApp();
  res.json({ message: 'Disconnected' });
});

// ── Messages ──────────────────────────────────────────────

// POST /api/whatsapp/send
router.post('/send', authMiddleware, adminOnly, async (req, res) => {
  const { phone, message, mediaUrl, caption } = req.body;
  if (!phone || (!message && !mediaUrl)) return res.status(400).json({ error: 'phone and message/mediaUrl required' });
  try {
    await sendMessage(phone, message, mediaUrl, caption);
    res.json({ message: 'Sent' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/whatsapp/messages/:phone/clear — clear chat history from DB
router.delete('/messages/:phone/clear', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM whatsapp_messages WHERE from_phone = ? OR to_phone = ?').run(decodeURIComponent(req.params.phone), decodeURIComponent(req.params.phone));
  res.json({ message: 'Cleared' });
});

// GET /api/whatsapp/messages/:phone
router.get('/messages/:phone', authMiddleware, adminOnly, async (req, res) => {
  const msgs = await db.prepare('SELECT * FROM whatsapp_messages WHERE from_phone = ? OR to_phone = ? ORDER BY created_at ASC')
    .all(req.params.phone, req.params.phone);
  res.json(msgs);
});

// GET /api/whatsapp/chats — real chats from WhatsApp
router.get('/chats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const chats = await fetchAllChats(30);
    res.json(chats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/whatsapp/chats/:chatId/messages — real messages
router.get('/chats/:chatId/messages', authMiddleware, adminOnly, async (req, res) => {
  try {
    const messages = await fetchChatMessages(decodeURIComponent(req.params.chatId), 50);
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/whatsapp/messages/:phone/read
router.put('/messages/:phone/read', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare("UPDATE whatsapp_messages SET is_read = 1 WHERE from_phone = ? AND direction = 'incoming'").run(req.params.phone);
  res.json({ message: 'Marked read' });
});

// GET /api/whatsapp/contact/:phone — get contact info
router.get('/contact/:phone', authMiddleware, adminOnly, async (req, res) => {
  const client = getClient();
  if (!client) return res.json({});
  try {
    const contact = await client.getContactById(decodeURIComponent(req.params.phone));
    const [profilePic, about, formattedNumber] = await Promise.all([
      contact.getProfilePicUrl().catch(() => null),
      contact.getAbout().catch(() => null),
      contact.getFormattedNumber().catch(() => null),
    ]);
    res.json({
      name: contact.name || contact.pushname,
      pushname: contact.pushname,
      number: contact.number,
      formattedNumber,
      profilePic,
      about,
      isBusiness: contact.isBusiness,
      isBlocked: contact.isBlocked,
      isMyContact: contact.isMyContact,
    });
  } catch (e) { res.json({}); }
});

// ── Chat Actions ──────────────────────────────────────────

// POST /api/whatsapp/chats/:chatId/seen
router.post('/chats/:chatId/seen', authMiddleware, adminOnly, async (req, res) => {
  await sendSeen(decodeURIComponent(req.params.chatId));
  res.json({ message: 'Seen' });
});

// POST /api/whatsapp/chats/:chatId/typing
router.post('/chats/:chatId/typing', authMiddleware, adminOnly, async (req, res) => {
  await sendTyping(decodeURIComponent(req.params.chatId), req.body.typing !== false);
  res.json({ message: 'OK' });
});

// PUT /api/whatsapp/chats/:chatId/pin
router.put('/chats/:chatId/pin', authMiddleware, adminOnly, async (req, res) => {
  await pinChat(decodeURIComponent(req.params.chatId), req.body.pin !== false);
  res.json({ message: 'OK' });
});

// PUT /api/whatsapp/chats/:chatId/archive
router.put('/chats/:chatId/archive', authMiddleware, adminOnly, async (req, res) => {
  await archiveChat(decodeURIComponent(req.params.chatId), req.body.archive !== false);
  res.json({ message: 'OK' });
});

// POST /api/whatsapp/message/:msgId/react
router.post('/message/:msgId/react', authMiddleware, adminOnly, async (req, res) => {
  const client = getClient();
  if (!client) return res.status(400).json({ error: 'Not connected' });
  try {
    const msg = await client.getMessageById(req.params.msgId);
    await msg.react(req.body.emoji || '');
    res.json({ message: 'Reacted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/whatsapp/message/:msgId
router.delete('/message/:msgId', authMiddleware, adminOnly, async (req, res) => {
  const client = getClient();
  if (!client) return res.status(400).json({ error: 'Not connected' });
  try {
    const msg = await client.getMessageById(req.params.msgId);
    await msg.delete(req.body.everyone === true);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/whatsapp/message/:msgId/star
router.post('/message/:msgId/star', authMiddleware, adminOnly, async (req, res) => {
  const client = getClient();
  if (!client) return res.status(400).json({ error: 'Not connected' });
  try {
    const msg = await client.getMessageById(req.params.msgId);
    req.body.star ? await msg.star() : await msg.unstar();
    res.json({ message: 'OK' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/whatsapp/message/:msgId/forward
router.post('/message/:msgId/forward', authMiddleware, adminOnly, async (req, res) => {
  const client = getClient();
  if (!client) return res.status(400).json({ error: 'Not connected' });
  try {
    const msg = await client.getMessageById(req.params.msgId);
    await msg.forward(req.body.chatId);
    res.json({ message: 'Forwarded' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Auto-reply Rules ──────────────────────────────────────

// GET /api/whatsapp/rules
router.get('/rules', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM whatsapp_rules ORDER BY created_at ASC').all()
    .then(rows => (rows || []).map(r => ({ ...r, keywords: JSON.parse(r.keywords), is_active: !!r.is_active }))));
});

// POST /api/whatsapp/rules
router.post('/rules', authMiddleware, adminOnly, async (req, res) => {
  const { name, keywords, response_template, type } = req.body;
  const id = uuid();
  await db.prepare('INSERT INTO whatsapp_rules (id, name, keywords, response_template, type) VALUES (?, ?, ?, ?, ?)')
    .run(id, name, JSON.stringify(keywords), response_template, type || 'custom');
  res.status(201).json({ id });
});

// PUT /api/whatsapp/rules/:id
router.put('/rules/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, keywords, response_template, type, is_active } = req.body;
  await db.prepare('UPDATE whatsapp_rules SET name=?, keywords=?, response_template=?, type=?, is_active=? WHERE id=?')
    .run(name, JSON.stringify(keywords), response_template, type, is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/whatsapp/rules/:id
router.delete('/rules/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM whatsapp_rules WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── Simulate ──────────────────────────────────────────────

// POST /api/whatsapp/simulate
router.post('/simulate', authMiddleware, adminOnly, async (req, res) => {
  const { message } = req.body;
  const rules = await db.prepare('SELECT * FROM whatsapp_rules WHERE is_active = 1').all()
    .then(rows => (rows || []).map(r => ({ ...r, keywords: JSON.parse(r.keywords) })));

  const msgLower = message.toLowerCase();
  const matched = rules.find(r => r.keywords.some(k => msgLower.includes(k.toLowerCase())));
  if (!matched) return res.json({ matched: false, reply: 'Koi matching rule nahi mili.' });

  let reply = matched.response_template;
  const products = await db.prepare('SELECT * FROM products').all()
    .then(rows => rows || []);
  const product = products.find(p =>
    msgLower.includes(p.name.toLowerCase()) ||
    (p.name_hi && msgLower.includes(p.name_hi.toLowerCase()))
  );

  if (product) {
    reply = reply
      .replace(/{{product_name}}/g, product.name)
      .replace(/{{price}}/g, `₹${product.price}`)
      .replace(/{{original_price_info}}/g, product.original_price ? `(MRP: ₹${product.original_price})` : '')
      .replace(/{{slug}}/g, product.slug)
      .replace(/{{stock_status}}/g, product.in_stock ? 'उपलब्ध ✅' : 'Out of Stock ❌')
      .replace(/{{stock_info}}/g, `Stock: ${product.stock} units`);
  }
  reply = reply.replace(/{{[^}]+}}/g, '[N/A]');
  await db.prepare('UPDATE whatsapp_rules SET match_count = match_count + 1 WHERE id = ?').run(matched.id);

  res.json({ matched: true, rule: matched.name, reply });
});

// ── Analytics ─────────────────────────────────────────────

// GET /api/whatsapp/analytics
router.get('/analytics', authMiddleware, adminOnly, async (req, res) => {
  const totalMessages = await db.prepare('SELECT COUNT(*) as val FROM whatsapp_messages').get().val;
  const botReplies = await db.prepare("SELECT COUNT(*) as val FROM whatsapp_messages WHERE from_phone = 'bot'").get().val;
  const totalContacts = await db.prepare("SELECT COUNT(DISTINCT from_phone) as val FROM whatsapp_messages WHERE direction = 'incoming'").get().val;
  const unread = await db.prepare("SELECT COUNT(*) as val FROM whatsapp_messages WHERE is_read = 0 AND direction = 'incoming'").get().val;
  const topRules = await db.prepare('SELECT name, match_count FROM whatsapp_rules ORDER BY match_count DESC LIMIT 5').all()
    .then(rows => rows || []);
  res.json({ totalMessages, botReplies, totalContacts, unread, topRules });
});

export default router;

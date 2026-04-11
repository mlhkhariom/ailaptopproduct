import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/whatsapp/rules — admin
router.get('/rules', authMiddleware, adminOnly, (req, res) => {
  res.json(db.prepare('SELECT * FROM whatsapp_rules ORDER BY created_at ASC').all()
    .map(r => ({ ...r, keywords: JSON.parse(r.keywords), is_active: !!r.is_active })));
});

// POST /api/whatsapp/rules — admin
router.post('/rules', authMiddleware, adminOnly, (req, res) => {
  const { name, keywords, response_template, type } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO whatsapp_rules (id, name, keywords, response_template, type) VALUES (?, ?, ?, ?, ?)').run(id, name, JSON.stringify(keywords), response_template, type || 'custom');
  res.status(201).json({ id });
});

// PUT /api/whatsapp/rules/:id — admin
router.put('/rules/:id', authMiddleware, adminOnly, (req, res) => {
  const { name, keywords, response_template, type, is_active } = req.body;
  db.prepare('UPDATE whatsapp_rules SET name=?, keywords=?, response_template=?, type=?, is_active=? WHERE id=?')
    .run(name, JSON.stringify(keywords), response_template, type, is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/whatsapp/rules/:id — admin
router.delete('/rules/:id', authMiddleware, adminOnly, (req, res) => {
  db.prepare('DELETE FROM whatsapp_rules WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// POST /api/whatsapp/simulate — test auto-reply
router.post('/simulate', authMiddleware, adminOnly, (req, res) => {
  const { message } = req.body;
  const rules = db.prepare('SELECT * FROM whatsapp_rules WHERE is_active = 1').all()
    .map(r => ({ ...r, keywords: JSON.parse(r.keywords) }));

  const msgLower = message.toLowerCase();
  const matched = rules.find(r => r.keywords.some(k => msgLower.includes(k.toLowerCase())));

  if (!matched) return res.json({ matched: false, reply: 'Koi matching rule nahi mili.' });

  // Replace product variables
  let reply = matched.response_template;
  const products = db.prepare('SELECT * FROM products WHERE in_stock = 1').all();
  const product = products.find(p => msgLower.includes(p.name.toLowerCase()) || (p.name_hi && msgLower.includes(p.name_hi)));

  if (product) {
    reply = reply
      .replace(/{{product_name}}/g, product.name)
      .replace(/{{price}}/g, product.price)
      .replace(/{{original_price_info}}/g, product.original_price ? `(MRP: ₹${product.original_price})` : '')
      .replace(/{{slug}}/g, product.slug)
      .replace(/{{stock_status}}/g, product.in_stock ? 'उपलब्ध ✅' : 'Out of Stock ❌')
      .replace(/{{stock_info}}/g, `Stock: ${product.stock} units`);
  }
  reply = reply.replace(/{{[^}]+}}/g, '[N/A]');

  // Increment match count
  db.prepare('UPDATE whatsapp_rules SET match_count = match_count + 1 WHERE id = ?').run(matched.id);

  res.json({ matched: true, rule: matched.name, reply });
});

// POST /api/whatsapp/webhook — Meta WhatsApp webhook
router.get('/webhook', (req, res) => {
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) return res.send(challenge);
  res.sendStatus(403);
});

router.post('/webhook', (req, res) => {
  // Handle incoming WhatsApp messages (Meta Cloud API)
  const entry = req.body?.entry?.[0];
  const msg = entry?.changes?.[0]?.value?.messages?.[0];
  if (msg?.type === 'text') {
    // Auto-reply logic can be triggered here
    console.log('WhatsApp message received:', msg.from, msg.text.body);
  }
  res.sendStatus(200);
});

export default router;

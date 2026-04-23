import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly, superAdminOnly } from '../middleware/adminOnly.js';
import { getAgentSettings, fetchAvailableModels } from '../ai/agent.js';

const router = Router();

// GET /api/ai/settings
router.get('/settings', authMiddleware, adminOnly, async (req, res) => {
  const s = await getAgentSettings();
  if (s.api_key) s.api_key = s.api_key.replace(/.(?=.{6})/g, '*');
  res.json(s);
});

// PUT /api/ai/settings — superadmin can edit system_prompt + api_key, admin can toggle features
router.put('/settings', authMiddleware, adminOnly, async (req, res) => {
  const isSuperAdmin = req.user.role === 'superadmin';
  const current = await db.prepare('SELECT * FROM ai_agent_settings WHERE id = ?').get('main');
  const body = req.body;

  // Only superadmin can change api_key and system_prompt
  const update = {
    enabled: body.enabled !== undefined ? (body.enabled ? 1 : 0) : current.enabled,
    llm_provider: isSuperAdmin ? (body.llm_provider || current.llm_provider) : current.llm_provider,
    llm_model: isSuperAdmin ? (body.llm_model || current.llm_model) : current.llm_model,
    api_key: isSuperAdmin && body.api_key && !body.api_key.includes('*') ? body.api_key : current.api_key,
    system_prompt: isSuperAdmin ? (body.system_prompt || current.system_prompt) : current.system_prompt,
    temperature: body.temperature !== undefined ? body.temperature : current.temperature,
    max_tokens: body.max_tokens || current.max_tokens,
    memory_messages: body.memory_messages || current.memory_messages,
    reply_delay_min: body.reply_delay_min !== undefined ? body.reply_delay_min : current.reply_delay_min,
    reply_delay_max: body.reply_delay_max !== undefined ? body.reply_delay_max : current.reply_delay_max,
    feature_product_search: body.feature_product_search !== undefined ? (body.feature_product_search ? 1 : 0) : current.feature_product_search,
    feature_order_status: body.feature_order_status !== undefined ? (body.feature_order_status ? 1 : 0) : current.feature_order_status,
    feature_greeting: body.feature_greeting !== undefined ? (body.feature_greeting ? 1 : 0) : current.feature_greeting,
    feature_faq: body.feature_faq !== undefined ? (body.feature_faq ? 1 : 0) : current.feature_faq,
    feature_human_handoff: body.feature_human_handoff !== undefined ? (body.feature_human_handoff ? 1 : 0) : current.feature_human_handoff,
    feature_typing_indicator: body.feature_typing_indicator !== undefined ? (body.feature_typing_indicator ? 1 : 0) : current.feature_typing_indicator,
    feature_cart_suggest: body.feature_cart_suggest !== undefined ? (body.feature_cart_suggest ? 1 : 0) : current.feature_cart_suggest,
    fallback_message: body.fallback_message || current.fallback_message,
    agent_bubble_color: body.agent_bubble_color || current.agent_bubble_color,
    daily_limit: body.daily_limit || current.daily_limit,
    business_hours_enabled: body.business_hours_enabled !== undefined ? (body.business_hours_enabled ? 1 : 0) : current.business_hours_enabled,
    business_hours_start: body.business_hours_start || current.business_hours_start,
    business_hours_end: body.business_hours_end || current.business_hours_end,
  };

  await db.prepare(`UPDATE ai_agent_settings SET
    enabled=?, llm_provider=?, llm_model=?, api_key=?, system_prompt=?,
    temperature=?, max_tokens=?, memory_messages=?, reply_delay_min=?, reply_delay_max=?,
    feature_product_search=?, feature_order_status=?, feature_greeting=?, feature_faq=?,
    feature_human_handoff=?, feature_typing_indicator=?, feature_cart_suggest=?,
    fallback_message=?, agent_bubble_color=?, daily_limit=?,
    business_hours_enabled=?, business_hours_start=?, business_hours_end=?
    WHERE id='main'`).run(
    update.enabled, update.llm_provider, update.llm_model, update.api_key, update.system_prompt,
    update.temperature, update.max_tokens, update.memory_messages, update.reply_delay_min, update.reply_delay_max,
    update.feature_product_search, update.feature_order_status, update.feature_greeting, update.feature_faq,
    update.feature_human_handoff, update.feature_typing_indicator, update.feature_cart_suggest,
    update.fallback_message, update.agent_bubble_color, update.daily_limit,
    update.business_hours_enabled, update.business_hours_start, update.business_hours_end
  );
  res.json({ message: 'Settings saved' });
});

// GET /api/ai/models?provider=openrouter&key=xxx
router.get('/models', authMiddleware, adminOnly, async (req, res) => {
  const { provider, key } = req.query;
  if (!provider || !key) return res.status(400).json({ error: 'provider and key required' });
  try {
    const models = await fetchAvailableModels(provider, key);
    res.json(models);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/ai/contact/:contactId — get per-contact agent setting
router.get('/contact/:contactId', authMiddleware, adminOnly, async (req, res) => {
  const row = await db.prepare('SELECT agent_enabled FROM ai_agent_contact_settings WHERE contact_id = ?').get(req.params.contactId);
  res.json({ agent_enabled: row ? !!row.agent_enabled : true });
});

// PUT /api/ai/contact/:contactId — toggle agent for contact
router.put('/contact/:contactId', authMiddleware, adminOnly, async (req, res) => {
  const { agent_enabled } = req.body;
  await db.prepare('INSERT INTO ai_agent_contact_settings (contact_id, agent_enabled) VALUES (?,?) ON CONFLICT(contact_id) DO UPDATE SET agent_enabled=?')
    .run(req.params.contactId, agent_enabled ? 1 : 0, agent_enabled ? 1 : 0);
  res.json({ message: 'Updated' });
});

// GET /api/ai/memory/:contactId
router.get('/memory/:contactId', authMiddleware, adminOnly, async (req, res) => {
  const msgs = await db.prepare('SELECT role, content, created_at FROM ai_conversation_memory WHERE contact_id = ? ORDER BY created_at DESC LIMIT 20').all(req.params.contactId);
  res.json(msgs.reverse());
});

// DELETE /api/ai/memory/:contactId — clear memory
router.delete('/memory/:contactId', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM ai_conversation_memory WHERE contact_id = ?').run(req.params.contactId);
  res.json({ message: 'Memory cleared' });
});

// POST /api/ai/test — test agent with a message
router.post('/test', authMiddleware, adminOnly, async (req, res) => {
  const { message } = req.body;
  const { processAgentMessage } = await import('../ai/agent.js');
  try {
    const result = await processAgentMessage('test-contact', 'Test User', message || 'Hello');
    res.json(result || { reply: 'Agent is disabled or not configured' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;

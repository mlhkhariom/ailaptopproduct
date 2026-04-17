import db from '../db/database.js';
import { v4 as uuid } from 'uuid';

// ── Get settings ──────────────────────────────────────────
export const getAgentSettings = () => {
  return db.prepare('SELECT * FROM ai_agent_settings WHERE id = ?').get('main') || {};
};

// ── Check if agent enabled for contact ───────────────────
export const isAgentEnabledForContact = (contactId) => {
  const s = getAgentSettings();
  if (!s.enabled) return false;
  const contactSetting = db.prepare('SELECT agent_enabled FROM ai_agent_contact_settings WHERE contact_id = ?').get(contactId);
  if (contactSetting) return !!contactSetting.agent_enabled;
  return true; // default enabled
};

// ── Business hours check ──────────────────────────────────
const isWithinBusinessHours = (s) => {
  if (!s.business_hours_enabled) return true;
  const now = new Date();
  const [sh, sm] = s.business_hours_start.split(':').map(Number);
  const [eh, em] = s.business_hours_end.split(':').map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= sh * 60 + sm && cur <= eh * 60 + em;
};

// ── Daily limit check ─────────────────────────────────────
const checkDailyLimit = (contactId, limit) => {
  const today = new Date().toISOString().split('T')[0];
  const row = db.prepare('SELECT count FROM ai_daily_count WHERE contact_id = ? AND date = ?').get(contactId, today);
  return !row || row.count < limit;
};

const incrementDailyCount = (contactId) => {
  const today = new Date().toISOString().split('T')[0];
  db.prepare('INSERT INTO ai_daily_count (contact_id, date, count) VALUES (?,?,1) ON CONFLICT(contact_id,date) DO UPDATE SET count=count+1').run(contactId, today);
};

// ── Memory management ─────────────────────────────────────
const getMemory = (contactId, limit = 20) => {
  return db.prepare('SELECT role, content FROM ai_conversation_memory WHERE contact_id = ? ORDER BY created_at DESC LIMIT ?').all(contactId, limit).reverse();
};

const saveMemory = (contactId, role, content) => {
  db.prepare('INSERT INTO ai_conversation_memory (id, contact_id, role, content) VALUES (?,?,?,?)').run(uuid(), contactId, role, content);
  // Keep only last 50 messages per contact
  db.prepare('DELETE FROM ai_conversation_memory WHERE contact_id = ? AND id NOT IN (SELECT id FROM ai_conversation_memory WHERE contact_id = ? ORDER BY created_at DESC LIMIT 50)').run(contactId, contactId);
};

// ── Product search ────────────────────────────────────────
const searchProducts = (query) => {
  const q = `%${query}%`;
  return db.prepare('SELECT name, price, original_price, description, slug, in_stock, stock FROM products WHERE (name LIKE ? OR name_hi LIKE ? OR description LIKE ?) AND status = ? LIMIT 3').all(q, q, q, 'active');
};

// ── Order lookup ──────────────────────────────────────────
const lookupOrder = (query) => {
  return db.prepare('SELECT order_number, status, total, tracking_id, courier, created_at FROM orders WHERE order_number LIKE ? LIMIT 1').get(`%${query}%`);
};

// ── Build context for LLM ─────────────────────────────────
const buildContext = (s, message, contactId) => {
  const parts = [];

  // Product search context
  if (s.feature_product_search) {
    const products = searchProducts(message);
    if (products.length > 0) {
      parts.push('AVAILABLE PRODUCTS:\n' + products.map(p =>
        `- ${p.name}: ₹${p.price}${p.original_price ? ` (MRP: ₹${p.original_price})` : ''} | ${p.in_stock ? `In Stock (${p.stock} units)` : 'Out of Stock'} | ${p.description?.slice(0, 100)}`
      ).join('\n'));
    }
  }

  // Order status context
  if (s.feature_order_status) {
    const orderMatch = message.match(/APC-\d+/i) || message.match(/order\s*#?\s*(\w+)/i);
    if (orderMatch) {
      const order = lookupOrder(orderMatch[0]);
      if (order) {
        parts.push(`ORDER INFO: ${order.order_number} | Status: ${order.status} | Total: ₹${order.total}${order.tracking_id ? ` | Tracking: ${order.tracking_id} via ${order.courier}` : ''}`);
      }
    }
  }

  return parts.join('\n\n');
};

// ── Call LLM ──────────────────────────────────────────────
const callLLM = async (s, messages) => {
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${s.api_key}` };
  const body = { model: s.llm_model, messages, temperature: s.temperature, max_tokens: s.max_tokens };

  let url = 'https://openrouter.ai/api/v1/chat/completions';
  if (s.llm_provider === 'gemini') {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${s.llm_model}:generateContent?key=${s.api_key}`;
    // Gemini format
    const geminiBody = {
      contents: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      systemInstruction: { parts: [{ text: messages.find(m => m.role === 'system')?.content || '' }] },
      generationConfig: { temperature: s.temperature, maxOutputTokens: s.max_tokens },
    };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiBody) });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  if (s.llm_provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://ailaptopwala.com';
    headers['X-Title'] = 'AI Laptop Wala';
  }

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok || data.error) {
    const errMsg = data.error?.message || data.error || JSON.stringify(data).slice(0, 200);
    console.error('LLM full error:', JSON.stringify(data).slice(0, 500));
    throw new Error(`${s.llm_provider} error: ${errMsg}`);
  }
  return data.choices?.[0]?.message?.content || '';
};

// ── Main agent function ───────────────────────────────────
export const processAgentMessage = async (contactId, contactName, message) => {
  const s = getAgentSettings();

  console.log(`🤖 Agent check: enabled=${s.enabled}, api_key=${s.api_key?.length > 0}, businessHours=${isWithinBusinessHours(s)}, dailyLimit=${checkDailyLimit(contactId, s.daily_limit)}, contactEnabled=${isAgentEnabledForContact(contactId)}`);

  // Checks
  if (!isAgentEnabledForContact(contactId)) { console.log('🤖 Skipped: contact disabled'); return null; }
  if (!isWithinBusinessHours(s)) { console.log('🤖 Skipped: outside business hours'); return null; }
  if (!checkDailyLimit(contactId, s.daily_limit)) { console.log('🤖 Skipped: daily limit reached'); return null; }
  if (!s.api_key) { console.log('🤖 Skipped: no api key'); return null; }

  // Human handoff check
  if (s.feature_human_handoff) {
    const handoffKeywords = ['human', 'agent', 'person', 'staff', 'manager', 'insaan', 'banda', 'koi insaan'];
    if (handoffKeywords.some(k => message.toLowerCase().includes(k))) {
      return { reply: '🙋 I\'ll connect you with our team shortly. Please wait a moment.', isHandoff: true };
    }
  }

  // Build context
  const context = buildContext(s, message, contactId);

  // Get memory
  const memory = getMemory(contactId, s.memory_messages);

  // Build messages array
  const systemPrompt = s.system_prompt + (context ? `\n\nCURRENT CONTEXT:\n${context}` : '');
  const messages = [
    { role: 'system', content: systemPrompt },
    ...memory,
    { role: 'user', content: message },
  ];

  // Save user message to memory
  saveMemory(contactId, 'user', message);

  // Call LLM
  const reply = await callLLM(s, messages);

  // Save reply to memory
  saveMemory(contactId, 'assistant', reply);

  // Increment daily count
  incrementDailyCount(contactId);

  return { reply, isAI: true };
};

// ── Fetch available models ────────────────────────────────
export const fetchAvailableModels = async (provider, apiKey) => {
  if (provider === 'openrouter') {
    const res = await fetch('https://openrouter.ai/api/v1/models', { headers: { Authorization: `Bearer ${apiKey}` } });
    const data = await res.json();
    return (data.data || []).map(m => ({ id: m.id, name: m.name || m.id })).slice(0, 50);
  }
  if (provider === 'gemini') {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    return (data.models || []).filter(m => m.name.includes('gemini')).map(m => ({ id: m.name.replace('models/', ''), name: m.displayName || m.name }));
  }
  return [];
};

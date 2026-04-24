import db from '../db/database.js';
import { v4 as uuid } from 'uuid';

// ── Get settings ──────────────────────────────────────────
export const getAgentSettings = async () => {
  return await db.prepare('SELECT * FROM ai_agent_settings WHERE id = ?').get('main') || {};
};

// ── Create order + payment link ───────────────────────────
export const createOrderWithPaymentLink = async (contactPhone, productId, customerName) => {
  const product = await db.prepare('SELECT * FROM products WHERE id=? OR slug=?').get(productId, productId);
  if (!product) return null;

  const order_number = 'ALW-' + Date.now().toString().slice(-6);
  const orderId = uuid();
  const phone = contactPhone.replace('@c.us', '').replace(/[^0-9]/g, '');

  // Create order
  await db.prepare(`INSERT INTO orders (id,order_number,items,subtotal,total,payment_method,payment_status,address) VALUES (?,?,?,?,?,'razorpay','pending','{}')`)
    .run(orderId, order_number, JSON.stringify([{ id: product.id, name: product.name, quantity: 1, price: product.price }]), product.price, product.price);

  // Create Razorpay payment link
  const keyId = await db.prepare("SELECT value FROM app_settings WHERE key='razorpay_key_id'").get()?.value;
  const keySecret = await db.prepare("SELECT value FROM app_settings WHERE key='razorpay_key_secret'").get()?.value;

  if (!keyId || !keySecret) {
    return { order_number, product, payment_link: null, message: `Order ${order_number} created! Pay ₹${product.price.toLocaleString('en-IN')} via UPI/Cash on delivery.\n\nTrack: ailaptopwala.com/track-order?order=${order_number}` };
  }

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
      body: JSON.stringify({
        amount: Math.round(product.price * 100),
        currency: 'INR',
        description: `${product.name} - AI Laptop Wala`,
        customer: { name: customerName || 'Customer', contact: phone },
        notify: { sms: true },
        notes: { order_number, product_id: product.id, source: 'whatsapp_agent' },
        callback_url: `https://ailaptopwala.com/order-success?order=${order_number}`,
      }),
    });
    const data = await res.json();
    const payLink = data.short_url || null;

    if (payLink) {
      await db.prepare("UPDATE orders SET payment_status='link_sent' WHERE id=?").run(orderId);
    }

    return { order_number, product, payment_link: payLink };
  } catch {
    return { order_number, product, payment_link: null };
  }
};

// ── Check if agent enabled for contact ───────────────────
export const isAgentEnabledForContact = async (contactId) => {
  const s = await getAgentSettings();
  if (!s.enabled) return false;
  const contactSetting = await db.prepare('SELECT agent_enabled FROM ai_agent_contact_settings WHERE contact_id = ?').get(contactId);
  if (contactSetting) return !!contactSetting.agent_enabled;
  return true; // default enabled
};

// ── Business hours check ──────────────────────────────────
const isWithinBusinessHours = async (s) => {
  if (!s.business_hours_enabled) return true;
  const now = new Date();
  const [sh, sm] = s.business_hours_start.split(':').map(Number);
  const [eh, em] = s.business_hours_end.split(':').map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= sh * 60 + sm && cur <= eh * 60 + em;
};

// ── Daily limit check ─────────────────────────────────────
const checkDailyLimit = async (contactId, limit) => {
  const today = new Date().toISOString().split('T')[0];
  const row = await db.prepare('SELECT count FROM ai_daily_count WHERE contact_id = ? AND date = ?').get(contactId, today);
  return !row || row.count < limit;
};

const incrementDailyCount = async (contactId) => {
  const today = new Date().toISOString().split('T')[0];
  await db.prepare('INSERT INTO ai_daily_count (contact_id, date, count) VALUES (?,?,1) ON CONFLICT(contact_id,date) DO UPDATE SET count=ai_daily_count.count+1').run(contactId, today);
};

// ── Memory management ─────────────────────────────────────
const getMemory = async (contactId, limit = 20) => {
  const rows = await db.prepare('SELECT role, content FROM ai_conversation_memory WHERE contact_id = ? ORDER BY created_at DESC LIMIT ?').all(contactId, limit);
  return (rows || []).reverse();
};

const saveMemory = async (contactId, role, content) => {
  await db.prepare('INSERT INTO ai_conversation_memory (id, contact_id, role, content) VALUES (?,?,?,?)').run(uuid(), contactId, role, content);
  // Keep only last 50 messages per contact
  await db.prepare('DELETE FROM ai_conversation_memory WHERE contact_id = ? AND id NOT IN (SELECT id FROM ai_conversation_memory WHERE contact_id = ? ORDER BY created_at DESC LIMIT 50)').run(contactId, contactId);
};

// ── Product search ────────────────────────────────────────
const searchProducts = async (query) => {
  const stopWords = ['ka', 'ki', 'ke', 'hai', 'kya', 'mujhe', 'chahiye', 'price', 'kitna', 'karo', 'do', 'the', 'is', 'are', 'what', 'how', 'much', 'cost', 'rate', 'bata', 'batao'];
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));

  const fullQ = `%${query}%`;
  const full = await db.prepare("SELECT name, price, original_price, description, slug, in_stock, stock, id, image FROM products WHERE (name ILIKE ? OR description ILIKE ?) AND status='active' LIMIT 3").all(fullQ, fullQ);
  if (full.length > 0) return full;

  for (const word of words) {
    const q = `%${word}%`;
    const results = await db.prepare("SELECT name, price, original_price, description, slug, in_stock, stock, id, image FROM products WHERE (name ILIKE ? OR description ILIKE ? OR category ILIKE ?) AND status='active' LIMIT 3").all(q, q, q);
    if (results.length > 0) return results;
  }

  return await db.prepare("SELECT name, price, original_price, description, slug, in_stock, stock, id, image FROM products WHERE status='active' ORDER BY price ASC LIMIT 5").all();
};

// ── Services search ───────────────────────────────────────
const searchServices = async (query) => {
  const q = `%${query}%`;
  return await db.prepare('SELECT name, price, duration, description, category FROM services WHERE (name LIKE ? OR description LIKE ? OR category LIKE ?) AND is_active = 1 LIMIT 4').all(q, q, q);
};

// ── Order lookup ──────────────────────────────────────────
const lookupOrder = async (query) => {
  return await db.prepare('SELECT order_number, status, total, tracking_id, courier, created_at FROM orders WHERE order_number LIKE ? LIMIT 1').get(`%${query}%`);
};

// ── Booking intent detection ──────────────────────────────
const BOOKING_KEYWORDS = ['repair', 'fix', 'broken', 'screen', 'battery', 'keyboard', 'virus', 'slow', 'hang', 'book', 'service', 'thik', 'kharab', 'toot', 'band', 'nahi chal', 'booking', 'appointment', 'upgrade', 'ssd', 'ram'];
const isBookingIntent = (msg) => BOOKING_KEYWORDS.some(k => msg.toLowerCase().includes(k));

// ── Order/buy intent detection ────────────────────────────
const BUY_KEYWORDS = ['khareedna', 'kharidna', 'buy', 'order', 'purchase', 'lena', 'chahiye', 'price', 'kitna', 'available', 'stock', 'confirm', 'book karo', 'order karo', 'le lena'];
const isBuyIntent = (msg) => BUY_KEYWORDS.some(k => msg.toLowerCase().includes(k));

// ── Build context for LLM ─────────────────────────────────
const buildContext = async (s, message) => {
  const parts = [];

  // Product search
  if (s.feature_product_search) {
    const products = await searchProducts(message);
    if (products.length > 0) {
      parts.push('AVAILABLE PRODUCTS:\n' + products.map(p =>
        `- ${p.name}: ₹${p.price}${p.original_price ? ` (MRP: ₹${p.original_price})` : ''} | ${p.in_stock ? `In Stock (${p.stock})` : 'Out of Stock'} | ID: ${p.id} | Buy: https://ailaptopwala.com/products/${p.slug} | ${p.description?.slice(0, 60)}`
      ).join('\n'));
      if (isBuyIntent(message)) {
        parts.push('BUY INTENT DETECTED: Share the product buy link (https://ailaptopwala.com/products/[slug]) AND ask if they want WhatsApp order with payment link. Say: "Online order ke liye: [link] \nYa WhatsApp pe order ke liye Haan bolein, main payment link bhejta hoon 😊"');
      }
    }
  }

  // Services search
  if (isBookingIntent(message)) {
    const services = await searchServices(message);
    const allServices = services.length > 0 ? services : await db.prepare('SELECT name, price, duration FROM services WHERE is_active=1 LIMIT 6').all();
    if (allServices.length > 0) {
      parts.push('REPAIR SERVICES:\n' + allServices.map(s =>
        `- ${s.name}: ₹${s.price} | ${s.duration}`
      ).join('\n') + '\nBook at: ailaptopwala.com/services');
    }
  }

  // Order status
  if (s.feature_order_status) {
    const orderMatch = message.match(/ALW-\d+/i) || message.match(/APC-\d+/i) || message.match(/order[:\s#]*([A-Z0-9-]+)/i);
    if (orderMatch) {
      const order = await lookupOrder(orderMatch[1] || orderMatch[0]);
      if (order) {
        parts.push(`ORDER: ${order.order_number} | Status: ${order.status} | ₹${order.total}${order.tracking_id ? ` | Tracking: ${order.tracking_id} (${order.courier})` : ''}`);
      }
    }
  }

  return parts.join('\n\n');
};

// ── Call LLM with timeout + retry ────────────────────────
const callLLM = async (s, messages, retries = 2) => {
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${s.api_key}` };
  const body = { model: s.llm_model, messages, temperature: s.temperature || 0.7, max_tokens: s.max_tokens || 1024 };

  let url = 'https://openrouter.ai/api/v1/chat/completions';

  if (s.llm_provider === 'gemini') {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${s.llm_model}:generateContent?key=${s.api_key}`;
    const geminiBody = {
      contents: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      systemInstruction: { parts: [{ text: messages.find(m => m.role === 'system')?.content || '' }] },
      generationConfig: { temperature: s.temperature, maxOutputTokens: s.max_tokens },
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiBody), signal: controller.signal });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } finally { clearTimeout(timeout); }
  }

  if (s.llm_provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://ailaptopwala.com';
    headers['X-Title'] = 'AI Laptop Wala';
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout
    try {
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: controller.signal });
      const data = await res.json();
      if (!res.ok || data.error) {
        const errMsg = data.error?.message || data.error || JSON.stringify(data).slice(0, 200);
        console.error(`LLM error (attempt ${attempt + 1}):`, errMsg);
        if (attempt < retries) { await new Promise(r => setTimeout(r, 2000)); continue; }
        throw new Error(`${s.llm_provider} error: ${errMsg}`);
      }
      return data.choices?.[0]?.message?.content || '';
    } catch (e) {
      clearTimeout(timeout);
      if (e.name === 'AbortError') {
        console.error(`LLM timeout (attempt ${attempt + 1})`);
        if (attempt < retries) { await new Promise(r => setTimeout(r, 1000)); continue; }
        throw new Error('LLM request timed out after 20s');
      }
      if (attempt < retries && e.message.includes('fetch')) {
        console.error(`LLM fetch failed (attempt ${attempt + 1}), retrying...`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      throw e;
    } finally { clearTimeout(timeout); }
  }
};

// ── Main agent function ───────────────────────────────────
export const processAgentMessage = async (contactId, contactName, message) => {
  const s = await getAgentSettings();

  console.log(`🤖 Agent check: enabled=${s.enabled}, api_key=${s.api_key?.length > 0}`);

  // Checks
  if (!(await isAgentEnabledForContact(contactId))) { console.log('🤖 Skipped: contact disabled'); return null; }
  if (!(await isWithinBusinessHours(s))) { console.log('🤖 Skipped: outside business hours'); return null; }
  if (!(await checkDailyLimit(contactId, s.daily_limit))) { console.log('🤖 Skipped: daily limit reached'); return null; }
  if (!s.api_key) { console.log('🤖 Skipped: no api key'); return null; }

  // Human handoff check
  if (s.feature_human_handoff) {
    const handoffKeywords = ['human', 'agent', 'person', 'staff', 'manager', 'insaan', 'banda', 'koi insaan'];
    if (handoffKeywords.some(k => message.toLowerCase().includes(k))) {
      return { reply: '🙋 Hum aapko apni team se connect kar rahe hain. Thoda wait karein!', isHandoff: true };
    }
  }

  // ── ORDER CONFIRMATION FLOW ───────────────────────────────
  // Check if user is confirming an order from memory
  const confirmKeywords = ['haan', 'yes', 'ha', 'ok', 'okay', 'confirm', 'order karo', 'le lena', 'book karo', 'chahiye'];
  const isConfirming = confirmKeywords.some(k => message.toLowerCase().trim() === k || message.toLowerCase().includes(k));

  if (isConfirming) {
    // Check last AI message for pending order context
    const lastMsgs = await getMemory(contactId, 4);
    const lastAiMsg = [...lastMsgs].reverse().find(m => m.role === 'assistant');
    if (lastAiMsg?.content) {
      // Extract product ID from context if AI mentioned a product
      const productMatch = lastAiMsg.content.match(/ID:\s*([a-zA-Z0-9-]+)/);
      if (productMatch) {
        const productId = productMatch[1];
        console.log(`🛒 Creating order for product: ${productId}`);
        const result = await createOrderWithPaymentLink(contactId, productId, contactName);
        if (result) {
          let reply;
          if (result.payment_link) {
            reply = `✅ *Order Confirmed!*\n\n*Order ID:* ${result.order_number}\n*Product:* ${result.product.name}\n*Amount:* ₹${result.product.price.toLocaleString('en-IN')}\n\n💳 *Payment Link:*\n${result.payment_link}\n\nLink pe click karke payment karein. Payment hone ke baad WhatsApp pe confirmation milegi! 🎉\n\n📞 Help: +91 98934 96163`;
          } else {
            reply = `✅ *Order Confirmed!*\n\n*Order ID:* ${result.order_number}\n*Product:* ${result.product.name}\n*Amount:* ₹${result.product.price.toLocaleString('en-IN')}\n\nHamari team aapko payment details ke liye contact karegi.\n📞 +91 98934 96163\n\nTrack: ailaptopwala.com/track-order?order=${result.order_number}`;
          }
          await saveMemory(contactId, 'user', message);
          await saveMemory(contactId, 'assistant', reply);
          await incrementDailyCount(contactId);
          // Admin notification
          await db.prepare('INSERT INTO notifications (id,type,title,message,link) VALUES (?,?,?,?,?)').run(uuid(), 'order', '🛒 WhatsApp Order', `${contactName} ordered ${result.product.name} via WhatsApp`, '/admin/orders');
          return { reply, isAI: true, isOrder: true, order_number: result.order_number };
        }
      }
    }
  }

  // Build context
  const context = await buildContext(s, message);

  // Get memory
  const memory = await getMemory(contactId, s.memory_messages);

  // Build messages array
  const systemPrompt = s.system_prompt + (context ? `\n\nCURRENT CONTEXT:\n${context}` : '');
  const messages = [
    { role: 'system', content: systemPrompt },
    ...memory,
    { role: 'user', content: message },
  ];

  // Save user message to memory
  await saveMemory(contactId, 'user', message);

  // Call LLM
  const reply = await callLLM(s, messages);

  // Save reply to memory
  await saveMemory(contactId, 'assistant', reply);

  // Increment daily count
  await incrementDailyCount(contactId);

  // Send product images ONLY when user explicitly asks for photo/image
  let productImages = [];
  const imageKeywords = ['photo', 'image', 'pic', 'picture', 'foto', 'tasveer', 'dikhao', 'show me', 'dekho', 'dekha', 'दिखाओ', 'फोटो', 'तस्वीर'];
  const wantsImage = imageKeywords.some(k => message.toLowerCase().includes(k));
  if (s.feature_product_search && wantsImage) {
    const allProducts = await db.prepare("SELECT name, price, image, slug, in_stock FROM products WHERE status='active' AND image IS NOT NULL AND in_stock=1").all();
    
    // Extract product name from bold text in AI reply (**Product Name**)
    const boldMatches = reply.match(/\*\*([^*]+)\*\*/g)?.map(m => m.replace(/\*/g, '').trim()) || [];
    
    let matched = [];
    
    // Try exact/partial match with bold text first
    for (const boldName of boldMatches) {
      const exactMatch = (allProducts || []).find(p => 
        p.name.toLowerCase().includes(boldName.toLowerCase()) ||
        boldName.toLowerCase().includes(p.name.toLowerCase().split(' ').slice(0,3).join(' '))
      );
      if (exactMatch) { matched = [exactMatch]; break; }
    }
    
    // Fallback: score-based matching from reply
    if (matched.length === 0) {
      const searchIn = reply.toLowerCase();
      const scored = (allProducts || []).map(p => {
        const words = p.name.split(' ').filter(w => w.length > 3);
        const score = words.filter(w => searchIn.includes(w.toLowerCase())).length;
        return { ...p, score };
      }).filter(p => p.score >= 2).sort((a, b) => b.score - a.score);
      matched = scored.slice(0, 1);
    }

    productImages = matched.map(p => ({
      url: p.image.startsWith('http') ? p.image : `https://ailaptopwala.com${p.image}`,
      caption: `${p.name} — ₹${p.price.toLocaleString('en-IN')}`
    }));
    console.log(`📸 productImages: ${productImages.length} found (${matched.map(p=>p.name).join(', ')})`);
  }

  return { reply, isAI: true, productImages };
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

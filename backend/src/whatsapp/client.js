import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import db from '../db/database.js';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let client = null;
let qrCodeData = null;
let status = 'disconnected';
let io = null;

export const setIO = async (socketIO) => { io = socketIO; };
const emit = async (event, data) => { if (io) io.emit(event, data); };

// ── Auto-reply engine ─────────────────────────────────────
const processAutoReply = async (msg) => {
  const rules = await db.prepare('SELECT * FROM whatsapp_rules WHERE is_active = 1').all()
    .then(rows => (rows || []).map(r => ({ ...r, keywords: JSON.parse(r.keywords) })));
  const msgLower = msg.body.toLowerCase();
  const matched = rules.find(r => r.keywords.some(k => msgLower.includes(k.toLowerCase())));
  if (!matched) return;

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
  await msg.reply(reply);
  await db.prepare('UPDATE whatsapp_rules SET match_count = match_count + 1 WHERE id = ?').run(matched.id);
  // Save bot reply to DB
  await db.prepare("INSERT OR IGNORE INTO whatsapp_messages (id, from_phone, to_phone, body, direction) VALUES (?,?,?,?,?)")
    .run(uuid(), 'bot', msg.from, reply, 'outgoing');
};

// ── Init ──────────────────────────────────────────────────
export const initWhatsApp = async () => {
  if (client) return;
  status = 'initializing';
  emit('whatsapp:status', { status });
  let chatsLoaded = false;

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.resolve(__dirname, '../../../data/whatsapp-session') }),
    restartOnAuthFail: true,
    puppeteer: {
      headless: true,
      executablePath: '/usr/bin/google-chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--metrics-recording-only',
        '--mute-audio',
        '--safebrowsing-disable-auto-update',
        '--memory-pressure-off',
      ]
    }
  });

  client.on('qr', async (qr) => {
    status = 'qr';
    qrCodeData = await qrcode.toDataURL(qr);
    emit('whatsapp:qr', { qr: qrCodeData, status: 'qr' });
    console.log('📱 WhatsApp QR generated — scan to connect');
  });

  client.on('loading_screen', (percent) => {
    status = 'loading';
    emit('whatsapp:status', { status: 'loading', percent });
  });

  client.on('authenticated', () => {
    status = 'authenticated';
    qrCodeData = null;
    emit('whatsapp:status', { status: 'authenticated' });
    console.log('✅ WhatsApp authenticated');
  });

  client.once('ready', async () => {
    status = 'ready';
    qrCodeData = null;
    emit('whatsapp:status', { status: 'ready' });
    console.log('✅ WhatsApp ready!');
    if (chatsLoaded) return;
    chatsLoaded = true;
    setTimeout(async () => {
      try {
        const chats = await client.getChats();
        const chatList = [];
        for (const c of chats.slice(0, 25)) {
          try {
            let lastMsg = '', lastMsgTime = '';
            if (c.lastMessage) {
              lastMsg = c.lastMessage.body || `[${c.lastMessage.type}]`;
              lastMsgTime = new Date(c.lastMessage.timestamp * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            }
            chatList.push({ id: c.id._serialized, name: c.name || c.id.user, lastMsg, lastMsgTime, unread: c.unreadCount || 0, isGroup: c.isGroup });
          } catch {}
        }
        emit('whatsapp:chats', chatList);
        console.log(`✅ ${chatList.length} chats loaded`);
      } catch (e) { console.error('Error loading chats:', e.message); }
    }, 5000);
  });

  client.on('message', async (msg) => {
    if (msg.isStatus) return;
    const contact = await msg.getContact();
    let mediaData = null;

    if (msg.hasMedia) {
      try {
        const media = await msg.downloadMedia();
        if (media) mediaData = { mimetype: media.mimetype, data: media.data, filename: media.filename };
      } catch {}
    }

    const msgData = {
      id: msg.id._serialized,
      from: msg.from,
      fromName: contact.pushname || contact.name || msg.from.split('@')[0],
      body: msg.body,
      time: new Date(msg.timestamp * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      fromMe: false,
      type: msg.type,
      hasMedia: msg.hasMedia,
      media: mediaData,
    };
    emit('whatsapp:message', msgData);
    await db.prepare("INSERT OR IGNORE INTO whatsapp_messages (id, from_phone, to_phone, body, direction) VALUES (?,?,?,?,?)")
      .run(msg.id._serialized, msg.from, 'me', msg.body || `[${msg.type}]`, 'incoming');

    // AI Agent processing
    if (msg.body && msg.type === 'chat') {
      try {
        const { processAgentMessage, getAgentSettings } = await import('../ai/agent.js');
        const agentSettings = await getAgentSettings();

        console.log(`🤖 AI Agent: processing msg from ${msg.from}, enabled=${agentSettings.enabled}, api_key_len=${agentSettings.api_key?.length}`);

        const result = await processAgentMessage(msg.from, contact.pushname || contact.name || msg.from.split('@')[0], msg.body);

        console.log(`🤖 AI Agent result:`, result ? `reply="${result.reply?.slice(0,50)}..."` : 'null (skipped)');

        if (result?.reply) {
          // Typing indicator
          if (agentSettings.feature_typing_indicator) {
            try {
              const chat = await client.getChatById(msg.from);
              await chat.sendStateTyping();
            } catch {}
          }

          // Random delay (human feel)
          const delay = (agentSettings.reply_delay_min || 1) * 1000 +
            Math.random() * ((agentSettings.reply_delay_max || 3) - (agentSettings.reply_delay_min || 1)) * 1000;
          await new Promise(r => setTimeout(r, delay));

          // Stop typing
          if (agentSettings.feature_typing_indicator) {
            try {
              const chat = await client.getChatById(msg.from);
              await chat.clearState();
            } catch {}
          }

          // Send reply — use sendMessage (more reliable than msg.reply on reconnect)
          try {
            await client.sendMessage(msg.from, result.reply);
          } catch (sendErr) {
            console.error('AI Agent send error:', sendErr.message);
          }

          // Send product images if available
          if (result.productImages?.length > 0) {
            const { MessageMedia } = pkg;
            for (const img of result.productImages) {
              try {
                const media = await MessageMedia.fromUrl(img.url, { unsafeMime: true });
                await client.sendMessage(msg.from, media, { caption: img.caption });
              } catch {}
            }
          }

          // Save AI reply to DB
          await db.prepare("INSERT OR IGNORE INTO whatsapp_messages (id, from_phone, to_phone, body, direction) VALUES (?,?,?,?,?)")
            .run(uuid(), 'ai-agent', msg.from, result.reply, 'outgoing');

          // Emit to frontend with AI flag + custom color
          emit('whatsapp:message', {
            id: `ai-${Date.now()}`,
            from: 'me',
            body: result.reply,
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            fromMe: true,
            isAI: true,
            bubbleColor: agentSettings.agent_bubble_color || '#e8d5ff',
            ack: 1,
          });

          // Human handoff alert
          if (result.isHandoff) {
            await db.prepare('INSERT INTO notifications (id, type, title, message, link) VALUES (?,?,?,?,?)')
              .run(uuid(), 'whatsapp', 'Human Handoff Requested', `${contact.pushname || msg.from} wants to talk to a human`, '/admin/whatsapp');
          }
        }
      } catch (e) {
        console.error('AI Agent error:', e.message);
      }
    }

    await processAutoReply(msg);
  });

  // Message reactions
  client.on('message_reaction', (reaction) => {
    emit('whatsapp:reaction', {
      msgId: reaction.msgId._serialized,
      reaction: reaction.reaction,
      senderId: reaction.senderId,
    });
  });

  // Message edited
  client.on('message_edit', (msg, newBody) => {
    emit('whatsapp:message_edit', { id: msg.id._serialized, newBody });
  });

  // Message revoked
  client.on('message_revoke_everyone', (msg) => {
    emit('whatsapp:message_revoked', { id: msg.id._serialized });
  });

  // Incoming call
  client.on('incoming_call', (call) => {
    emit('whatsapp:call', { from: call.from, isVideo: call.isVideo });
  });

  // message_create disabled — manual sends handled in sendMessage(), AI sends emitted in message handler
  // client.on('message_create', ...) removed to prevent duplicate messages

  client.on('message_ack', (msg, ack) => {
    // ack: 1=sent, 2=delivered, 3=read
    emit('whatsapp:ack', { id: msg.id._serialized, ack });
  });

  client.on('auth_failure', (msg) => {
    status = 'disconnected';
    client = null;
    emit('whatsapp:status', { status: 'disconnected', error: msg });
    console.error('❌ WhatsApp auth failed:', msg);
  });

  client.on('disconnected', (reason) => {
    status = 'disconnected';
    client = null;
    emit('whatsapp:status', { status: 'disconnected', reason });
    console.log('❌ WhatsApp disconnected:', reason);
    // Auto-reconnect after 10s (unless manually logged out)
    if (reason !== 'LOGOUT') {
      console.log('🔄 Auto-reconnecting WhatsApp in 10s...');
      setTimeout(() => initWhatsApp(), 10000);
    }
  });

  client.initialize().catch(e => {
    status = 'disconnected';
    client = null;
    emit('whatsapp:status', { status: 'disconnected', error: e.message });
    console.error('WhatsApp init error:', e.message);
  });
};

export const getClient = () => client;
export const getStatus = () => status;
export const getQR = () => qrCodeData;

export const disconnectWhatsApp = async () => {
  if (client) {
    try { await client.destroy(); } catch {}
    client = null;
    status = 'disconnected';
    emit('whatsapp:status', { status: 'disconnected' });
  }
};

export const sendMessage = async (phone, message, mediaUrl = null, caption = null) => {
  if (!client || status !== 'ready') throw new Error('WhatsApp not connected');
  const chatId = phone.includes('@') ? phone : phone.replace(/[^0-9]/g, '') + '@c.us';
  let msg;
  if (mediaUrl) {
    const { MessageMedia } = pkg;
    const media = await MessageMedia.fromUrl(mediaUrl, { unsafeMime: true });
    msg = await client.sendMessage(chatId, media, { caption: caption || message || '' });
  } else {
    msg = await client.sendMessage(chatId, message);
  }
  await db.prepare("INSERT OR IGNORE INTO whatsapp_messages (id, from_phone, to_phone, body, direction) VALUES (?,?,?,?,?)")
    .run(msg.id._serialized, 'me', phone, caption || message || '[media]', 'outgoing');
  return msg;
};

// ── Chat utility functions ────────────────────────────────
export const sendSeen = async (chatId) => {
  if (!client || status !== 'ready') return;
  try { const chat = await client.getChatById(chatId); await chat.sendSeen(); } catch {}
};

export const sendTyping = async (chatId, typing = true) => {
  if (!client || status !== 'ready') return;
  try {
    const chat = await client.getChatById(chatId);
    if (typing) await chat.sendStateTyping();
    else await chat.clearState();
  } catch {}
};

export const pinChat = async (chatId, pin = true) => {
  if (!client || status !== 'ready') return;
  try { const chat = await client.getChatById(chatId); pin ? await chat.pin() : await chat.unpin(); } catch {}
};

export const archiveChat = async (chatId, archive = true) => {
  if (!client || status !== 'ready') return;
  try { const chat = await client.getChatById(chatId); archive ? await chat.archive() : await chat.unarchive(); } catch {}
};

export const markUnread = async (chatId) => {
  if (!client || status !== 'ready') return;
  try { const chat = await client.getChatById(chatId); await chat.markUnread(); } catch {}
};

export const getChats = async () => {
  if (!client || status !== 'ready') return [];
  const chats = await client.getChats();
  return Promise.all(chats.slice(0, 30).map(async c => {
    let lastMsg = '', lastMsgTime = '', profilePic = null, about = null;
    try {
      if (c.lastMessage) {
        lastMsg = c.lastMessage.body || `[${c.lastMessage.type}]`;
        lastMsgTime = new Date(c.lastMessage.timestamp * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      }
      if (!c.isGroup) {
        const contact = await c.getContact();
        profilePic = await contact.getProfilePicUrl().catch(() => null);
        about = await contact.getAbout().catch(() => null);
      }
    } catch {}
    return { id: c.id._serialized, name: c.name || c.id.user, lastMsg, lastMsgTime, unread: c.unreadCount || 0, isGroup: c.isGroup, profilePic, about, pinned: c.pinned, isMuted: c.isMuted };
  }));
};

export const getChatMessages = async (chatId, limit = 50) => {
  if (!client || status !== 'ready') return [];
  try {
    // Use getChats to find the chat (more reliable than getChatById)
    const chats = await client.getChats();
    const chat = chats.find(c => c.id._serialized === chatId);
    if (!chat) return [];
    const messages = await chat.fetchMessages({ limit });
    // Save to DB for AI memory
    const insert = await db.prepare('INSERT OR IGNORE INTO whatsapp_messages (id, from_phone, to_phone, body, direction) VALUES (?,?,?,?,?)');
    for (const m of messages) {
      try { await insert.run(m.id._serialized, m.fromMe ? 'me' : chatId, m.fromMe ? chatId : 'me', m.body || `[${m.type}]`, m.fromMe ? 'outgoing' : 'incoming'); } catch {}
    }
    return messages.map(m => ({
      id: m.id._serialized,
      body: m.body || (m.type !== 'chat' ? `[${m.type}]` : ''),
      fromMe: m.fromMe,
      time: new Date(m.timestamp * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(m.timestamp * 1000).toISOString(),
      type: m.type, ack: m.ack, hasMedia: m.hasMedia,
    }));
  } catch (e) {
    console.error('getChatMessages error:', e.message);
    return [];
  }
};

// Auto-init if session exists
import fs from 'fs';
const sessionPath = path.resolve(__dirname, '../../../data/whatsapp-session');
if (fs.existsSync(sessionPath)) {
  console.log('📱 WhatsApp session found — auto-connecting...');
  setTimeout(() => initWhatsApp(), 2000);
}

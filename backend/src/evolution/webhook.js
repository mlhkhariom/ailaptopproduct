import db from '../db/database.js';
import { v4 as uuid } from 'uuid';
import { processAgentMessage } from '../ai/agent.js';
import { sendText, sendMedia } from './client.js';

let io = null;
export const setIO = (socketIO) => { io = socketIO; };

const emit = (event, data) => { if (io) io.emit(event, data); };

// Save/update chat in DB
const upsertChat = async (instanceName, remoteJid, pushName, lastMessage, timestamp) => {
  await db.prepare(`INSERT INTO evolution_chats (id, instance_name, remote_jid, push_name, last_message, last_message_time, unread_count, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))
    ON CONFLICT(instance_name, remote_jid) DO UPDATE SET
      push_name = COALESCE(excluded.push_name, push_name),
      last_message = excluded.last_message,
      last_message_time = excluded.last_message_time,
      unread_count = unread_count + 1,
      updated_at = datetime('now')`)
    .run(uuid(), instanceName, remoteJid, pushName || '', lastMessage || '', timestamp || new Date().toISOString());
};

// Save message to DB
const saveMessage = async (instanceName, msg) => {
  try {
    await db.prepare(`INSERT OR IGNORE INTO evolution_messages
      (id, instance_name, remote_jid, message_id, body, from_me, message_type, media_url, status, timestamp, push_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(uuid(), instanceName, msg.remoteJid, msg.id, msg.body || '', msg.fromMe ? 1 : 0,
        msg.type || 'text', msg.mediaUrl || null, 'received', msg.timestamp || Date.now(), msg.pushName || '');
  } catch {}
};

// Main webhook handler
export const handleWebhook = async (instanceName, event, data) => {
  try {
    switch (event) {
      case 'MESSAGES_UPSERT': case 'messages.upsert': case 'send.message': {
        const messages = Array.isArray(data) ? data : [data];
        for (const msg of messages) {
          if (!msg?.key) continue;
          const remoteJid = msg.key.remoteJid;
          const fromMe = msg.key.fromMe;
          // Extract text body from various message types
          const body = typeof msg.message === 'string' ? msg.message :
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            msg.message?.documentMessage?.caption ||
            msg.message?.buttonsResponseMessage?.selectedDisplayText ||
            msg.message?.listResponseMessage?.title ||
            '[media]';
          const pushName = msg.pushName || '';
          const msgType = msg.messageType || Object.keys(msg.message || {}).find(k => k !== 'messageContextInfo') || 'text';

          const parsed = { id: msg.key.id, remoteJid, fromMe, body, pushName, type: msgType, timestamp: msg.messageTimestamp, remoteJidAlt: msg.key.remoteJidAlt || null };

          saveMessage(instanceName, parsed);
          if (!fromMe) upsertChat(instanceName, remoteJid, pushName, body, new Date().toISOString());

          // Emit to frontend
          emit('evolution:message', { instanceName, ...parsed, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) });

          // AI Agent — only for incoming text messages
          if (!fromMe && body && body !== '[media]' && (msgType === 'conversation' || msgType === 'extendedTextMessage')) {
            console.log(`🤖 Evolution AI processing: "${body.slice(0,30)}" from ${remoteJid.split('@')[0]}`);
            try {
              const agentContactId = remoteJid.includes('@lid')
                ? (parsed.remoteJidAlt || remoteJid)
                : remoteJid;
              const result = await processAgentMessage(agentContactId, pushName, body);
              if (result?.reply) {
                const sendNumber = remoteJid.replace('@s.whatsapp.net','').replace('@lid','').replace(/[^0-9]/g,'');
                await sendText(instanceName, sendNumber, result.reply);
                saveMessage(instanceName, { id: uuid(), remoteJid, fromMe: true, body: result.reply, type: 'text', timestamp: Date.now() });
                emit('evolution:message', { instanceName, remoteJid, fromMe: true, body: result.reply, isAI: true, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) });
                // Send product images
                if (result.productImages?.length > 0) {
                  for (const img of result.productImages) {
                    try {
                      await sendMedia(instanceName, sendNumber, img.url, img.caption, 'image');
                      console.log(`📸 Product image sent to ${sendNumber}`);
                    } catch (imgErr) {
                      console.error('Image send error:', imgErr.message);
                    }
                  }
                }
              }
            } catch (e) { console.error('Evolution AI error:', e.message); }
          }
        }
        break;
      }

      case 'MESSAGES_UPDATE': case 'messages.update': {
        const updates = Array.isArray(data) ? data : [data];
        for (const u of updates) {
          const status = u.update?.status === 3 ? 'read' : u.update?.status === 2 ? 'delivered' : 'sent';
          await db.prepare("UPDATE evolution_messages SET status=? WHERE message_id=?").run(status, u.key?.id);
          emit('evolution:status_update', { instanceName, msgId: u.key?.id, status });
        }
        break;
      }

      case 'CONNECTION_UPDATE': case 'connection.update': {
        const state = data.state || data.connection;
        await db.prepare("UPDATE evolution_instances SET status=?, updated_at=datetime('now') WHERE instance_name=?").run(state, instanceName);
        emit('evolution:connection', { instanceName, state, qr: data.qr });
        if (data.qr) {
          await db.prepare("UPDATE evolution_instances SET qr_code=?, status='qr_code', updated_at=datetime('now') WHERE instance_name=?").run(data.qr, instanceName);
          emit('evolution:qr', { instanceName, qr: data.qr });
        }
        if (state === 'open') {
          await db.prepare("UPDATE evolution_instances SET status='connected', qr_code=NULL, updated_at=datetime('now') WHERE instance_name=?").run(instanceName);
          emit('evolution:connected', { instanceName });
        }
        break;
      }

      case 'QRCODE_UPDATED': case 'qrcode.updated': {
        const qr = data.qrcode?.base64 || data.qr;
        if (qr) {
          await db.prepare("UPDATE evolution_instances SET qr_code=?, status='qr_code', updated_at=datetime('now') WHERE instance_name=?").run(qr, instanceName);
          emit('evolution:qr', { instanceName, qr });
        }
        break;
      }
    }
  } catch (e) {
    console.error('Evolution webhook error:', e.message);
  }
};

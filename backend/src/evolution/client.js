import db from '../db/database.js';

const getSettings = async () => await db.prepare("SELECT * FROM evolution_settings WHERE id='main'").get() || {};

// HTTP wrapper for Evolution API
export const evolutionFetch = async (path, method = 'GET', body = null) => {
  const s = getSettings();
  if (!s.api_url || !s.api_key) throw new Error('Evolution API not configured');
  const res = await fetch(`${s.api_url.replace(/\/$/, '')}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'apikey': s.api_key },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || `Evolution API error ${res.status}`);
  return data;
};

// Test connection
export const testConnection = async () => {
  const data = await evolutionFetch('/instance/fetchInstances');
  return { ok: true, instances: Array.isArray(data) ? data.length : 0 };
};

// Instance operations
export const fetchInstances = () => evolutionFetch('/instance/fetchInstances');

export const createInstance = (instanceName, connectionType = 'baileys', cloudConfig = {}) => {
  if (connectionType === 'cloud') {
    return evolutionFetch('/instance/create', 'POST', {
      instanceName,
      integration: 'WHATSAPP-BUSINESS',
      ...cloudConfig,
    });
  }
  return evolutionFetch('/instance/create', 'POST', {
    instanceName,
    qrcode: true,
    integration: 'WHATSAPP-BAILEYS',
  });
};

export const connectInstance = (instanceName) => evolutionFetch(`/instance/connect/${instanceName}`);
export const disconnectInstance = (instanceName) => evolutionFetch(`/instance/logout/${instanceName}`, 'DELETE');
export const deleteInstance = (instanceName) => evolutionFetch(`/instance/delete/${instanceName}`, 'DELETE');
export const getInstanceStatus = (instanceName) => evolutionFetch(`/instance/connectionState/${instanceName}`);
export const getQRCode = (instanceName) => evolutionFetch(`/instance/connect/${instanceName}`);
export const restartInstance = (instanceName) => evolutionFetch(`/instance/restart/${instanceName}`, 'PUT');

// Chats
export const fetchChats = (instanceName) => evolutionFetch(`/chat/findChats/${instanceName}`, 'POST', {});
export const fetchMessages = (instanceName, remoteJid, limit = 50) =>
  evolutionFetch(`/chat/findMessages/${instanceName}`, 'POST', { where: { key: { remoteJid } }, limit });

// Send messages
export const sendText = (instanceName, number, text, quotedMsgId = null) =>
  evolutionFetch(`/message/sendText/${instanceName}`, 'POST', {
    number,
    text,
    ...(quotedMsgId ? { quoted: { key: { id: quotedMsgId } } } : {}),
  });

export const sendMedia = (instanceName, number, mediaUrl, caption, mediaType = 'image') =>
  evolutionFetch(`/message/sendMedia/${instanceName}`, 'POST', {
    number,
    mediatype: mediaType,
    media: mediaUrl,
    caption,
  });

export const sendReaction = (instanceName, remoteJid, msgId, reaction) =>
  evolutionFetch(`/message/sendReaction/${instanceName}`, 'POST', {
    key: { remoteJid, id: msgId },
    reaction,
  });

// Contacts
export const fetchContacts = (instanceName) => evolutionFetch(`/chat/findContacts/${instanceName}`, 'POST', {});
export const getProfilePic = (instanceName, number) =>
  evolutionFetch(`/chat/fetchProfilePictureUrl/${instanceName}`, 'POST', { number });
export const checkNumber = (instanceName, numbers) =>
  evolutionFetch(`/chat/whatsappNumbers/${instanceName}`, 'POST', { numbers });

// Set webhook for instance
export const setWebhook = (instanceName, webhookUrl) =>
  evolutionFetch(`/webhook/set/${instanceName}`, 'POST', {
    url: webhookUrl,
    webhook_by_events: true,
    webhook_base64: false,
    events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE', 'QRCODE_UPDATED', 'CONTACTS_UPSERT'],
  });

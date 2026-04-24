import { getClient, getStatus } from './client.js';

export const fetchChatMessages = async (chatId, limit = 50) => {
  const client = getClient();
  if (!client || getStatus() !== 'ready') throw new Error('WhatsApp not connected');

  try {
    if (!client.pupPage || client.pupPage.isClosed()) throw new Error('WhatsApp page not available');
    const messages = await client.pupPage.evaluate((chatId, limit) => {
      const chat = window.Store.Chat.get(chatId);
      if (!chat) return [];
      const msgs = chat.msgs.getModelsArray().filter(m => m && m.id && m.id._serialized).slice(-limit);
      return msgs.map(m => ({
        id: m.id._serialized,
        body: m.body || m.caption || '',
        fromMe: m.id.fromMe,
        timestamp: m.t || 0,
        type: m.type || 'chat',
        ack: m.ack || 0,
        hasMedia: !!(m.mediaData || m.mediaKey),
      }));
    }, chatId, limit);

    return messages.map(m => ({
      ...m,
      time: new Date(m.timestamp * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(m.timestamp * 1000).toISOString(),
    }));
  } catch (e) {
    console.error('fetchChatMessages error:', e.message);
    return []; // Don't throw — prevents unhandled rejection crash
  }
};

export const fetchAllChats = async (limit = 30) => {
  const client = getClient();
  if (!client || getStatus() !== 'ready') throw new Error('WhatsApp not connected');

  const chats = await client.getChats();
  return chats.slice(0, limit).map(c => {
    let lastMsg = '', lastMsgTime = '';
    try {
      if (c.lastMessage) {
        lastMsg = c.lastMessage.body || `[${c.lastMessage.type}]`;
        lastMsgTime = new Date(c.lastMessage.timestamp * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      }
    } catch {}
    return {
      id: c.id._serialized,
      name: c.name || c.id.user,
      lastMsg, lastMsgTime,
      unread: c.unreadCount || 0,
      isGroup: c.isGroup,
      profilePic: null,
      about: null,
      pinned: c.pinned,
      isMuted: c.isMuted,
      timestamp: c.timestamp,
    };
  }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
};

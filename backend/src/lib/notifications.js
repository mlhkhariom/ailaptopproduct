// ══════════════════════════════════════════════════════════
// CENTRALIZED NOTIFICATION SERVICE
// Single entry point for all notifications: in-app, email, WhatsApp, push
// ══════════════════════════════════════════════════════════

import { v4 as uuid } from 'uuid';
import db from '../db/database.js';

// Main notify function — sends via all configured channels
export async function notify({ type, title, message, link, user_id, roles, channels, data }) {
  // 1. Always save in-app notification
  await db.prepare("INSERT INTO notifications (id, type, title, message, link, user_id, is_read, created_at) VALUES (?,?,?,?,?,?,0,NOW())")
    .run(uuid(), type || 'system', title, message, link || '/', user_id || null);

  // 2. Determine channels (default: in-app only)
  const sendChannels = channels || ['in_app'];

  // 3. Email
  if (sendChannels.includes('email') && user_id) {
    try {
      const user = await db.prepare('SELECT email FROM users WHERE id=?').get(user_id);
      if (user?.email) {
        const { sendEmail } = await import('./email.js');
        await sendEmail({ to: user.email, subject: title, html: `<p>${message}</p>${link ? `<p><a href="https://ailaptopwala.com${link}">View Details</a></p>` : ''}` });
      }
    } catch {}
  }

  // 4. WhatsApp
  if (sendChannels.includes('whatsapp')) {
    try {
      const phone = data?.phone || (user_id ? (await db.prepare('SELECT phone FROM users WHERE id=?').get(user_id))?.phone : null);
      if (phone) {
        const { queueWhatsAppNotification } = await import('../whatsapp/notifications.js');
        queueWhatsAppNotification(phone, `${title}\n\n${message}`);
      }
    } catch {}
  }

  // 5. Notify by role (for approvals, alerts)
  if (roles && Array.isArray(roles)) {
    try {
      const staffUsers = await db.prepare(`SELECT id FROM users WHERE role IN (${roles.map(() => '?').join(',')}) AND is_active=1`).all(...roles);
      for (const u of staffUsers) {
        await db.prepare("INSERT INTO notifications (id, type, title, message, link, user_id, is_read, created_at) VALUES (?,?,?,?,?,?,0,NOW())")
          .run(uuid(), type || 'system', title, message, link || '/', u.id);
      }
    } catch {}
  }
}

// Notify specific user
export async function notifyUser(userId, { type, title, message, link, channels }) {
  return notify({ type, title, message, link, user_id: userId, channels });
}

// Notify all admins
export async function notifyAdmins({ type, title, message, link }) {
  return notify({ type, title, message, link, roles: ['superadmin', 'admin', 'manager'] });
}

// Notify customer (email + WhatsApp)
export async function notifyCustomer(userId, { title, message, link }) {
  return notify({ type: 'customer', title, message, link, user_id: userId, channels: ['in_app', 'email', 'whatsapp'] });
}

// Get unread count for user
export async function getUnreadCount(userId) {
  const result = await db.prepare("SELECT COUNT(*) as c FROM notifications WHERE user_id=? AND is_read=0").get(userId);
  return result?.c || 0;
}

// Mark all as read
export async function markAllRead(userId) {
  await db.prepare("UPDATE notifications SET is_read=1 WHERE user_id=? AND is_read=0").run(userId);
}

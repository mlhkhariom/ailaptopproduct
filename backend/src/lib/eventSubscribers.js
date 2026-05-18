// ══════════════════════════════════════════════════════════
// EVENT SUBSCRIBERS — React to events from other modules
// This is the ONLY place where cross-module logic lives
// When splitting to microservices: each becomes its own service
// ══════════════════════════════════════════════════════════

import { eventBus, EVENTS } from './eventBus.js';

export function registerEventSubscribers() {

  // ── ORDER PLACED → multiple reactions ──────────────────
  eventBus.on(EVENTS.ORDER_PLACED, async (data) => {
    // 1. Send confirmation email
    try {
      const { sendEmail, EmailTemplates } = await import('./email.js');
      if (data.email) await sendEmail({ to: data.email, subject: `Order #${data.orderNumber} Confirmed`, html: EmailTemplates?.orderConfirmation?.(data) || `<p>Order ${data.orderNumber} placed! Total: ₹${data.total}</p>`, toggleKey: 'email_order_confirmation' });
    } catch {}

    // 2. WhatsApp notification
    try {
      const { queueWhatsAppNotification } = await import('../whatsapp/notifications.js');
      if (data.phone) queueWhatsAppNotification(data.phone, `✅ Order #${data.orderNumber} confirmed!\nTotal: ₹${data.total}\nTrack: ailaptopwala.com/track-order?order=${data.orderNumber}`);
    } catch {}

    // 3. Create CRM lead (if new customer)
    try {
      const db = (await import('../db/database.js')).default;
      const { v4: uuid } = await import('uuid');
      if (data.phone) {
        const exists = await db.prepare('SELECT id FROM leads WHERE phone=?').get(data.phone.slice(-10));
        if (!exists) await db.prepare("INSERT INTO leads (id,name,phone,source,interest,status) VALUES (?,?,?,'Order','Purchase','won')").run(uuid(), data.customerName || 'Customer', data.phone.slice(-10));
      }
    } catch {}

    // 4. Record in accounting
    try {
      const { recordSale } = await import('./accountingEngine.js');
      await recordSale({ orderId: data.orderId, amount: data.total, paymentMethod: data.paymentMethod });
    } catch {}
  });

  // ── ORDER CANCELLED → restore stock ───────────────────
  eventBus.on(EVENTS.ORDER_CANCELLED, async (data) => {
    try {
      const db = (await import('../db/database.js')).default;
      for (const item of (data.items || [])) {
        await db.prepare('UPDATE products SET stock=stock+?, in_stock=1 WHERE id=?').run(item.quantity || 1, item.id);
        await db.prepare('UPDATE branch_stock SET stock=stock+? WHERE product_id=?').run(item.quantity || 1, item.id);
      }
    } catch {}
  });

  // ── PRODUCT PRICE CHANGED → notify wishlist users ─────
  eventBus.on(EVENTS.PRODUCT_PRICE_CHANGED, async (data) => {
    if (data.newPrice >= data.oldPrice) return; // Only notify on price DROP
    try {
      const db = (await import('../db/database.js')).default;
      const { queueWhatsAppNotification } = await import('../whatsapp/notifications.js');
      const users = await db.prepare('SELECT w.user_id, u.phone FROM wishlists w JOIN users u ON w.user_id=u.id WHERE w.product_id=? AND w.notify_price_drop=1').all(data.productId);
      for (const u of users) {
        if (u.phone) queueWhatsAppNotification(u.phone, `🔔 Price Drop!\n${data.name} now ₹${data.newPrice} (was ₹${data.oldPrice})\n👉 ailaptopwala.com/products/${data.slug}`);
      }
    } catch {}
  });

  // ── LEAD CREATED → run automations ────────────────────
  eventBus.on(EVENTS.LEAD_CREATED, async (data) => {
    try {
      const { runLeadAutomations } = await import('../routes/ecommerce/crmTools.js');
      await runLeadAutomations(data);
    } catch {}
  });

  // ── EXPENSE SUBMITTED → request approval ──────────────
  eventBus.on(EVENTS.EXPENSE_SUBMITTED, async (data) => {
    try {
      const { requestApproval } = await import('./approvalEngine.js');
      await requestApproval({ module: 'expense', ref_id: data.expenseId, title: `Expense: ${data.category} — ₹${data.amount}`, amount: data.amount, requested_by: data.submittedBy, approver_role: 'manager' });
    } catch {}
  });

  // ── JOB CARD CREATED → notify technician ──────────────
  eventBus.on(EVENTS.JOB_CARD_CREATED, async (data) => {
    try {
      const { notify } = await import('./notifications.js');
      await notify({ type: 'job_card', title: 'New Job Card Assigned', message: `${data.customerName} — ${data.device}`, link: '/admin/erp/job-cards', roles: ['technician', 'manager'] });
    } catch {}
  });

  // ── USER REGISTERED → welcome notification ────────────
  eventBus.on(EVENTS.USER_REGISTERED, async (data) => {
    try {
      const { notifyUser } = await import('./notifications.js');
      await notifyUser(data.userId, { type: 'welcome', title: 'Welcome to AI Laptop Wala!', message: 'Your account is ready. Browse laptops and get exclusive deals.', channels: ['in_app', 'email'] });
    } catch {}
  });

  console.log('✅ Event subscribers registered:', Object.keys(EVENTS).length, 'events');
}

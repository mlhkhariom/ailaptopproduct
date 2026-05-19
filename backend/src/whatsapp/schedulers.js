import db from '../db/database.js';
import { v4 as uuid } from 'uuid';

// Process recurring invoices — runs daily at midnight
export function startRecurringInvoiceProcessor() {
  const run = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const due = await db.prepare("SELECT * FROM recurring_invoices WHERE is_active=1 AND next_date<=?").all(today) || [];
      for (const r of due) {
        const invoice_number = 'REC-' + Date.now().toString().slice(-6);
        const id = uuid();
        await db.prepare(`INSERT INTO custom_invoices (id,invoice_number,customer_name,customer_phone,customer_email,items,subtotal,discount,total,notes,payment_status,payment_method,gst_enabled) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
          .run(id, invoice_number, r.customer_name, r.customer_phone, r.customer_email, r.items, r.subtotal, r.discount, r.total, r.notes, 'pending', r.payment_method, r.gst_enabled);
        const next = new Date(r.next_date);
        if (r.frequency === 'monthly') next.setMonth(next.getMonth() + 1);
        else if (r.frequency === 'quarterly') next.setMonth(next.getMonth() + 3);
        else if (r.frequency === 'yearly') next.setFullYear(next.getFullYear() + 1);
        await db.prepare('UPDATE recurring_invoices SET last_generated=?,next_date=? WHERE id=?').run(today, next.toISOString().split('T')[0], r.id);
        // WhatsApp notify customer
        if (r.customer_phone) {
          try {
            const { queueNotification } = await import('./notifications.js');
            await queueNotification(r.customer_phone, `Dear ${r.customer_name}, your invoice ${invoice_number} of ₹${r.total} has been generated. Please contact us to pay.`, 'recurring_invoice');
          } catch (e) { console.error("Scheduler error:", e.message); }
        }
        console.log(`✅ Recurring invoice generated: ${invoice_number} for ${r.customer_name}`);
      }
      if (due.length) console.log(`✅ Processed ${due.length} recurring invoices`);
    } catch (e) { console.error('Recurring invoice processor error:', e.message); }
  };

  // Run immediately then every 6 hours
  run();
  setInterval(run, 6 * 60 * 60 * 1000);

  // Also process recurring expenses
  const runExpenses = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const due = await db.prepare("SELECT * FROM recurring_expenses WHERE is_active=1 AND next_date<=?").all(today) || [];
      for (const r of due) {
        await db.prepare('INSERT INTO expenses (id,category,amount,description,payment_method,date,branch_id,created_by) VALUES (?,?,?,?,?,?,?,?)').run(uuid(), r.category, r.amount, r.description || `Recurring: ${r.category}`, r.payment_method, today, r.branch_id, 'system');
        const next = new Date(r.next_date);
        if (r.frequency === 'monthly') next.setMonth(next.getMonth() + 1);
        else if (r.frequency === 'yearly') next.setFullYear(next.getFullYear() + 1);
        await db.prepare('UPDATE recurring_expenses SET last_generated=?,next_date=? WHERE id=?').run(today, next.toISOString().split('T')[0], r.id);
        console.log(`✅ Recurring expense added: ${r.category} ₹${r.amount}`);
      }
    } catch (e) { console.error('Recurring expense error:', e.message); }
  };
  runExpenses();
  setInterval(runExpenses, 6 * 60 * 60 * 1000);
  console.log('✅ Recurring invoice processor started');
}

// ── Overdue Invoice WhatsApp Reminder (runs every 6 hours) ──
export function startOverdueReminder() {
  const run = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const overdue = await db.prepare(`
        SELECT * FROM custom_invoices
        WHERE payment_status != 'paid' AND due_date IS NOT NULL AND due_date < ?
        ORDER BY due_date ASC LIMIT 10
      `).all(today) || [];

      if (overdue.length === 0) return;

      const { queueNotification } = await import('./notifications.js');
      for (const inv of overdue) {
        if (!inv.customer_phone) continue;
        const daysOverdue = Math.ceil((Date.now() - new Date(inv.due_date).getTime()) / 86400000);
        const msg = `⏰ *Payment Reminder — AI Laptop Wala*\n\nNamaste ${inv.customer_name}! 🙏\n\nYour invoice *${inv.invoice_number}* of *₹${(inv.total || 0).toLocaleString('en-IN')}* is overdue by ${daysOverdue} day(s).\n\nDue date: ${inv.due_date}\n\nPlease clear the payment at your earliest convenience.\n\n📞 +91 98934 96163`;
        await queueNotification(inv.customer_phone, msg, 'overdue_reminder');
      }
      console.log(`✅ Sent ${overdue.length} overdue reminders`);
    } catch (e) { console.error('Overdue reminder error:', e.message); }
  };

  // Run every 6 hours
  run();
  setInterval(run, 6 * 60 * 60 * 1000);
  console.log('✅ Overdue invoice reminder started (6h)');
}

// KPI Alert scheduler — runs every hour
export function startKPIAlertScheduler() {
  const run = async () => {
    try {
      const OWNER_PHONE = process.env.OWNER_PHONE || '';
      if (!OWNER_PHONE) return;
      const alerts = await db.prepare("SELECT * FROM kpi_alerts WHERE is_active=1").all() || [];
      if (!alerts.length) return;
      const today = new Date().toISOString().split('T')[0];
      const monthStart = today.slice(0, 7) + '-01';
      for (const alert of alerts) {
        let value = 0;
        if (alert.metric === 'daily_revenue') {
          const r = await db.prepare("SELECT COALESCE(SUM(total_charge),0) as v FROM service_bookings WHERE payment_status='paid' AND DATE(created_at)=?").get(today);
          value = r?.v || 0;
        } else if (alert.metric === 'pending_jobs') {
          const r = await db.prepare("SELECT COUNT(*) as c FROM service_bookings WHERE status IN ('pending','in_progress')").get();
          value = r?.c || 0;
        } else if (alert.metric === 'sla_breached') {
          const r = await db.prepare("SELECT COUNT(*) as c FROM service_bookings WHERE sla_breached=1 AND status NOT IN ('completed','cancelled')").get();
          value = r?.c || 0;
        }
        const triggered = alert.operator === 'lt' ? value < alert.threshold : value > alert.threshold;
        if (triggered) {
          try {
            const { queueNotification } = await import('./notifications.js');
            const msg = alert.message || `⚠️ KPI Alert: ${alert.metric} = ${value} (threshold: ${alert.threshold})`;
            await queueNotification(OWNER_PHONE, msg, 'kpi_alert');
          } catch (e) { console.error("Scheduler error:", e.message); }
        }
      }
    } catch (e) { console.error('KPI alert scheduler error:', e.message); }

    // Low stock alert
    try {
      const lowStock = await db.prepare("SELECT name, stock FROM products WHERE status='active' AND stock > 0 AND stock <= 3 LIMIT 10").all();
      if (lowStock.length > 0) {
        const adminPhone = (await db.prepare("SELECT value FROM app_settings WHERE key='admin_phone'").get())?.value;
        if (adminPhone) {
          const list = lowStock.map(p => `• ${p.name}: ${p.stock} left`).join('\n');
          const { queueWhatsAppNotification } = await import('./notifications.js');
          queueWhatsAppNotification(adminPhone, `⚠️ *Low Stock Alert*\n\n${lowStock.length} products running low:\n\n${list}\n\nRestock soon! → ailaptopwala.com/admin/inventory`);
        }
      }
    } catch {}
  };

  // Run every hour
  setInterval(run, 60 * 60 * 1000);

  // ── CRM Follow-up Reminders (runs every 2 hours) ──────
  const followupReminder = async () => {
    try {
      const { Config } = await import('../lib/config.js');
      const ownerPhone = await Config.ownerPhone();
      if (!ownerPhone) return;

      const today = new Date().toISOString().split('T')[0];
      const overdue = await db.prepare(`SELECT l.name, l.phone, l.interest, l.next_followup, l.assigned_to
        FROM leads l WHERE l.next_followup <= ? AND l.status NOT IN ('won','lost')
        ORDER BY l.next_followup ASC LIMIT 10`).all(today) || [];

      if (overdue.length > 0) {
        const { queueNotification } = await import('./notifications.js');
        const list = overdue.slice(0, 5).map(l => `• ${l.name} (${l.interest || 'General'}) — due ${l.next_followup}`).join('\n');
        const msg = `📋 CRM Follow-up Reminder\n\n${overdue.length} leads need follow-up today:\n\n${list}${overdue.length > 5 ? `\n... +${overdue.length - 5} more` : ''}\n\nOpen CRM: ailaptopwala.com/admin/crm`;
        await queueNotification(ownerPhone, msg, 'crm_reminder');
      }
    } catch (e) { console.error('Follow-up reminder error:', e.message); }
  };
  followupReminder();
  setInterval(followupReminder, 2 * 60 * 60 * 1000);

  console.log('✅ KPI alert + CRM follow-up scheduler started');
}

// ── Job Card Escalation (runs every hour) ─────────────────
export function startJobCardEscalation() {
  setInterval(async () => {
    try {
      // Find overdue jobs (created > 48h ago, not completed, not escalated)
      const overdue = await db.prepare("SELECT jc.*, s.name as tech_name FROM job_cards jc LEFT JOIN staff s ON jc.assigned_to=s.id WHERE jc.status NOT IN ('completed','delivered','cancelled') AND jc.escalated=0 AND jc.created_at < NOW() - INTERVAL '48 hours' LIMIT 5").all();
      if (overdue.length === 0) return;
      const adminPhone = (await db.prepare("SELECT value FROM app_settings WHERE key='admin_phone'").get())?.value;
      if (!adminPhone) return;
      const list = overdue.map(j => `• ${j.job_number}: ${j.device_name} (${j.tech_name || 'Unassigned'})`).join('\n');
      const { queueWhatsAppNotification } = await import('./notifications.js');
      queueWhatsAppNotification(adminPhone, `🚨 *Job Card Escalation*\n\n${overdue.length} repairs overdue (48h+):\n\n${list}\n\nAction needed! → ailaptopwala.com/admin/erp/job-cards`);
      for (const j of overdue) { await db.prepare('UPDATE job_cards SET escalated=1 WHERE id=?').run(j.id); }
    } catch (e) { console.error('Escalation error:', e.message); }
  }, 60 * 60 * 1000);
  console.log('✅ Job card escalation scheduler started');
}

// ── Abandoned Cart Recovery (runs every 2 hours) ──────────
export function startAbandonedCartRecovery() {
  setInterval(async () => {
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const carts = await db.prepare("SELECT * FROM abandoned_carts WHERE reminder_sent=0 AND recovered=0 AND created_at < ? ORDER BY created_at DESC LIMIT 10").all(twoHoursAgo);
      
      if (carts.length === 0) return;
      
      for (const cart of carts) {
        const phone = cart.phone || cart.email;
        if (!phone || phone.length < 10) continue;
        
        const items = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items;
        const itemNames = items.slice(0, 3).map((i) => i.name).join(', ');
        const msg = `🛒 Aapka cart wait kar raha hai!\n\n${itemNames}${items.length > 3 ? ` +${items.length - 3} more` : ''}\nTotal: ₹${cart.total?.toLocaleString('en-IN')}\n\n👉 Complete your order: https://ailaptopwala.com/cart\n\nKoi sawaal? Reply karein ya call karein: +91 98934 96163`;
        
        try {
          const { queueWhatsAppNotification } = await import('./notifications.js');
          queueWhatsAppNotification(phone, msg);
          await db.prepare("UPDATE abandoned_carts SET reminder_sent=1, updated_at=NOW() WHERE id=?").run(cart.id);
        } catch {}
      }
      console.log(`🛒 Abandoned cart recovery: ${carts.length} reminders sent`);
    } catch (e) { console.error('Abandoned cart error:', e.message); }
  }, 2 * 60 * 60 * 1000); // Every 2 hours
  console.log('✅ Abandoned cart recovery scheduler started');
}

// Daily report to owner via WhatsApp
export function startDailyReportScheduler() {
  const sendDailyReport = async () => {
    try {
      const settings = Object.fromEntries((await db.prepare('SELECT key,value FROM app_settings').all()).map(r => [r.key, r.value]));
      const hour = parseInt(settings.daily_report_hour || '21');
      const now = new Date();
      if (now.getHours() !== hour) return;

      const today = now.toISOString().split('T')[0];
      const orders = await db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(total),0) as rev FROM orders WHERE DATE(created_at)=?").get(today);
      const leads = await db.prepare("SELECT COUNT(*) as c FROM leads WHERE DATE(created_at)=?").get(today);
      const jobs = await db.prepare("SELECT COUNT(*) as c FROM service_bookings WHERE DATE(created_at)=?").get(today);

      const msg = `📊 *Daily Report — ${today}*\n\n🛒 Orders: ${orders?.c || 0} (₹${orders?.rev || 0})\n👥 New Leads: ${leads?.c || 0}\n🔧 Job Cards: ${jobs?.c || 0}\n\n— ${settings.store_name || 'AI Laptop Wala'}`;

      const phone = settings.owner_phone || settings.whatsapp_number;
      if (phone && settings.evolution_api_url) {
        await fetch(`${settings.evolution_api_url}/message/sendText/${settings.evolution_instance || 'default'}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: settings.evolution_api_key || '' },
          body: JSON.stringify({ number: `91${phone}@s.whatsapp.net`, text: msg })
        }).catch(() => {});
      }
    } catch (e) { console.error('[DailyReport]', e.message); }
  };

  setInterval(sendDailyReport, 60 * 60 * 1000); // Check every hour
  console.log('📊 Daily report scheduler started');
}

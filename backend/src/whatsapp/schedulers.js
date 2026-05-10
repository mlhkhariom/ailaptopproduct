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
  };

  // Run every hour
  setInterval(run, 60 * 60 * 1000);
  console.log('✅ KPI alert scheduler started (hourly)');
}

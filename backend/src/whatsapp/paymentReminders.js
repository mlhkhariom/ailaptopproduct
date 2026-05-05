// Payment reminder processor — runs every hour
// Sends WhatsApp reminder for pending invoices older than 3 days

import db from '../db/database.js';
import { queueNotification } from './notifications.js';

const REMINDER_DAYS = 3;

export const sendPaymentReminders = async () => {
  const cutoff = new Date(Date.now() - REMINDER_DAYS * 86400000).toISOString();

  try {
    // Service job cards — completed but unpaid
    const pendingJobs = await db.prepare(`
      SELECT * FROM service_bookings
      WHERE payment_status='pending' AND status='completed'
      AND reminder_sent=0 AND completed_at < ?
    `).all(cutoff) || [];

    for (const job of pendingJobs) {
      if (!job.customer_phone) continue;
      const msg = `Payment Reminder - AI Laptop Wala\n\nNamaste ${job.customer_name}!\n\nAapka ${job.device_brand} ${job.device_model} repair complete ho gaya hai.\n\nJob ID: ${job.booking_number}\nAmount Due: Rs.${(job.total_charge || 0).toLocaleString('en-IN')}\n\nKripya payment karein:\n+91 98934 96163\nSilver Mall, RNT Marg, Indore`;
      await queueNotification(job.customer_phone, msg, 'payment_reminder');
      await db.prepare('UPDATE service_bookings SET reminder_sent=1 WHERE id=?').run(job.id);
      console.log(`Payment reminder sent to ${job.customer_phone} for ${job.booking_number}`);
    }

    // Custom invoices — pending
    const pendingCustom = await db.prepare(`
      SELECT * FROM custom_invoices
      WHERE payment_status='pending' AND reminder_sent=0 AND created_at < ?
    `).all(cutoff) || [];

    for (const inv of pendingCustom) {
      if (!inv.customer_phone) continue;
      const msg = `Payment Reminder - AI Laptop Wala\n\nNamaste ${inv.customer_name}!\n\nInvoice ${inv.invoice_number} ka payment pending hai.\n\nAmount: Rs.${(inv.total || 0).toLocaleString('en-IN')}\n\nView Invoice: ${process.env.FRONTEND_URL || 'https://ailaptopwala.com'}/api/invoice/${inv.invoice_number}\n\n+91 98934 96163`;
      await queueNotification(inv.customer_phone, msg, 'payment_reminder');
      await db.prepare('UPDATE custom_invoices SET reminder_sent=1 WHERE id=?').run(inv.id);
    }

    if (pendingJobs.length + pendingCustom.length > 0)
      console.log(`Payment reminders sent: ${pendingJobs.length} jobs, ${pendingCustom.length} invoices`);

  } catch (e) {
    console.error('Payment reminder error:', e.message);
  }
};

// Start processor — runs every hour
export const startPaymentReminderProcessor = () => {
  setInterval(sendPaymentReminders, 60 * 60 * 1000); // every hour
  console.log('Payment reminder processor started (runs hourly)');
};

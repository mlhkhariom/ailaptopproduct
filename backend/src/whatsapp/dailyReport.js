// Daily Sales Report — sends WhatsApp summary to owner at 9 PM
import db from '../db/database.js';
import { queueNotification } from './notifications.js';

const OWNER_PHONE = process.env.OWNER_PHONE || '';

export const sendDailySalesReport = async () => {
  if (!OWNER_PHONE) return;
  const today = new Date().toISOString().split('T')[0];
  try {
    const [orders, jobs, expenses, newLeads] = await Promise.all([
      db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(total),0) as rev FROM orders WHERE DATE(created_at)=? AND payment_status='paid'").get(today),
      db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(total_charge),0) as rev FROM service_bookings WHERE DATE(created_at)=?").get(today),
      db.prepare("SELECT COALESCE(SUM(amount),0) as v FROM expenses WHERE date=?").get(today),
      db.prepare("SELECT COUNT(*) as c FROM leads WHERE DATE(created_at)=?").get(today),
    ]);

    const totalRev = (orders?.rev || 0) + (jobs?.rev || 0);
    const msg = `Daily Report - AI Laptop Wala
Date: ${today}

Sales:
- Orders: ${orders?.c || 0} (Rs.${(orders?.rev || 0).toLocaleString('en-IN')})
- Service Jobs: ${jobs?.c || 0} (Rs.${(jobs?.rev || 0).toLocaleString('en-IN')})
- Total Revenue: Rs.${totalRev.toLocaleString('en-IN')}

Expenses: Rs.${(expenses?.v || 0).toLocaleString('en-IN')}
Net: Rs.${(totalRev - (expenses?.v || 0)).toLocaleString('en-IN')}

New Leads: ${newLeads?.c || 0}

AI Laptop Wala`;

    await queueNotification(OWNER_PHONE, msg, 'daily_report');
    console.log('Daily sales report sent to owner');
  } catch (e) {
    console.error('Daily report error:', e.message);
  }
};

export const startDailyReportScheduler = () => {
  // Run every hour, send at 9 PM
  setInterval(() => {
    const hour = new Date().getHours();
    if (hour === 21) sendDailySalesReport();
  }, 60 * 60 * 1000);
  console.log('Daily report scheduler started (sends at 9 PM)');
};

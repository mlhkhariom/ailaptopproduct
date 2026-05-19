import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminOnly, superAdminOnly } from '../../middleware/adminOnly.js';

const router = Router();

// ── ERP DASHBOARD STATS ───────────────────────────────────

router.get('/dashboard', authMiddleware, adminOnly, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.slice(0, 7) + '-01';
  const { branch_id } = req.query;
  const bFilter = branch_id ? ' AND branch_id=?' : '';
  const bParam = branch_id ? [branch_id] : [];

  const [pendingJobs, completedToday, monthRevenue, monthExpenses, totalStaff, pendingPayments] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as c FROM service_bookings WHERE status IN ('pending','in_progress')${bFilter}`).get(...bParam),
    db.prepare(`SELECT COUNT(*) as c FROM service_bookings WHERE DATE(completed_at)=?${bFilter}`).get(today, ...bParam),
    db.prepare(`SELECT COALESCE(SUM(total_charge),0) as v FROM service_bookings WHERE payment_status='paid' AND DATE(created_at)>=?${bFilter}`).get(monthStart, ...bParam),
    db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM expenses WHERE date>=?${bFilter}`).get(monthStart, ...bParam),
    db.prepare(`SELECT COUNT(*) as c FROM staff WHERE is_active=1${bFilter}`).get(...bParam),
    db.prepare(`SELECT COUNT(*) as c FROM service_bookings WHERE payment_status='pending' AND status='completed'${bFilter}`).get(...bParam),
  ]);

  res.json({
    pendingJobs: pendingJobs?.c || 0,
    completedToday: completedToday?.c || 0,
    monthRevenue: monthRevenue?.v || 0,
    monthExpenses: monthExpenses?.v || 0,
    netProfit: (monthRevenue?.v || 0) - (monthExpenses?.v || 0),
    totalStaff: totalStaff?.c || 0,
    pendingPayments: pendingPayments?.c || 0,
    branch_id: branch_id || 'all',
  });
});


// ── SALES FORECASTING ─────────────────────────────────────

router.get('/forecast', authMiddleware, adminOnly, async (req, res) => {
  // Last 3 months revenue by week
  const rows = await db.prepare(`
    SELECT DATE_TRUNC('week', created_at::timestamptz) as week,
      COALESCE(SUM(total),0) as order_rev
    FROM orders WHERE payment_status='paid' AND created_at >= NOW() - INTERVAL '90 days'
    GROUP BY week ORDER BY week ASC`).all() || [];

  const serviceRows = await db.prepare(`
    SELECT DATE_TRUNC('week', created_at::timestamptz) as week,
      COALESCE(SUM(total_charge),0) as service_rev
    FROM service_bookings WHERE payment_status='paid' AND created_at >= NOW() - INTERVAL '90 days'
    GROUP BY week ORDER BY week ASC`).all() || [];

  // Simple linear regression for next 4 weeks
  const weekMap = {};
  rows.forEach(r => { weekMap[r.week] = (weekMap[r.week] || 0) + (r.order_rev || 0); });
  serviceRows.forEach(r => { weekMap[r.week] = (weekMap[r.week] || 0) + (r.service_rev || 0); });

  const weeks = Object.entries(weekMap).sort(([a], [b]) => a.localeCompare(b));
  const n = weeks.length;
  const avgRevenue = n ? weeks.reduce((s, [, v]) => s + v, 0) / n : 0;
  const trend = n > 1 ? (weeks[n - 1][1] - weeks[0][1]) / n : 0;

  const forecast = [1, 2, 3, 4].map(i => ({
    week: `Week +${i}`,
    predicted: Math.max(0, Math.round(avgRevenue + trend * i)),
  }));

  // Pipeline value from CRM
  const pipeline = await db.prepare("SELECT COALESCE(SUM(deal_value),0) as v FROM leads WHERE status NOT IN ('won','lost')").get();

  res.json({ historical: weeks.map(([week, rev]) => ({ week, rev })), forecast, avgWeeklyRevenue: Math.round(avgRevenue), pipelineValue: pipeline?.v || 0 });
});


// ── STOCK AGING REPORT ────────────────────────────────────

router.get('/stock-aging', authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.prepare(`
    SELECT p.id, p.name, p.category, p.stock, p.price, p.created_at,
      EXTRACT(DAY FROM NOW() - p.created_at::timestamptz) as days_in_stock,
      p.stock * p.price as stock_value
    FROM products p
    WHERE p.status='active' AND p.stock > 0
    ORDER BY days_in_stock DESC
  `).all() || [];
  const aged30 = rows.filter(r => r.days_in_stock >= 30 && r.days_in_stock < 60);
  const aged60 = rows.filter(r => r.days_in_stock >= 60 && r.days_in_stock < 90);
  const aged90 = rows.filter(r => r.days_in_stock >= 90);
  res.json({ all: rows, aged30, aged60, aged90, totalValue: rows.reduce((s, r) => s + (r.stock_value || 0), 0) });
});


// ── BRANCH COMPARISON ─────────────────────────────────────

router.get('/branch-comparison', authMiddleware, adminOnly, async (req, res) => {
  const { from, to } = req.query;
  const f = from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const t = to || new Date().toISOString().split('T')[0];
  const branches = await db.prepare('SELECT * FROM branches WHERE is_active=1').all() || [];
  const result = await Promise.all(branches.map(async b => {
    const [orders, jobs, leads] = await Promise.all([
      db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(total),0) as rev FROM orders WHERE branch_id=? AND payment_status='paid' AND DATE(created_at) BETWEEN ? AND ?").get(b.id, f, t),
      db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(total_charge),0) as rev, COUNT(CASE WHEN status='completed' THEN 1 END) as completed FROM service_bookings WHERE branch_id=? AND DATE(created_at) BETWEEN ? AND ?").get(b.id, f, t),
      db.prepare("SELECT COUNT(*) as c FROM leads WHERE DATE(created_at) BETWEEN ? AND ?").get(f, t),
    ]);
    return {
      branch: b,
      orders: { count: orders?.c || 0, revenue: orders?.rev || 0 },
      jobs: { count: jobs?.c || 0, revenue: jobs?.rev || 0, completed: jobs?.completed || 0 },
      totalRevenue: (orders?.rev || 0) + (jobs?.rev || 0),
    };
  }));
  res.json({ period: { from: f, to: t }, branches: result });
});


// ── KPI ALERTS ────────────────────────────────────────────

router.get('/kpi-alerts/config', authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.prepare('SELECT * FROM kpi_alerts ORDER BY created_at DESC').all() || [];
  res.json(rows);
});

router.post('/kpi-alerts/config', authMiddleware, adminOnly, async (req, res) => {
  const { metric, operator, threshold, message, is_active } = req.body;
  if (!metric || !threshold) return res.status(400).json({ error: 'metric and threshold required' });
  const id = uuid();
  await db.prepare('INSERT INTO kpi_alerts (id,metric,operator,threshold,message,is_active) VALUES (?,?,?,?,?,?)').run(id, metric, operator || 'lt', threshold, message || '', is_active ? 1 : 1);
  res.status(201).json({ id });
});

router.delete('/kpi-alerts/config/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM kpi_alerts WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// Check and fire KPI alerts — call this on a schedule or on dashboard load
router.post('/kpi-alerts/check', authMiddleware, adminOnly, async (req, res) => {
  const alerts = await db.prepare("SELECT * FROM kpi_alerts WHERE is_active=1").all() || [];
  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.slice(0, 7) + '-01';
  const OWNER_PHONE = process.env.OWNER_PHONE || '';
  const fired = [];

  for (const alert of alerts) {
    let value = 0;
    try {
      if (alert.metric === 'daily_revenue') {
        const r = await db.prepare("SELECT COALESCE(SUM(total_charge),0) as v FROM service_bookings WHERE payment_status='paid' AND DATE(created_at)=?").get(today);
        value = r?.v || 0;
      } else if (alert.metric === 'pending_jobs') {
        const r = await db.prepare("SELECT COUNT(*) as c FROM service_bookings WHERE status IN ('pending','in_progress')").get();
        value = r?.c || 0;
      } else if (alert.metric === 'monthly_revenue') {
        const r = await db.prepare("SELECT COALESCE(SUM(total_charge),0) as v FROM service_bookings WHERE payment_status='paid' AND DATE(created_at)>=?").get(monthStart);
        value = r?.v || 0;
      } else if (alert.metric === 'sla_breached') {
        const r = await db.prepare("SELECT COUNT(*) as c FROM service_bookings WHERE sla_breached=1 AND status NOT IN ('completed','cancelled')").get();
        value = r?.c || 0;
      }

      const triggered = alert.operator === 'lt' ? value < alert.threshold
        : alert.operator === 'gt' ? value > alert.threshold
        : value === alert.threshold;

      if (triggered && OWNER_PHONE) {
        const msg = alert.message || `⚠️ KPI Alert: ${alert.metric} = ${value} (threshold: ${alert.threshold})`;
        const { queueNotification } = await import('../../whatsapp/notifications.js');
        await queueNotification(OWNER_PHONE, msg, 'kpi_alert');
        fired.push({ metric: alert.metric, value, threshold: alert.threshold });
      }
    } catch (e) { console.error("Operation error:", e.message); }
  }
  res.json({ checked: alerts.length, fired: fired.length, alerts: fired });
});


// ── SCHEDULED REPORTS ─────────────────────────────────────

router.post('/scheduled-reports/send', authMiddleware, adminOnly, async (req, res) => {
  const { period = 'daily', branch_id } = req.body;
  const OWNER_PHONE = process.env.OWNER_PHONE || '';
  if (!OWNER_PHONE) return res.status(400).json({ error: 'OWNER_PHONE not set in .env' });

  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.slice(0, 7) + '-01';
  const bFilter = branch_id ? ' AND branch_id=?' : '';
  const bParam = branch_id ? [branch_id] : [];

  const [revenue, jobs, expenses, leads] = await Promise.all([
    db.prepare(`SELECT COALESCE(SUM(total_charge),0) as v FROM service_bookings WHERE payment_status='paid' AND DATE(created_at)=?${bFilter}`).get(today, ...bParam),
    db.prepare(`SELECT COUNT(*) as total, COUNT(CASE WHEN status='completed' THEN 1 END) as done, COUNT(CASE WHEN status IN ('pending','in_progress') THEN 1 END) as pending FROM service_bookings WHERE DATE(created_at)=?${bFilter}`).get(today, ...bParam),
    db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM expenses WHERE date=?${bFilter}`).get(today, ...bParam),
    db.prepare(`SELECT COUNT(*) as c FROM leads WHERE DATE(created_at)=?`).get(today),
  ]);

  const msg = `📊 *AI Laptop Wala — ${period === 'daily' ? 'Daily' : 'Monthly'} Report*
` +
    `📅 ${today}

` +
    `💰 Revenue: ₹${(revenue?.v || 0).toLocaleString('en-IN')}
` +
    `🔧 Jobs: ${jobs?.total || 0} total | ${jobs?.done || 0} done | ${jobs?.pending || 0} pending
` +
    `💸 Expenses: ₹${(expenses?.v || 0).toLocaleString('en-IN')}
` +
    `🎯 New Leads: ${leads?.c || 0}
` +
    `📈 Net: ₹${((revenue?.v || 0) - (expenses?.v || 0)).toLocaleString('en-IN')}`;

  try {
    const { queueNotification } = await import('../../whatsapp/notifications.js');
    await queueNotification(OWNER_PHONE, msg, 'scheduled_report');
    res.json({ message: 'Report sent', phone: OWNER_PHONE });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ── SAVED REPORTS ─────────────────────────────────────────

router.get('/saved-reports', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM saved_reports ORDER BY created_at DESC').all() || []);
});

router.post('/saved-reports', authMiddleware, adminOnly, async (req, res) => {
  const { name, source, fields, filters, sort_by, sort_dir } = req.body;
  if (!name || !source) return res.status(400).json({ error: 'name and source required' });
  const id = uuid();
  await db.prepare('INSERT INTO saved_reports (id,name,source,fields,filters,sort_by,sort_dir) VALUES (?,?,?,?,?,?,?)').run(id, name, source, JSON.stringify(fields || []), JSON.stringify(filters || []), sort_by || '', sort_dir || 'DESC');
  res.status(201).json({ id });
});

router.delete('/saved-reports/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM saved_reports WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});


// ── YEAR-OVER-YEAR COMPARISON ─────────────────────────────
router.get('/yoy-comparison', authMiddleware, adminOnly, async (req, res) => {
  const thisYear = new Date().getFullYear();
  const lastYear = thisYear - 1;
  const [thisRev, lastRev, thisJobs, lastJobs, thisExp, lastExp] = await Promise.all([
    db.prepare("SELECT COALESCE(SUM(total_charge),0) as v FROM service_bookings WHERE payment_status='paid' AND EXTRACT(YEAR FROM created_at)=?").get(thisYear),
    db.prepare("SELECT COALESCE(SUM(total_charge),0) as v FROM service_bookings WHERE payment_status='paid' AND EXTRACT(YEAR FROM created_at)=?").get(lastYear),
    db.prepare("SELECT COUNT(*) as c FROM service_bookings WHERE EXTRACT(YEAR FROM created_at)=?").get(thisYear),
    db.prepare("SELECT COUNT(*) as c FROM service_bookings WHERE EXTRACT(YEAR FROM created_at)=?").get(lastYear),
    db.prepare("SELECT COALESCE(SUM(amount),0) as v FROM expenses WHERE EXTRACT(YEAR FROM date::date)=?").get(thisYear),
    db.prepare("SELECT COALESCE(SUM(amount),0) as v FROM expenses WHERE EXTRACT(YEAR FROM date::date)=?").get(lastYear),
  ]);
  res.json({
    thisYear, lastYear,
    revenue: { current: thisRev?.v || 0, previous: lastRev?.v || 0, change: (thisRev?.v || 0) - (lastRev?.v || 0) },
    jobs: { current: thisJobs?.c || 0, previous: lastJobs?.c || 0, change: (thisJobs?.c || 0) - (lastJobs?.c || 0) },
    expenses: { current: thisExp?.v || 0, previous: lastExp?.v || 0, change: (thisExp?.v || 0) - (lastExp?.v || 0) },
  });
});



// ── P&L STATEMENT ─────────────────────────────────────────

// GET /api/erp/reports/pnl — Profit & Loss statement
router.get('/reports/pnl', authMiddleware, adminOnly, async (req, res) => {
  const { from, to } = req.query;
  const startDate = from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const endDate = to || new Date().toISOString().split('T')[0];

  const revenue = (await db.prepare("SELECT COALESCE(SUM(total),0) as v FROM orders WHERE payment_status='paid' AND DATE(created_at) BETWEEN ? AND ?").get(startDate, endDate))?.v || 0;
  const serviceRevenue = (await db.prepare("SELECT COALESCE(SUM(total),0) as v FROM billing WHERE status='paid' AND type='invoice' AND DATE(created_at) BETWEEN ? AND ?").get(startDate, endDate))?.v || 0;
  const expenses = (await db.prepare("SELECT COALESCE(SUM(amount),0) as v FROM expenses WHERE status='approved' AND DATE(date) BETWEEN ? AND ?").get(startDate, endDate))?.v || 0;
  const salaries = (await db.prepare("SELECT COALESCE(SUM(salary),0) as v FROM staff WHERE is_active=1").get())?.v || 0;
  const monthlySalary = Math.round(salaries * ((new Date(endDate).getTime() - new Date(startDate).getTime()) / (30 * 86400000)));
  const cogs = (await db.prepare("SELECT COALESCE(SUM(total),0) as v FROM purchase_orders WHERE status='received' AND DATE(created_at) BETWEEN ? AND ?").get(startDate, endDate))?.v || 0;

  const totalRevenue = revenue + serviceRevenue;
  const totalExpenses = expenses + monthlySalary + cogs;
  const netProfit = totalRevenue - totalExpenses;

  res.json({
    period: { from: startDate, to: endDate },
    revenue: { orders: revenue, services: serviceRevenue, total: totalRevenue },
    expenses: { operating: expenses, salaries: monthlySalary, cogs, total: totalExpenses },
    net_profit: netProfit,
    margin: totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0,
  });
});

// ── CASH FLOW ─────────────────────────────────────────────

// GET /api/erp/reports/cashflow
router.get('/reports/cashflow', authMiddleware, adminOnly, async (req, res) => {
  const inflow = await db.prepare("SELECT DATE(created_at) as date, SUM(total) as amount FROM orders WHERE payment_status='paid' AND created_at > NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date").all();
  const outflow = await db.prepare("SELECT DATE(date) as date, SUM(amount) as amount FROM expenses WHERE status='approved' AND date > NOW() - INTERVAL '30 days' GROUP BY DATE(date) ORDER BY date").all();
  res.json({ inflow, outflow });
});

export default router;

// GET /api/erp/reports/export/:type — export data as CSV
router.get('/export/:type', authMiddleware, adminOnly, async (req, res) => {
  const { type } = req.params;
  const { from, to } = req.query;
  let rows = [];
  let filename = `${type}-export.csv`;

  if (type === 'orders') {
    rows = await db.prepare(`SELECT order_number, status, total, payment_method, payment_status, created_at FROM orders ${from ? "WHERE DATE(created_at)>='" + from + "'" : ''} ORDER BY created_at DESC LIMIT 5000`).all();
  } else if (type === 'products') {
    rows = await db.prepare('SELECT name, sku, brand, category, price, stock, status FROM products ORDER BY name LIMIT 5000').all();
  } else if (type === 'leads') {
    rows = await db.prepare('SELECT name, phone, email, source, status, priority, score, created_at FROM leads ORDER BY created_at DESC LIMIT 5000').all();
  } else if (type === 'staff') {
    rows = await db.prepare('SELECT name, role, phone, email, salary, joining_date, is_active FROM staff ORDER BY name').all();
  } else if (type === 'expenses') {
    rows = await db.prepare(`SELECT category, amount, description, payment_method, date FROM expenses ${from ? "WHERE date>='" + from + "'" : ''} ORDER BY date DESC LIMIT 5000`).all();
  } else if (type === 'invoices') {
    rows = await db.prepare('SELECT invoice_number, customer_name, total, gst_amount, status, created_at FROM custom_invoices ORDER BY created_at DESC LIMIT 5000').all();
  } else {
    return res.status(400).json({ error: 'Invalid export type' });
  }

  if (rows.length === 0) return res.status(404).json({ error: 'No data to export' });

  // Generate CSV
  const headers = Object.keys(rows[0]).join(',');
  const csvRows = rows.map(r => Object.values(r).map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
  const csv = [headers, ...csvRows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(csv);
});

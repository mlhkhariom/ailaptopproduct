import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminOnly, superAdminOnly } from '../../middleware/adminOnly.js';

const router = Router();

async function auditLog(req, module, action, ref_id, old_value, new_value) {
  try {
    await db.prepare('INSERT INTO audit_log (id, module, action, ref_id, old_value, new_value, user_id, user_name, ip, created_at) VALUES (?,?,?,?,?,?,?,?,?,NOW())')
      .run(uuid(), module, action, ref_id || null, old_value ? JSON.stringify(old_value) : null, new_value ? JSON.stringify(new_value) : null, req.user?.id || 'system', req.user?.name || req.user?.email || 'system', req.ip || '');
  } catch (e) { console.error('Audit log error:', e.message); }
}

// ── Audit Log Helper ─────────────────────────────────────
// ── BRANCHES ──────────────────────────────────────────────

router.get('/branches', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM branches ORDER BY name ASC').all() || []);
});

router.post('/branches', authMiddleware, adminOnly, async (req, res) => {
  const { name, address, phone, manager } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  await db.prepare('INSERT INTO branches (id,name,address,phone,manager) VALUES (?,?,?,?,?)').run(id, name, address, phone, manager);
  res.status(201).json({ id });
});

router.put('/branches/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, address, phone, manager, is_active } = req.body;
  await db.prepare('UPDATE branches SET name=?,address=?,phone=?,manager=?,is_active=? WHERE id=?').run(name, address, phone, manager, is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

// Branch stats
router.get('/branches/:id/stats', authMiddleware, adminOnly, async (req, res) => {
  const bid = req.params.id;
  const [orders, jobs] = await Promise.all([
    db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(total),0) as rev FROM orders WHERE branch_id=? AND payment_status='paid'").get(bid),
    db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(total_charge),0) as rev FROM service_bookings WHERE branch_id=? AND payment_status='paid'").get(bid),
  ]);
  res.json({ orders: orders?.c || 0, orderRevenue: orders?.rev || 0, jobs: jobs?.c || 0, jobRevenue: jobs?.rev || 0 });
});


// ── WHATSAPP TEMPLATES ────────────────────────────────────

router.get('/wa-templates', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM whatsapp_templates WHERE is_active=1 ORDER BY category, name').all() || []);
});

router.post('/wa-templates', authMiddleware, adminOnly, async (req, res) => {
  const { name, category, message, variables } = req.body;
  if (!name || !message) return res.status(400).json({ error: 'name and message required' });
  const id = uuid();
  await db.prepare('INSERT INTO whatsapp_templates (id,name,category,message,variables) VALUES (?,?,?,?,?)').run(id, name, category || 'general', message, JSON.stringify(variables || []));
  res.status(201).json({ id });
});

router.put('/wa-templates/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, category, message, variables, is_active } = req.body;
  await db.prepare('UPDATE whatsapp_templates SET name=?,category=?,message=?,variables=?,is_active=? WHERE id=?').run(name, category, message, JSON.stringify(variables || []), is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

router.delete('/wa-templates/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM whatsapp_templates WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// Send template to a contact
router.post('/wa-templates/:id/send', authMiddleware, adminOnly, async (req, res) => {
  const { phone, variables } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  const tmpl = await db.prepare('SELECT * FROM whatsapp_templates WHERE id=?').get(req.params.id);
  if (!tmpl) return res.status(404).json({ error: 'Template not found' });
  let msg = tmpl.message;
  if (variables) Object.entries(variables).forEach(([k, v]) => { msg = msg.replace(new RegExp(`{{${k}}}`, 'g'), v); });
  try {
    const { queueNotification } = await import('../../whatsapp/notifications.js');
    await queueNotification(phone, msg, 'template');
    res.json({ message: 'Queued' });
  } catch { res.status(500).json({ error: 'Failed to queue' }); }
});



// ── CUSTOMER 360 VIEW ─────────────────────────────────────

router.get('/customer360/:phone', authMiddleware, adminOnly, async (req, res) => {
  const phone = req.params.phone.replace(/[^0-9]/g, '');
  const phoneVariants = [phone, `+91${phone}`, `91${phone}`, phone.slice(-10)];
  const placeholders = phoneVariants.map(() => '?').join(',');

  const [orders, jobs, invoices, leads, contacts] = await Promise.all([
    db.prepare(`SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE u.phone IN (${placeholders}) OR JSON_EXTRACT(o.address,'$.phone') IN (${placeholders}) ORDER BY o.created_at DESC LIMIT 20`).all(...phoneVariants, ...phoneVariants),
    db.prepare(`SELECT * FROM service_bookings WHERE customer_phone IN (${placeholders}) ORDER BY created_at DESC LIMIT 20`).all(...phoneVariants),
    db.prepare(`SELECT * FROM custom_invoices WHERE customer_phone IN (${placeholders}) ORDER BY created_at DESC LIMIT 20`).all(...phoneVariants),
    db.prepare(`SELECT * FROM leads WHERE phone IN (${placeholders}) ORDER BY created_at DESC LIMIT 10`).all(...phoneVariants),
    db.prepare(`SELECT * FROM contact_queries WHERE phone IN (${placeholders}) ORDER BY created_at DESC LIMIT 10`).all(...phoneVariants),
  ]);

  const totalSpent = [
    ...orders.filter(o => o.payment_status === 'paid').map(o => o.total || 0),
    ...jobs.filter(j => j.payment_status === 'paid').map(j => j.total_charge || 0),
    ...invoices.filter(i => i.payment_status === 'paid').map(i => i.total || 0),
  ].reduce((s, v) => s + v, 0);

  res.json({ phone, orders, jobs, invoices, leads, contacts, totalSpent, totalTransactions: orders.length + jobs.length + invoices.length });
});


// ── INTER-BRANCH STOCK TRANSFER ───────────────────────────

router.post('/stock-transfer', authMiddleware, adminOnly, async (req, res) => {
  const { product_id, from_branch, to_branch, quantity, notes } = req.body;
  if (!product_id || !from_branch || !to_branch || !quantity) return res.status(400).json({ error: 'All fields required' });
  if (from_branch === to_branch) return res.status(400).json({ error: 'Same branch' });

  const product = await db.prepare('SELECT * FROM products WHERE id=?').get(product_id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if ((product.stock || 0) < quantity) return res.status(400).json({ error: `Insufficient stock. Available: ${product.stock}` });

  const transferId = uuid();
  // Deduct from source
  await db.prepare('UPDATE products SET stock=stock-? WHERE id=?').run(quantity, product_id);
  await db.prepare('INSERT INTO stock_movements (id,product_id,type,quantity,reference_id,reference_type,notes,created_by) VALUES (?,?,?,?,?,?,?,?)')
    .run(uuid(), product_id, 'transfer_out', quantity, transferId, 'branch_transfer', `Transfer to ${to_branch}: ${notes || ''}`, req.user.id);

  // In a real multi-branch system, each branch would have its own stock table
  // For now, log the transfer and notify
  await db.prepare('INSERT INTO stock_movements (id,product_id,type,quantity,reference_id,reference_type,notes,created_by) VALUES (?,?,?,?,?,?,?,?)')
    .run(uuid(), product_id, 'transfer_in', quantity, transferId, 'branch_transfer', `Transfer from ${from_branch}: ${notes || ''}`, req.user.id);

  await db.prepare('INSERT INTO notifications (id,type,title,message,link) VALUES (?,?,?,?,?)')
    .run(uuid(), 'inventory', 'Stock Transfer', `${quantity}x ${product.name} transferred to ${to_branch}`, '/admin/inventory');

  res.status(201).json({ transfer_id: transferId, message: `${quantity} units transferred` });
});


// ── SERIAL NUMBERS ────────────────────────────────────────

router.get('/serials', authMiddleware, adminOnly, async (req, res) => {
  const { product_id, status } = req.query;
  let q = `SELECT sn.*, p.name as product_name FROM serial_numbers sn LEFT JOIN products p ON sn.product_id=p.id WHERE 1=1`;
  const p = [];
  if (product_id) { q += ' AND sn.product_id=?'; p.push(product_id); }
  if (status) { q += ' AND sn.status=?'; p.push(status); }
  q += ' ORDER BY sn.created_at DESC';
  res.json(await db.prepare(q).all(...p) || []);
});

router.post('/serials', authMiddleware, adminOnly, async (req, res) => {
  const { product_id, serial, notes } = req.body;
  if (!product_id || !serial) return res.status(400).json({ error: 'product_id and serial required' });
  const id = uuid();
  await db.prepare('INSERT INTO serial_numbers (id,product_id,serial,notes) VALUES (?,?,?,?)').run(id, product_id, serial.trim().toUpperCase(), notes);
  res.status(201).json({ id });
});

router.get('/serials/lookup/:serial', async (req, res) => {
  const row = await db.prepare(`SELECT sn.*, p.name as product_name FROM serial_numbers sn LEFT JOIN products p ON sn.product_id=p.id WHERE sn.serial=?`).get(req.params.serial.trim().toUpperCase());
  if (!row) return res.status(404).json({ error: 'Serial not found' });
  res.json(row);
});


// ── PRODUCT BUNDLES ───────────────────────────────────────

router.get('/bundles', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM product_bundles WHERE is_active=1 ORDER BY name ASC').all() || []);
});

router.post('/bundles', authMiddleware, adminOnly, async (req, res) => {
  const { name, description, price, components } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'name and price required' });
  const id = uuid();
  await db.prepare('INSERT INTO product_bundles (id,name,description,price,components) VALUES (?,?,?,?,?)').run(id, name, description, price, JSON.stringify(components || []));
  res.status(201).json({ id });
});

router.put('/bundles/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, description, price, components, is_active } = req.body;
  await db.prepare('UPDATE product_bundles SET name=?,description=?,price=?,components=?,is_active=? WHERE id=?').run(name, description, price, JSON.stringify(components || []), is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});


// ── CUSTOM REPORT BUILDER ─────────────────────────────────

const REPORT_SOURCES = {
  orders: { table: 'orders', label: 'Orders', fields: ['id','invoice_number','customer_name','customer_phone','total','payment_status','payment_method','created_at'] },
  service_bookings: { table: 'service_bookings', label: 'Job Cards', fields: ['booking_number','customer_name','customer_phone','service_name','device_brand','device_model','technician','status','total_charge','payment_status','created_at'] },
  custom_invoices: { table: 'custom_invoices', label: 'Custom Invoices', fields: ['invoice_number','customer_name','customer_phone','subtotal','discount','total','payment_status','payment_method','created_at'] },
  leads: { table: 'leads', label: 'CRM Leads', fields: ['name','phone','email','source','status','budget','assigned_to','created_at'] },
  products: { table: 'products', label: 'Products', fields: ['name','category','price','stock','status','created_at'] },
  staff: { table: 'staff', label: 'Staff', fields: ['name','role','phone','email','salary','is_active','created_at'] },
  expenses: { table: 'expenses', label: 'Expenses', fields: ['title','category','amount','date','staff_name','notes'] },
  payroll: { table: 'payroll', label: 'Payroll', fields: ['month','basic','hra','gross','pf_employee','esi_employee','net','status','paid_on'] },
};

router.post('/report-builder/run', authMiddleware, adminOnly, async (req, res) => {
  const { source, fields, filters = [], sort_by, sort_dir = 'DESC', limit = 500 } = req.body;
  const src = REPORT_SOURCES[source];
  if (!src) return res.status(400).json({ error: 'Invalid source' });

  // Only allow whitelisted fields
  const allowed = src.fields;
  const cols = (fields?.length ? fields.filter(f => allowed.includes(f)) : allowed);
  if (!cols.length) return res.status(400).json({ error: 'No valid fields' });

  // Build WHERE
  const conditions = [];
  const params = [];
  for (const f of filters) {
    if (!allowed.includes(f.field)) continue;
    if (f.op === 'eq')   { conditions.push(`${f.field} = ?`); params.push(f.value); }
    if (f.op === 'like') { conditions.push(`${f.field} ILIKE ?`); params.push(`%${f.value}%`); }
    if (f.op === 'gte')  { conditions.push(`${f.field} >= ?`); params.push(f.value); }
    if (f.op === 'lte')  { conditions.push(`${f.field} <= ?`); params.push(f.value); }
    if (f.op === 'date_from') { conditions.push(`DATE(${f.field}) >= ?`); params.push(f.value); }
    if (f.op === 'date_to')   { conditions.push(`DATE(${f.field}) <= ?`); params.push(f.value); }
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = sort_by && allowed.includes(sort_by) ? `ORDER BY ${sort_by} ${sort_dir === 'ASC' ? 'ASC' : 'DESC'}` : 'ORDER BY created_at DESC';
  const sql = `SELECT ${cols.join(',')} FROM ${src.table} ${where} ${orderBy} LIMIT ?`;

  try {
    const rows = await db.prepare(sql).all(...params, Math.min(limit, 1000)) || [];
    res.json({ rows, cols, total: rows.length, source: src.label });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Export CSV
router.post('/report-builder/export', authMiddleware, adminOnly, async (req, res) => {
  const { source, fields, filters = [], sort_by, sort_dir = 'DESC' } = req.body;
  const src = REPORT_SOURCES[source];
  if (!src) return res.status(400).json({ error: 'Invalid source' });
  const allowed = src.fields;
  const cols = (fields?.length ? fields.filter(f => allowed.includes(f)) : allowed);

  const conditions = [];
  const params = [];
  for (const f of filters) {
    if (!allowed.includes(f.field)) continue;
    if (f.op === 'eq')   { conditions.push(`${f.field} = ?`); params.push(f.value); }
    if (f.op === 'like') { conditions.push(`${f.field} ILIKE ?`); params.push(`%${f.value}%`); }
    if (f.op === 'gte')  { conditions.push(`${f.field} >= ?`); params.push(f.value); }
    if (f.op === 'lte')  { conditions.push(`${f.field} <= ?`); params.push(f.value); }
    if (f.op === 'date_from') { conditions.push(`DATE(${f.field}) >= ?`); params.push(f.value); }
    if (f.op === 'date_to')   { conditions.push(`DATE(${f.field}) <= ?`); params.push(f.value); }
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = sort_by && allowed.includes(sort_by) ? `ORDER BY ${sort_by} ${sort_dir === 'ASC' ? 'ASC' : 'DESC'}` : '';
  const rows = await db.prepare(`SELECT ${cols.join(',')} FROM ${src.table} ${where} ${orderBy} LIMIT 10000`).all(...params) || [];

  const csv = [cols, ...rows.map(r => cols.map(c => `"${(r[c] ?? '').toString().replace(/"/g, '""')}"`))]
    .map(r => r.join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=report_${source}_${Date.now()}.csv`);
  res.send(csv);
});

// Get available sources + fields
router.get('/report-builder/sources', authMiddleware, adminOnly, (req, res) => {
  res.json(Object.entries(REPORT_SOURCES).map(([key, v]) => ({ key, label: v.label, fields: v.fields })));
});


// ── BRANCH-WISE INVENTORY ─────────────────────────────────

// Get stock for all products in a branch
router.get('/branch-stock', authMiddleware, adminOnly, async (req, res) => {
  const { branch_id } = req.query;
  const rows = branch_id
    ? await db.prepare(`SELECT bs.*, p.name as product_name, p.category, p.price, p.sku FROM branch_stock bs LEFT JOIN products p ON p.id=bs.product_id WHERE bs.branch_id=? ORDER BY p.name`).all(branch_id)
    : await db.prepare(`SELECT bs.*, p.name as product_name, p.category, p.price, p.sku, b.name as branch_name FROM branch_stock bs LEFT JOIN products p ON p.id=bs.product_id LEFT JOIN branches b ON b.id=bs.branch_id ORDER BY b.name, p.name`).all();
  res.json(rows || []);
});

// Update stock for a product in a branch
router.post('/branch-stock/adjust', authMiddleware, adminOnly, async (req, res) => {
  const { branch_id, product_id, qty, type = 'manual', note = '' } = req.body;
  if (!branch_id || !product_id || qty === undefined) return res.status(400).json({ error: 'branch_id, product_id, qty required' });

  // Upsert branch_stock
  const existing = await db.prepare('SELECT * FROM branch_stock WHERE branch_id=? AND product_id=?').get(branch_id, product_id);
  if (existing) {
    const newStock = Math.max(0, (existing.stock || 0) + qty);
    await db.prepare('UPDATE branch_stock SET stock=? WHERE branch_id=? AND product_id=?').run(newStock, branch_id, product_id);
  } else {
    await db.prepare('INSERT INTO branch_stock (id,branch_id,product_id,stock) VALUES (?,?,?,?)').run(uuid(), branch_id, product_id, Math.max(0, qty));
  }
  // Sync global stock = sum of all branch stocks
  const totalStock = await db.prepare('SELECT COALESCE(SUM(stock),0) as t FROM branch_stock WHERE product_id=?').get(product_id);
  await db.prepare('UPDATE products SET stock=? WHERE id=?').run(totalStock?.t || 0, product_id);
  // Sync global stock = sum of all branch stocks
  // Log movement
  await db.prepare('INSERT INTO branch_stock_movements (id,branch_id,product_id,type,qty,note) VALUES (?,?,?,?,?,?)').run(uuid(), branch_id, product_id, type, qty, note);
  res.json({ message: 'Stock updated' });
});

// Transfer stock between branches
router.post('/branch-stock/transfer', authMiddleware, adminOnly, async (req, res) => {
  const { from_branch, to_branch, product_id, qty, note = '' } = req.body;
  if (!from_branch || !to_branch || !product_id || !qty) return res.status(400).json({ error: 'All fields required' });

  const src = await db.prepare('SELECT * FROM branch_stock WHERE branch_id=? AND product_id=?').get(from_branch, product_id);
  if (!src || src.stock < qty) return res.status(400).json({ error: `Insufficient stock. Available: ${src?.stock || 0}` });

  await db.prepare('UPDATE branch_stock SET stock=stock-? WHERE branch_id=? AND product_id=?').run(qty, from_branch, product_id);
  const dest = await db.prepare('SELECT * FROM branch_stock WHERE branch_id=? AND product_id=?').get(to_branch, product_id);
  if (dest) {
    await db.prepare('UPDATE branch_stock SET stock=stock+? WHERE branch_id=? AND product_id=?').run(qty, to_branch, product_id);
  } else {
    await db.prepare('INSERT INTO branch_stock (id,branch_id,product_id,stock) VALUES (?,?,?,?)').run(uuid(), to_branch, product_id, qty);
  }
  // Log both movements
  await db.prepare('INSERT INTO branch_stock_movements (id,branch_id,product_id,type,qty,note) VALUES (?,?,?,?,?,?)').run(uuid(), from_branch, product_id, 'transfer_out', -qty, note);
  await db.prepare('INSERT INTO branch_stock_movements (id,branch_id,product_id,type,qty,note) VALUES (?,?,?,?,?,?)').run(uuid(), to_branch, product_id, 'transfer_in', qty, note);
  res.json({ message: `Transferred ${qty} units` });
});

// Stock movements log
router.get('/branch-stock/movements', authMiddleware, adminOnly, async (req, res) => {
  const { branch_id, product_id } = req.query;
  let sql = `SELECT m.*, p.name as product_name, b.name as branch_name FROM branch_stock_movements m LEFT JOIN products p ON p.id=m.product_id LEFT JOIN branches b ON b.id=m.branch_id WHERE 1=1`;
  const params = [];
  if (branch_id) { sql += ' AND m.branch_id=?'; params.push(branch_id); }
  if (product_id) { sql += ' AND m.product_id=?'; params.push(product_id); }
  sql += ' ORDER BY m.created_at DESC LIMIT 200';
  res.json(await db.prepare(sql).all(...params) || []);
});

// Branch stock summary (for dashboard)
router.get('/branch-stock/summary', authMiddleware, adminOnly, async (req, res) => {
  const branches = await db.prepare('SELECT * FROM branches WHERE is_active=1').all() || [];
  const result = await Promise.all(branches.map(async b => {
    const stats = await db.prepare(`SELECT COUNT(*) as products, COALESCE(SUM(bs.stock),0) as total_stock, COALESCE(SUM(bs.stock * p.price),0) as stock_value, COUNT(CASE WHEN bs.stock <= bs.reorder_level THEN 1 END) as low_stock FROM branch_stock bs LEFT JOIN products p ON p.id=bs.product_id WHERE bs.branch_id=?`).get(b.id);
    return { branch: b, ...stats };
  }));
  res.json(result);
});


// ── LOYALTY PROGRAM ───────────────────────────────────────

router.get('/loyalty/:phone', authMiddleware, adminOnly, async (req, res) => {
  const row = await db.prepare('SELECT * FROM loyalty_points WHERE phone=?').get(req.params.phone);
  if (!row) return res.json({ phone: req.params.phone, points: 0, tier: 'Bronze', transactions: [] });
  const txns = await db.prepare('SELECT * FROM loyalty_transactions WHERE phone=? ORDER BY created_at DESC LIMIT 20').all(req.params.phone) || [];
  const tier = row.points >= 5000 ? 'Platinum' : row.points >= 2000 ? 'Gold' : row.points >= 500 ? 'Silver' : 'Bronze';
  res.json({ ...row, tier, transactions: txns });
});

router.post('/loyalty/earn', authMiddleware, adminOnly, async (req, res) => {
  const { phone, customer_name, amount, ref_id, ref_type } = req.body;
  if (!phone || !amount) return res.status(400).json({ error: 'phone and amount required' });
  const points = Math.floor(amount / 100); // 1 point per ₹100
  const existing = await db.prepare('SELECT * FROM loyalty_points WHERE phone=?').get(phone);
  if (existing) {
    await db.prepare('UPDATE loyalty_points SET points=points+?, total_earned=total_earned+?, customer_name=COALESCE(?,customer_name) WHERE phone=?').run(points, points, customer_name, phone);
  } else {
    await db.prepare('INSERT INTO loyalty_points (id,phone,customer_name,points,total_earned) VALUES (?,?,?,?,?)').run(uuid(), phone, customer_name || '', points, points);
  }
  await db.prepare('INSERT INTO loyalty_transactions (id,phone,type,points,ref_id,ref_type,note) VALUES (?,?,?,?,?,?,?)').run(uuid(), phone, 'earn', points, ref_id || null, ref_type || 'manual', `Earned ${points} pts on ₹${amount}`);
  res.json({ points_earned: points, message: `${points} points added` });
});

router.post('/loyalty/redeem', authMiddleware, adminOnly, async (req, res) => {
  const { phone, points, ref_id } = req.body;
  if (!phone || !points) return res.status(400).json({ error: 'phone and points required' });
  const existing = await db.prepare('SELECT * FROM loyalty_points WHERE phone=?').get(phone);
  if (!existing || existing.points < points) return res.status(400).json({ error: `Insufficient points. Available: ${existing?.points || 0}` });
  const discount = Math.floor(points / 10); // 10 points = ₹1 discount
  await db.prepare('UPDATE loyalty_points SET points=points-?, total_redeemed=total_redeemed+? WHERE phone=?').run(points, points, phone);
  await db.prepare('INSERT INTO loyalty_transactions (id,phone,type,points,ref_id,note) VALUES (?,?,?,?,?,?)').run(uuid(), phone, 'redeem', -points, ref_id || null, `Redeemed ${points} pts = ₹${discount} discount`);
  res.json({ points_redeemed: points, discount_amount: discount });
});

router.get('/loyalty', authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.prepare("SELECT *, CASE WHEN points>=5000 THEN 'Platinum' WHEN points>=2000 THEN 'Gold' WHEN points>=500 THEN 'Silver' ELSE 'Bronze' END as tier FROM loyalty_points ORDER BY points DESC LIMIT 100").all() || [];
  res.json(rows);
});


// ── AUDIT LOG ─────────────────────────────────────────────
router.get('/audit-log', authMiddleware, adminOnly, async (req, res) => {
  const { module, user_id, from, to, limit = 100 } = req.query;
  let q = 'SELECT * FROM audit_log WHERE 1=1';
  const params = [];
  if (module) { q += ' AND module=?'; params.push(module); }
  if (user_id) { q += ' AND user_id=?'; params.push(user_id); }
  if (from) { q += ' AND DATE(created_at)>=?'; params.push(from); }
  if (to) { q += ' AND DATE(created_at)<=?'; params.push(to); }
  q += ' ORDER BY created_at DESC LIMIT ?';
  params.push(parseInt(limit));
  res.json(await db.prepare(q).all(...params) || []);
});


// ── INVOICE SETTINGS ──────────────────────────────────────
router.get('/invoice-settings', authMiddleware, adminOnly, async (req, res) => {
  const row = await db.prepare("SELECT value FROM site_settings WHERE key='invoice_settings'").get();
  res.json(row?.value ? JSON.parse(row.value) : { logo_url: 'https://ailaptopwala.com/assets/logo.png', company_name: 'AI Laptop Wala', tagline: 'Buy, Sell & Repair Laptops', address: 'Silver Mall, LB-21, RNT Marg, Indore', phone: '+91 98934 96163', email: 'info@ailaptopwala.com', gstin: '23ATNPA4415H1Z2', primary_color: '#FF8000', footer_text: 'Thank you for your business!' });
});
router.put('/invoice-settings', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare("INSERT INTO site_settings (key,value) VALUES ('invoice_settings',?) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value").run(JSON.stringify(req.body));
  res.json({ message: 'Saved' });
});


// ── BACKUP & DATA ─────────────────────────────────────────

import { exec as execBackup } from 'child_process';
import { promisify as promisifyBackup } from 'util';
const execPromiseBackup = promisifyBackup(execBackup);

router.get('/backup/download', authMiddleware, adminOnly, async (req, res) => {
  try {
    // Export all main tables as JSON
    const tables = ['users', 'products', 'orders', 'service_bookings', 'leads', 'staff', 'expenses', 'branches', 'branch_stock', 'custom_invoices', 'categories', 'app_settings', 'site_settings'];
    const backup = { version: '1.0', created_at: new Date().toISOString(), data: {} };
    for (const t of tables) {
      try {
        const rows = await db.prepare(`SELECT * FROM ${t}`).all() || [];
        backup.data[t] = rows;
      } catch (e) { backup.data[t] = { error: e.message }; }
    }
    const filename = `ailaptopwala-backup-${new Date().toISOString().slice(0,10)}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/backup/status', authMiddleware, adminOnly, async (req, res) => {
  const row = await db.prepare("SELECT value FROM app_settings WHERE key='last_backup_at'").get();
  res.json({ last_backup: row?.value || null });
});

router.post('/backup/run', authMiddleware, adminOnly, async (req, res) => {
  // Mark backup time
  const now = new Date().toISOString();
  await db.prepare(`INSERT INTO app_settings (key, value, category, updated_at) VALUES ('last_backup_at', ?, 'backup', NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`).run(now);
  res.json({ message: 'Backup marked', timestamp: now });
});

router.post('/cache/clear', authMiddleware, adminOnly, async (req, res) => {
  // Clear notification queue + stale sessions
  try {
    await db.prepare("DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days'").run();
    await db.prepare("DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '90 days'").run();
    res.json({ message: 'Cache cleared — old notifications + audit logs removed' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/settings/reset', authMiddleware, superAdminOnly, async (req, res) => {
  // Reset non-critical app settings
  await db.prepare("DELETE FROM app_settings WHERE category NOT IN ('critical', 'api')").run();
  res.json({ message: 'Settings reset to defaults (API keys preserved)' });
});

export default router;

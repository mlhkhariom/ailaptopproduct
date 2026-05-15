import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminOnly, superAdminOnly, canAccess } from '../../middleware/adminOnly.js';

const router = Router();

async function auditLog(req, module, action, ref_id, old_value, new_value) {
  try {
    await db.prepare('INSERT INTO audit_log (id, module, action, ref_id, old_value, new_value, user_id, user_name, ip, created_at) VALUES (?,?,?,?,?,?,?,?,?,NOW())')
      .run(uuid(), module, action, ref_id || null, old_value ? JSON.stringify(old_value) : null, new_value ? JSON.stringify(new_value) : null, req.user?.id || 'system', req.user?.name || req.user?.email || 'system', req.ip || '');
  } catch (e) { console.error('Audit log error:', e.message); }
}

// ── EXPENSES ──────────────────────────────────────────────

router.get('/expenses', authMiddleware, adminOnly, async (req, res) => {
  const { from, to, branch_id } = req.query;
  let q = 'SELECT * FROM expenses WHERE 1=1';
  const params = [];
  if (from) { q += ' AND date>=?'; params.push(from); }
  if (to) { q += ' AND date<=?'; params.push(to); }
  if (branch_id) { q += ' AND branch_id=?'; params.push(branch_id); }
  q += ' ORDER BY date DESC, created_at DESC';
  res.json(await db.prepare(q).all(...params) || []);
});

router.post('/expenses', authMiddleware, adminOnly, async (req, res) => {
  const { category, amount, description, payment_method, date, branch_id } = req.body;
  if (!category || !amount) return res.status(400).json({ error: 'category and amount required' });
  const id = uuid();
  await db.prepare('INSERT INTO expenses (id,category,amount,description,payment_method,date,branch_id,created_by) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, category, amount, description, payment_method || 'cash', date || new Date().toISOString().split('T')[0], branch_id || null, req.user.id);
  await auditLog(req, 'expense', 'created', id, null, { category, amount });
  res.status(201).json({ id });
});

router.delete('/expenses/:id', authMiddleware, adminOnly, async (req, res) => {
  await auditLog(req, 'expense', 'deleted', req.params.id, null, null);
  await db.prepare('DELETE FROM expenses WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

router.put('/expenses/:id', authMiddleware, adminOnly, async (req, res) => {
  const { category, amount, description, payment_method, date } = req.body;
  await db.prepare('UPDATE expenses SET category=?,amount=?,description=?,payment_method=?,date=? WHERE id=?')
    .run(category, amount, description, payment_method, date, req.params.id);
  res.json({ message: 'Updated' });
});


// ── GST REPORT ────────────────────────────────────────────

router.get('/gst-report', authMiddleware, adminOnly, async (req, res) => {
  const { from, to } = req.query;
  const today = new Date().toISOString().split('T')[0];
  const f = from || today.slice(0, 7) + '-01';
  const t = to || today;

  // B2C sales (orders)
  const orders = await db.prepare(`SELECT o.order_number, o.total, o.created_at, u.name as customer_name, u.phone
    FROM orders o LEFT JOIN users u ON o.user_id=u.id
    WHERE o.payment_status='paid' AND DATE(o.created_at) BETWEEN ? AND ?`).all(f, t) || [];

  // Service invoices with GST
  const services = await db.prepare(`SELECT booking_number, customer_name, customer_phone, total_charge, labour_charge, parts_charge, gst_enabled, created_at
    FROM service_bookings WHERE payment_status='paid' AND DATE(created_at) BETWEEN ? AND ?`).all(f, t) || [];

  // Custom invoices with GST
  const customs = await db.prepare(`SELECT invoice_number, customer_name, customer_phone, total, subtotal, discount, gst_enabled, created_at
    FROM custom_invoices WHERE payment_status='paid' AND DATE(created_at) BETWEEN ? AND ?`).all(f, t) || [];

  const serviceGST = services.filter(s => s.gst_enabled).reduce((sum, s) => sum + Math.round((s.total_charge || 0) * 0.18), 0);
  const customGST = customs.filter(c => c.gst_enabled).reduce((sum, c) => {
    const after = (c.subtotal || 0) - (c.discount || 0);
    return sum + Math.round(after * 0.18);
  }, 0);
  const totalGST = serviceGST + customGST;

  res.json({
    period: { from: f, to: t },
    orders: { count: orders.length, total: orders.reduce((s, o) => s + (o.total || 0), 0), items: orders },
    services: { count: services.length, total: services.reduce((s, j) => s + (j.total_charge || 0), 0), gst: serviceGST, items: services },
    customs: { count: customs.length, total: customs.reduce((s, c) => s + (c.total || 0), 0), gst: customGST, items: customs },
    summary: { totalGST, cgst: Math.round(totalGST / 2), sgst: Math.round(totalGST / 2) },
  });
});


// ── COMMISSION TRACKING ───────────────────────────────────

router.get('/commissions', authMiddleware, adminOnly, async (req, res) => {
  const { staff_id, status } = req.query;
  let q = 'SELECT * FROM commissions WHERE 1=1';
  const p = [];
  if (staff_id) { q += ' AND staff_id=?'; p.push(staff_id); }
  if (status) { q += ' AND status=?'; p.push(status); }
  q += ' ORDER BY created_at DESC';
  res.json(await db.prepare(q).all(...p) || []);
});

router.post('/commissions', authMiddleware, adminOnly, async (req, res) => {
  const { staff_id, staff_name, reference_type, reference_id, amount, rate } = req.body;
  if (!staff_id || !amount) return res.status(400).json({ error: 'staff_id and amount required' });
  const id = uuid();
  await db.prepare('INSERT INTO commissions (id,staff_id,staff_name,reference_type,reference_id,amount,rate) VALUES (?,?,?,?,?,?,?)').run(id, staff_id, staff_name, reference_type || 'manual', reference_id || '', amount, rate || 0);
  res.status(201).json({ id });
});

router.patch('/commissions/:id/pay', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare("UPDATE commissions SET status='paid' WHERE id=?").run(req.params.id);
  res.json({ message: 'Marked as paid' });
});

router.get('/commissions/summary', authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.prepare(`SELECT staff_id, staff_name,
    COALESCE(SUM(amount),0) as total,
    COALESCE(SUM(CASE WHEN status='pending' THEN amount ELSE 0 END),0) as pending,
    COALESCE(SUM(CASE WHEN status='paid' THEN amount ELSE 0 END),0) as paid,
    COUNT(*) as count FROM commissions GROUP BY staff_id, staff_name ORDER BY total DESC`).all();
  res.json(rows || []);
});



// ── GSTR-1 EXPORT ─────────────────────────────────────────

router.get('/gstr1-export', authMiddleware, adminOnly, async (req, res) => {
  const { from, to, branch_id } = req.query;
  const f = from || new Date().toISOString().slice(0, 7) + '-01';
  const t = to || new Date().toISOString().split('T')[0];

  const bFilter = branch_id ? ' AND branch_id=?' : '';
  const bParam = branch_id ? [branch_id] : [];
  const services = await db.prepare(`SELECT booking_number as invoice_no, customer_name, customer_phone, total_charge as taxable_value, gst_enabled, created_at FROM service_bookings WHERE payment_status='paid' AND gst_enabled=1 AND DATE(created_at) BETWEEN ? AND ?${bFilter}`).all(f, t, ...bParam) || [];
  const customs = await db.prepare(`SELECT invoice_number as invoice_no, customer_name, customer_phone, (subtotal-discount) as taxable_value, gst_enabled, created_at FROM custom_invoices WHERE payment_status='paid' AND gst_enabled=1 AND DATE(created_at) BETWEEN ? AND ?${bFilter}`).all(f, t, ...bParam) || [];

  const allInvoices = [...services, ...customs].map(inv => ({
    invoice_no: inv.invoice_no,
    invoice_date: new Date(inv.created_at).toLocaleDateString('en-IN'),
    customer_name: inv.customer_name,
    customer_phone: inv.customer_phone,
    taxable_value: Math.round(inv.taxable_value || 0),
    cgst_rate: 9, cgst_amount: Math.round((inv.taxable_value || 0) * 0.09),
    sgst_rate: 9, sgst_amount: Math.round((inv.taxable_value || 0) * 0.09),
    total_tax: Math.round((inv.taxable_value || 0) * 0.18),
    invoice_value: Math.round((inv.taxable_value || 0) * 1.18),
  }));

  const totalTaxable = allInvoices.reduce((s, i) => s + i.taxable_value, 0);
  const totalTax = allInvoices.reduce((s, i) => s + i.total_tax, 0);

  // CSV format
  const headers = ['Invoice No', 'Invoice Date', 'Customer Name', 'Phone', 'Taxable Value', 'CGST Rate', 'CGST Amount', 'SGST Rate', 'SGST Amount', 'Total Tax', 'Invoice Value'];
  const rows = allInvoices.map(i => [i.invoice_no, i.invoice_date, i.customer_name, i.customer_phone, i.taxable_value, i.cgst_rate + '%', i.cgst_amount, i.sgst_rate + '%', i.sgst_amount, i.total_tax, i.invoice_value]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=GSTR1_${f}_${t}.csv`);
  res.send(csv);
});


// ── E-INVOICE (IRN) ───────────────────────────────────────
// NIC IRP API integration — sandbox mode by default
// Credentials read from DB first (admin settings), env fallback

// ── Get E-Invoice config dynamically per request ──────────
async function getEinvoiceConfig() {
  const { Config } = await import('../../lib/config.js');
  return {
    BASE: await Config.einvoiceBase(),
    GSTIN: await Config.einvoiceGstin(),
    USER: await Config.einvoiceUsername(),
    PASS: await Config.einvoicePassword(),
    APPKEY: await Config.einvoiceAppKey(),
  };
}

// Build invoice payload per NIC schema
function buildIRNPayload(inv, gstin) {
  const items = (() => { try { return typeof inv.items === 'string' ? JSON.parse(inv.items) : (inv.items || []); } catch { return []; } })();
  const taxable = inv.subtotal || inv.total_charge || 0;
  const discount = inv.discount || 0;
  const net = taxable - discount;
  const cgst = parseFloat((net * 0.09).toFixed(2));
  const sgst = parseFloat((net * 0.09).toFixed(2));
  const total = parseFloat((net + cgst + sgst).toFixed(2));

  return {
    Version: '1.1',
    TranDtls: { TaxSch: 'GST', SupTyp: 'B2B', RegRev: 'N' },
    DocDtls: {
      Typ: 'INV',
      No: inv.invoice_number || inv.booking_number || inv.id.slice(0, 16),
      Dt: new Date(inv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/'),
    },
    SellerDtls: {
      Gstin: gstin, LglNm: 'AI Laptop Wala',
      Addr1: 'Silver Mall, Vijay Nagar', Loc: 'Indore', Pin: 452010, Stcd: '23',
    },
    BuyerDtls: {
      Gstin: inv.buyer_gstin || 'URP',
      LglNm: inv.customer_name || 'Consumer',
      Pos: '23', Addr1: inv.customer_address || 'Indore', Loc: 'Indore', Pin: 452001, Stcd: '23',
    },
    ItemList: items.length ? items.map((item, i) => ({
      SlNo: String(i + 1), PrdDesc: item.name || 'Service', IsServc: 'Y',
      Qty: item.qty || 1, Unit: 'NOS', UnitPrice: item.price || 0,
      TotAmt: (item.qty || 1) * (item.price || 0),
      Discount: 0, AssAmt: (item.qty || 1) * (item.price || 0),
      GstRt: 18, IgstAmt: 0, CgstAmt: parseFloat(((item.qty || 1) * (item.price || 0) * 0.09).toFixed(2)),
      SgstAmt: parseFloat(((item.qty || 1) * (item.price || 0) * 0.09).toFixed(2)),
      TotItemVal: parseFloat(((item.qty || 1) * (item.price || 0) * 1.18).toFixed(2)),
    })) : [{
      SlNo: '1', PrdDesc: 'Repair Service', IsServc: 'Y',
      Qty: 1, Unit: 'NOS', UnitPrice: net, TotAmt: net,
      Discount: 0, AssAmt: net, GstRt: 18,
      IgstAmt: 0, CgstAmt: cgst, SgstAmt: sgst, TotItemVal: total,
    }],
    ValDtls: {
      AssVal: net, CgstVal: cgst, SgstVal: sgst, IgstVal: 0,
      TotInvVal: total, Discount: discount,
    },
  };
}

// Generate IRN for a custom invoice
router.post('/einvoice/generate', authMiddleware, adminOnly, async (req, res) => {
  const { invoice_id, invoice_type = 'custom', buyer_gstin, customer_address } = req.body;
  if (!invoice_id) return res.status(400).json({ error: 'invoice_id required' });

  const table = invoice_type === 'service' ? 'service_bookings' : 'custom_invoices';
  const inv = await db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(invoice_id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  if (inv.irn) return res.status(400).json({ error: 'IRN already generated', irn: inv.irn });

  const ein = await getEinvoiceConfig();
  const payload = buildIRNPayload({ ...inv, buyer_gstin, customer_address }, ein.GSTIN);

  // If credentials set → call real NIC API, else mock
  let irnData;
  if (ein.USER && ein.PASS) {
    try {
      // Step 1: Authenticate
      const authRes = await fetch(`${ein.BASE}/eivital/v1.03/Auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Gstin': ein.GSTIN, 'user_name': ein.USER, 'password': ein.PASS, 'AppKey': ein.APPKEY, 'AuthToken': '' },
        body: JSON.stringify({ UserName: ein.USER, Password: ein.PASS, AppKey: ein.APPKEY, ForceRefreshAccessToken: false }),
      });
      const authData = await authRes.json();
      const token = authData?.Data?.AuthToken;
      if (!token) return res.status(502).json({ error: 'NIC auth failed', detail: authData });

      // Step 2: Generate IRN
      const irnRes = await fetch(`${ein.BASE}/eicore/v1.03/Invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Gstin': ein.GSTIN, 'user_name': ein.USER, 'AuthToken': token },
        body: JSON.stringify(payload),
      });
      irnData = await irnRes.json();
      if (!irnData?.Data?.Irn) return res.status(502).json({ error: 'IRN generation failed', detail: irnData });
      irnData = irnData.Data;
    } catch (e) {
      return res.status(502).json({ error: 'NIC API error', detail: e.message });
    }
  } else {
    // Sandbox mock — generate fake IRN for testing
    const hash = Buffer.from(`${ein.GSTIN}${payload.DocDtls.No}${payload.DocDtls.Dt}`).toString('hex').slice(0, 64);
    irnData = {
      Irn: hash,
      AckNo: Math.floor(Math.random() * 9000000000) + 1000000000,
      AckDt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      SignedQRCode: `MOCK_QR_${hash.slice(0, 20)}`,
      Status: 'ACT',
      _mock: true,
    };
  }

  // Save to DB
  await db.prepare(`UPDATE ${table} SET irn=?,ack_no=?,ack_date=?,irn_status=?,qr_code=? WHERE id=?`)
    .run(irnData.Irn, String(irnData.AckNo), irnData.AckDt, 'generated', irnData.SignedQRCode || '', invoice_id);

  res.json({ success: true, irn: irnData.Irn, ack_no: irnData.AckNo, ack_date: irnData.AckDt, qr_code: irnData.SignedQRCode, mock: !!irnData._mock });
});

// Cancel IRN
router.post('/einvoice/cancel', authMiddleware, adminOnly, async (req, res) => {
  const { invoice_id, invoice_type = 'custom', reason = '1' } = req.body;
  const table = invoice_type === 'service' ? 'service_bookings' : 'custom_invoices';
  const inv = await db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(invoice_id);
  if (!inv?.irn) return res.status(400).json({ error: 'No IRN found for this invoice' });

  await db.prepare(`UPDATE ${table} SET irn_status='cancelled' WHERE id=?`).run(invoice_id);
  res.json({ success: true, message: 'IRN marked cancelled' });
});

// Get IRN status
router.get('/einvoice/:invoice_id', authMiddleware, adminOnly, async (req, res) => {
  const { type = 'custom' } = req.query;
  const table = type === 'service' ? 'service_bookings' : 'custom_invoices';
  const inv = await db.prepare(`SELECT id,irn,ack_no,ack_date,irn_status,qr_code FROM ${table} WHERE id=?`).get(req.params.invoice_id);
  if (!inv) return res.status(404).json({ error: 'Not found' });
  res.json(inv);
});


// ── PAYROLL ───────────────────────────────────────────────

// List payroll — filter by month
router.get('/payroll', authMiddleware, canAccess('payroll'), async (req, res) => {
  const { month, branch_id } = req.query;
  let q = `SELECT p.*, s.name as staff_name, s.role, s.salary as base_salary, s.branch_id as staff_branch FROM payroll p LEFT JOIN staff s ON s.id=p.staff_id WHERE 1=1`;
  const params = [];
  if (month) { q += ' AND p.month=?'; params.push(month); }
  if (branch_id) { q += ' AND s.branch_id=?'; params.push(branch_id); }
  q += ' ORDER BY p.month DESC, s.name';
  res.json(await db.prepare(q).all(...params) || []);
});

// Auto-generate payroll for all active staff for a month
router.post('/payroll/generate', authMiddleware, canAccess('payroll'), async (req, res) => {
  const { month, branch_id } = req.body;
  if (!month) return res.status(400).json({ error: 'month required (YYYY-MM)' });
  const staffQ = branch_id ? "SELECT * FROM staff WHERE is_active=1 AND branch_id=?" : "SELECT * FROM staff WHERE is_active=1";
  const staff = branch_id ? await db.prepare(staffQ).all(branch_id) || [] : await db.prepare(staffQ).all() || [];
  const created = [];
  for (const s of staff) {
    const exists = await db.prepare('SELECT id FROM payroll WHERE staff_id=? AND month=?').get(s.id, month);
    if (exists) continue;
    // Get present days from attendance
    const att = await db.prepare(`SELECT COUNT(*) as c FROM attendance WHERE staff_id=? AND DATE(date) BETWEEN ? AND ? AND status='present'`).get(s.id, `${month}-01`, `${month}-31`);
    const present = att?.c || 26;
    const basic = s.salary || 0;
    const perDay = basic / 26;
    const earnedBasic = parseFloat((perDay * present).toFixed(2));
    const hra = parseFloat((earnedBasic * 0.4).toFixed(2));
    const gross = parseFloat((earnedBasic + hra).toFixed(2));
    // PF: 12% employee + 12% employer on basic (if basic > 15000, cap at 1800)
    const pfBase = Math.min(earnedBasic, 15000);
    const pf_employee = parseFloat((pfBase * 0.12).toFixed(2));
    const pf_employer = parseFloat((pfBase * 0.12).toFixed(2));
    // ESI: 0.75% employee + 3.25% employer (if gross <= 21000)
    const esi_employee = gross <= 21000 ? parseFloat((gross * 0.0075).toFixed(2)) : 0;
    const esi_employer = gross <= 21000 ? parseFloat((gross * 0.0325).toFixed(2)) : 0;
    // Advance deduction
    const adv = await db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM staff_advances WHERE staff_id=? AND month=? AND deducted=0").get(s.id, month);
    const advance_deduction = adv?.total || 0;
    // TDS: 10% if annual gross > 5L, 20% if > 10L, 30% if > 15L
    const annualGross = gross * 12;
    const tds = annualGross > 1500000 ? parseFloat((gross * 0.30 / 12).toFixed(2))
      : annualGross > 1000000 ? parseFloat((gross * 0.20 / 12).toFixed(2))
      : annualGross > 500000 ? parseFloat((gross * 0.10 / 12).toFixed(2)) : 0;
    const net = parseFloat((gross - pf_employee - esi_employee - tds - advance_deduction).toFixed(2));
    const id = uuid();
    await db.prepare(`INSERT INTO payroll (id,staff_id,month,basic,hra,gross,pf_employee,pf_employer,esi_employee,esi_employer,tds,advance_deduction,net,working_days,present_days) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, s.id, month, earnedBasic, hra, gross, pf_employee, pf_employer, esi_employee, esi_employer, tds, advance_deduction, net, 26, present);
    created.push({ id, staff: s.name, net });
  }
  await auditLog(req, 'payroll', 'generated', month, null, { count: created.length, month });
  res.json({ generated: created.length, records: created });
});

// Update single payroll record
router.put('/payroll/:id', authMiddleware, canAccess('payroll'), async (req, res) => {
  const { basic, hra, allowances, pf_employee, esi_employee, tds, advance_deduction, other_deduction, present_days, notes, status, paid_on } = req.body;
  const gross = (basic || 0) + (hra || 0) + (allowances || 0);
  const net = gross - (pf_employee || 0) - (esi_employee || 0) - (tds || 0) - (advance_deduction || 0) - (other_deduction || 0);
  await db.prepare(`UPDATE payroll SET basic=?,hra=?,allowances=?,pf_employee=?,esi_employee=?,tds=?,advance_deduction=?,other_deduction=?,gross=?,net=?,present_days=?,notes=?,status=?,paid_on=? WHERE id=?`)
    .run(basic, hra, allowances || 0, pf_employee, esi_employee, tds || 0, advance_deduction, other_deduction || 0, gross, net, present_days, notes, status || 'draft', paid_on || null, req.params.id);
  res.json({ message: 'Updated' });
});

// Mark as paid
router.patch('/payroll/:id/pay', authMiddleware, canAccess('payroll'), async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  await db.prepare("UPDATE payroll SET status='paid', paid_on=? WHERE id=?").run(today, req.params.id);
  res.json({ message: 'Marked as paid' });
});

// Salary slip data
router.get('/payroll/:id/slip', authMiddleware, canAccess('payroll'), async (req, res) => {
  const row = await db.prepare(`SELECT p.*, s.name as staff_name, s.role, s.phone FROM payroll p LEFT JOIN staff s ON s.id=p.staff_id WHERE p.id=?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// Staff advances
router.get('/staff-advances', authMiddleware, adminOnly, async (req, res) => {
  const { staff_id } = req.query;
  const rows = staff_id
    ? await db.prepare('SELECT * FROM staff_advances WHERE staff_id=? ORDER BY created_at DESC').all(staff_id)
    : await db.prepare('SELECT a.*, s.name as staff_name FROM staff_advances a LEFT JOIN staff s ON s.id=a.staff_id ORDER BY a.created_at DESC').all();
  res.json(rows || []);
});

router.post('/staff-advances', authMiddleware, adminOnly, async (req, res) => {
  const { staff_id, amount, month, reason } = req.body;
  if (!staff_id || !amount) return res.status(400).json({ error: 'staff_id and amount required' });
  const id = uuid();
  await db.prepare('INSERT INTO staff_advances (id,staff_id,amount,month,reason) VALUES (?,?,?,?,?)').run(id, staff_id, amount, month || new Date().toISOString().slice(0, 7), reason || '');
  res.status(201).json({ id });
});



// ── EXPENSE APPROVAL WORKFLOW ──────────────────────────────

// GET /api/erp/expenses/pending — pending expenses for approval
router.get('/expenses/pending', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare("SELECT e.*, s.name as staff_name FROM expenses e LEFT JOIN staff s ON e.staff_id=s.id WHERE e.status='pending' ORDER BY e.created_at DESC").all());
});

// PUT /api/erp/expenses/:id/approve
router.put('/expenses/:id/approve', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare("UPDATE expenses SET status='approved', approved_by=?, approved_at=NOW() WHERE id=?").run(req.user.name || req.user.id, req.params.id);
  res.json({ success: true });
});

// PUT /api/erp/expenses/:id/reject
router.put('/expenses/:id/reject', authMiddleware, adminOnly, async (req, res) => {
  const { reason } = req.body;
  await db.prepare("UPDATE expenses SET status='rejected', approved_by=?, approved_at=NOW(), description=description||' [REJECTED: '||?||']' WHERE id=?").run(req.user.name || req.user.id, reason || 'Not approved', req.params.id);
  res.json({ success: true });
});

// ── SUPPLIER PAYMENT LEDGER ───────────────────────────────

// GET /api/erp/supplier-payments/:supplierId
router.get('/supplier-payments/:supplierId', authMiddleware, adminOnly, async (req, res) => {
  const payments = await db.prepare("SELECT * FROM expenses WHERE category='supplier_payment' AND staff_id=? ORDER BY date DESC").all(req.params.supplierId);
  const pos = await db.prepare("SELECT po_number, total, status, created_at FROM purchase_orders WHERE supplier_id=? ORDER BY created_at DESC").all(req.params.supplierId);
  const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const totalPO = pos.reduce((s, p) => s + (p.total || 0), 0);
  res.json({ payments, purchase_orders: pos, total_paid: totalPaid, total_po: totalPO, balance_due: totalPO - totalPaid });
});

// POST /api/erp/supplier-payments — record payment to supplier
router.post('/supplier-payments', authMiddleware, adminOnly, async (req, res) => {
  const { supplier_id, amount, payment_method, description, date } = req.body;
  if (!supplier_id || !amount) return res.status(400).json({ error: 'supplier_id and amount required' });
  const id = uuid();
  await db.prepare("INSERT INTO expenses (id, category, amount, description, payment_method, date, staff_id, status, created_by) VALUES (?,?,?,?,?,?,?,'approved',?)")
    .run(id, 'supplier_payment', amount, description || 'Supplier payment', payment_method || 'bank_transfer', date || new Date().toISOString().split('T')[0], supplier_id, req.user.id);
  res.status(201).json({ success: true, id });
});

export default router;

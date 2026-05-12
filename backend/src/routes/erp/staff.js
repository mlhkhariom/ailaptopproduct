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

// ── STAFF ─────────────────────────────────────────────────

router.get('/staff', authMiddleware, adminOnly, async (req, res) => {
  const { include_inactive, branch_id } = req.query;
  let q = include_inactive ? 'SELECT * FROM staff WHERE 1=1' : 'SELECT * FROM staff WHERE is_active=1';
  const params = [];
  if (branch_id) { q += ' AND branch_id=?'; params.push(branch_id); }
  q += ' ORDER BY is_active DESC, name ASC';
  res.json(await db.prepare(q).all(...params) || []);
});

router.post('/staff', authMiddleware, canAccess('staff'), async (req, res) => {
  const { name, role, phone, email, salary, joining_date, address, branch_id, aadhaar_url, pan_url, offer_letter_url, other_doc_url, bank_account, bank_ifsc, bank_name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  await db.prepare('INSERT INTO staff (id,name,role,phone,email,salary,joining_date,address,branch_id,aadhaar_url,pan_url,offer_letter_url,other_doc_url,bank_account,bank_ifsc,bank_name) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, name, role, phone, email, salary || 0, joining_date, address, branch_id||null, aadhaar_url||null, pan_url||null, offer_letter_url||null, other_doc_url||null, bank_account||null, bank_ifsc||null, bank_name||null);
  await auditLog(req, 'staff', 'created', id, null, { name });
  res.status(201).json({ id });
});

router.put('/staff/:id', authMiddleware, canAccess('staff'), async (req, res) => {
  const { name, role, phone, email, salary, joining_date, address, is_active, branch_id } = req.body;
  await db.prepare('UPDATE staff SET name=?,role=?,phone=?,email=?,salary=?,joining_date=?,address=?,is_active=?,branch_id=? WHERE id=?')
    .run(name, role, phone, email, salary, joining_date, address, is_active ? 1 : 0, branch_id || null, req.params.id);
  res.json({ message: 'Updated' });
});

router.delete('/staff/:id', authMiddleware, canAccess('staff'), async (req, res) => {
  await db.prepare('UPDATE staff SET is_active=0 WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});


// ── ATTENDANCE ────────────────────────────────────────────

router.get('/attendance', authMiddleware, adminOnly, async (req, res) => {
  const { date, staff_id, month } = req.query;
  let q = `SELECT a.*, s.name as staff_name, s.role FROM attendance a LEFT JOIN staff s ON a.staff_id=s.id WHERE 1=1`;
  const p = [];
  if (date) { q += ' AND a.date=?'; p.push(date); }
  if (staff_id) { q += ' AND a.staff_id=?'; p.push(staff_id); }
  if (month) { q += ' AND TO_CHAR(a.date,\'YYYY-MM\')=?'; p.push(month); }
  q += ' ORDER BY a.date DESC, s.name ASC';
  res.json(await db.prepare(q).all(...p) || []);
});

router.post('/attendance', authMiddleware, adminOnly, async (req, res) => {
  const { staff_id, date, status, check_in, check_out, notes } = req.body;
  if (!staff_id || !date) return res.status(400).json({ error: 'staff_id and date required' });
  const id = uuid();
  await db.prepare(`INSERT INTO attendance (id,staff_id,date,status,check_in,check_out,notes) VALUES (?,?,?,?,?,?,?)
    ON CONFLICT (staff_id,date) DO UPDATE SET status=EXCLUDED.status,check_in=EXCLUDED.check_in,check_out=EXCLUDED.check_out,notes=EXCLUDED.notes`)
    .run(id, staff_id, date, status || 'present', check_in, check_out, notes);
  res.status(201).json({ message: 'Saved' });
});

router.get('/attendance/stats', authMiddleware, adminOnly, async (req, res) => {
  const { month } = req.query;
  const m = month || new Date().toISOString().slice(0, 7);
  const rows = await db.prepare(`SELECT s.id, s.name, s.role,
    COUNT(CASE WHEN a.status='present' THEN 1 END) as present,
    COUNT(CASE WHEN a.status='absent' THEN 1 END) as absent,
    COUNT(CASE WHEN a.status='half_day' THEN 1 END) as half_day,
    COUNT(CASE WHEN a.status='leave' THEN 1 END) as leave
    FROM staff s LEFT JOIN attendance a ON s.id=a.staff_id AND TO_CHAR(a.date,'YYYY-MM')=?
    WHERE s.is_active=1 GROUP BY s.id, s.name, s.role ORDER BY s.name`).all(m);
  res.json(rows || []);
});


// ── LEAVE MANAGEMENT ─────────────────────────────────────

router.get('/leaves', authMiddleware, adminOnly, async (req, res) => {
  const { staff_id, status } = req.query;
  let q = `SELECT l.*, s.name as staff_name, s.role FROM leave_requests l LEFT JOIN staff s ON l.staff_id=s.id WHERE 1=1`;
  const p = [];
  if (staff_id) { q += ' AND l.staff_id=?'; p.push(staff_id); }
  if (status) { q += ' AND l.status=?'; p.push(status); }
  q += ' ORDER BY l.created_at DESC';
  res.json(await db.prepare(q).all(...p) || []);
});

router.post('/leaves', authMiddleware, adminOnly, async (req, res) => {
  const { staff_id, type, from_date, to_date, reason } = req.body;
  if (!staff_id || !from_date || !to_date) return res.status(400).json({ error: 'staff_id, from_date, to_date required' });
  const days = Math.ceil((new Date(to_date) - new Date(from_date)) / 86400000) + 1;
  const id = uuid();
  await db.prepare('INSERT INTO leave_requests (id,staff_id,type,from_date,to_date,days,reason) VALUES (?,?,?,?,?,?,?)').run(id, staff_id, type || 'casual', from_date, to_date, days, reason);
  res.status(201).json({ id, days });
});

router.patch('/leaves/:id', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.body;
  await db.prepare('UPDATE leave_requests SET status=?,approved_by=? WHERE id=?').run(status, req.user.id, req.params.id);
  if (status === 'approved') {
    const leave = await db.prepare('SELECT * FROM leave_requests WHERE id=?').get(req.params.id);
    if (leave) {
      const d = new Date(leave.from_date);
      while (d <= new Date(leave.to_date)) {
        const ds = d.toISOString().split('T')[0];
        await db.prepare(`INSERT INTO attendance (id,staff_id,date,status) VALUES (?,?,?,'leave') ON CONFLICT (staff_id,date) DO UPDATE SET status='leave'`).run(uuid(), leave.staff_id, ds);
        d.setDate(d.getDate() + 1);
      }
    }
  }
  res.json({ message: 'Updated' });
});

// GET /api/erp/leaves/balance/:staff_id — leave balance for current year
router.get('/leaves/balance/:staff_id', authMiddleware, adminOnly, async (req, res) => {
  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  // Default annual quota (can be made configurable per staff later)
  const quota = { casual: 12, sick: 6, earned: 15 };
  const used = await db.prepare(`SELECT type, COALESCE(SUM(days),0) as used FROM leave_requests WHERE staff_id=? AND status='approved' AND from_date>=? AND to_date<=? GROUP BY type`).all(req.params.staff_id, yearStart, yearEnd) || [];
  const balance = Object.entries(quota).map(([type, total]) => {
    const usedDays = used.find(u => u.type === type)?.used || 0;
    return { type, total, used: usedDays, remaining: total - usedDays };
  });
  res.json({ year, staff_id: req.params.staff_id, balance, total_quota: 33, total_used: balance.reduce((s, b) => s + b.used, 0) });
});


// ── SALARY HISTORY ────────────────────────────────────────
router.get('/staff/:id/salary-history', authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.prepare('SELECT * FROM salary_history WHERE staff_id=? ORDER BY created_at DESC').all(req.params.id) || [];
  res.json(rows);
});


// ── SHIFT MANAGEMENT ──────────────────────────────────────
router.get('/shifts', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM shifts WHERE is_active=1 ORDER BY start_time').all() || []);
});
router.post('/shifts', authMiddleware, adminOnly, async (req, res) => {
  const { name, start_time, end_time, branch_id } = req.body;
  if (!name || !start_time || !end_time) return res.status(400).json({ error: 'name, start_time, end_time required' });
  const id = uuid();
  await db.prepare('INSERT INTO shifts (id,name,start_time,end_time,branch_id) VALUES (?,?,?,?,?)').run(id, name, start_time, end_time, branch_id || null);
  res.status(201).json({ id });
});
router.put('/shifts/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, start_time, end_time, branch_id, is_active } = req.body;
  await db.prepare('UPDATE shifts SET name=?,start_time=?,end_time=?,branch_id=?,is_active=? WHERE id=?').run(name, start_time, end_time, branch_id || null, is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});
router.delete('/shifts/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM shifts WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});
// Assign shift to staff
router.patch('/staff/:id/shift', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('UPDATE staff SET shift_id=? WHERE id=?').run(req.body.shift_id || null, req.params.id);
  res.json({ message: 'Shift assigned' });
});



export default router;

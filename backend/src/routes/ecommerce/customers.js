import { Router } from 'express';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminOnly, superAdminOnly } from '../../middleware/adminOnly.js';

const router = Router();

// GET /api/customers — admin: all users
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  const { role, all } = req.query;
  let q = `SELECT u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at,
    COUNT(o.id) as order_count, COALESCE(SUM(o.total), 0) as total_spent
    FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE 1=1`;
  const params = [];
  if (role && role !== 'all') { q += ' AND u.role = ?'; params.push(role); }
  else if (!all) { q += " AND u.role != 'customer'"; } // Default: show staff only, all=1 shows everyone
  q += ' GROUP BY u.id ORDER BY u.created_at DESC';
  res.json(await db.prepare(q).all(...params));
});

// PUT /api/customers/:id — only superadmin can change roles, admin can only toggle active
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { is_active, role, name, phone, email, password } = req.body;
  const target = await db.prepare('SELECT role FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });

  if (req.user.role !== 'superadmin') {
    if (role && role !== target.role) return res.status(403).json({ error: 'Only Super Admin can change roles' });
    if (target.role === 'admin' || target.role === 'superadmin') return res.status(403).json({ error: 'Cannot modify admin users' });
  }
  if (target.role === 'superadmin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Cannot modify Super Admin' });
  }

  // Update fields
  await db.prepare('UPDATE users SET is_active=COALESCE(?,is_active), role=COALESCE(?,role), name=COALESCE(?,name), phone=COALESCE(?,phone), email=COALESCE(?,email) WHERE id=?')
    .run(is_active !== undefined ? (is_active ? 1 : 0) : null, role || null, name || null, phone || null, email || null, req.params.id);

  // Password reset
  if (password && password.length >= 6) {
    const bcrypt = await import('bcryptjs');
    await db.prepare('UPDATE users SET password=? WHERE id=?').run(bcrypt.default.hashSync(password, 10), req.params.id);
  }

  res.json({ message: 'Updated' });
});

// GET /api/customers/segments — customer segments with counts
router.get('/segments', authMiddleware, adminOnly, async (req, res) => {
  const total = (await db.prepare("SELECT COUNT(*) as c FROM users WHERE role='customer'").get())?.c || 0;
  const withOrders = (await db.prepare("SELECT COUNT(DISTINCT user_id) as c FROM orders WHERE user_id IS NOT NULL").get())?.c || 0;
  const vip = (await db.prepare("SELECT COUNT(DISTINCT user_id) as c FROM orders WHERE user_id IS NOT NULL GROUP BY user_id HAVING COUNT(*) >= 3").all())?.length || 0;
  const recent30 = (await db.prepare("SELECT COUNT(*) as c FROM users WHERE role='customer' AND created_at > NOW() - INTERVAL '30 days'").get())?.c || 0;
  const inactive = total - withOrders;

  res.json({
    segments: [
      { name: 'All Customers', count: total, filter: 'all' },
      { name: 'VIP (3+ orders)', count: vip, filter: 'vip' },
      { name: 'Active (has orders)', count: withOrders, filter: 'active' },
      { name: 'New (last 30 days)', count: recent30, filter: 'new' },
      { name: 'Inactive (no orders)', count: inactive, filter: 'inactive' },
    ]
  });
});

export default router;

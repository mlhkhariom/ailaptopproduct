import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly, superAdminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/customers — admin: all users
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  const { role } = req.query;
  let q = `SELECT u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at,
    COUNT(o.id) as order_count, COALESCE(SUM(o.total), 0) as total_spent
    FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE 1=1`;
  const params = [];
  if (role) { q += ' AND u.role = ?'; params.push(role); }
  q += ' GROUP BY u.id ORDER BY u.created_at DESC';
  res.json(await db.prepare(q).all(...params));
});

// PUT /api/customers/:id — only superadmin can change roles, admin can only toggle active
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { is_active, role } = req.body;
  const target = await db.prepare('SELECT role FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });

  // Only superadmin can change roles or modify other admins/superadmins
  if (req.user.role !== 'superadmin') {
    if (role && role !== target.role) return res.status(403).json({ error: 'Only Super Admin can change roles' });
    if (target.role === 'admin' || target.role === 'superadmin') return res.status(403).json({ error: 'Cannot modify admin users' });
  }

  // Protect superadmin account from being deactivated
  if (target.role === 'superadmin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Cannot modify Super Admin' });
  }

  await db.prepare('UPDATE users SET is_active = ?, role = ? WHERE id = ?').run(is_active ? 1 : 0, role || target.role, req.params.id);
  res.json({ message: 'Updated' });
});

export default router;

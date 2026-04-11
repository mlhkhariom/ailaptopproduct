import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/customers — admin
router.get('/', authMiddleware, adminOnly, (req, res) => {
  const customers = db.prepare(`
    SELECT u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at,
      COUNT(o.id) as order_count,
      COALESCE(SUM(o.total), 0) as total_spent
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.role = 'customer'
    GROUP BY u.id ORDER BY u.created_at DESC
  `).all();
  res.json(customers);
});

// PUT /api/customers/:id — admin toggle active/role
router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const { is_active, role } = req.body;
  db.prepare('UPDATE users SET is_active = ?, role = ? WHERE id = ?').run(is_active ? 1 : 0, role, req.params.id);
  res.json({ message: 'Updated' });
});

export default router;

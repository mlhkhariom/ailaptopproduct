import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/reports/dashboard — admin KPIs
router.get('/dashboard', authMiddleware, adminOnly, (req, res) => {
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(total),0) as val FROM orders WHERE payment_status='paid'").get().val;
  const totalOrders = db.prepare('SELECT COUNT(*) as val FROM orders').get().val;
  const totalCustomers = db.prepare("SELECT COUNT(*) as val FROM users WHERE role='customer'").get().val;
  const totalProducts = db.prepare("SELECT COUNT(*) as val FROM products WHERE status='active'").get().val;
  const recentOrders = db.prepare('SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5').all()
    .map(o => ({ ...o, items: JSON.parse(o.items) }));
  const topProducts = db.prepare(`
    SELECT p.name, p.price, p.stock, COUNT(o.id) as order_count
    FROM products p LEFT JOIN orders o ON o.items LIKE '%' || p.id || '%'
    GROUP BY p.id ORDER BY order_count DESC LIMIT 5
  `).all();

  res.json({ totalRevenue, totalOrders, totalCustomers, totalProducts, recentOrders, topProducts });
});

export default router;

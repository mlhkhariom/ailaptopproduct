import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/reports/dashboard
router.get('/dashboard', authMiddleware, adminOnly, (req, res) => {
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(total),0) as val FROM orders WHERE payment_status='paid'").get().val;
  const totalOrders = db.prepare('SELECT COUNT(*) as val FROM orders').get().val;
  const totalCustomers = db.prepare("SELECT COUNT(*) as val FROM users WHERE role='customer'").get().val;
  const totalProducts = db.prepare("SELECT COUNT(*) as val FROM products WHERE status='active'").get().val;
  const pendingOrders = db.prepare("SELECT COUNT(*) as val FROM orders WHERE status='placed' OR status='processing'").get().val;
  const lowStock = db.prepare("SELECT COUNT(*) as val FROM products WHERE stock <= 5 AND status='active'").get().val;
  const recentOrders = db.prepare('SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5').all()
    .map(o => ({ ...o, items: JSON.parse(o.items || '[]') }));
  const topProducts = db.prepare(`
    SELECT p.name, p.price, p.stock, p.category,
      COUNT(DISTINCT o.id) as order_count
    FROM products p
    LEFT JOIN orders o ON o.items LIKE '%' || p.id || '%'
    GROUP BY p.id ORDER BY order_count DESC LIMIT 5
  `).all();

  res.json({ totalRevenue, totalOrders, totalCustomers, totalProducts, pendingOrders, lowStock, recentOrders, topProducts });
});

// GET /api/reports/sales?period=7d|30d|90d|1y
router.get('/sales', authMiddleware, adminOnly, (req, res) => {
  const period = req.query.period || '30d';
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;

  const sales = db.prepare(`
    SELECT date(created_at) as date,
      COUNT(*) as orders,
      COALESCE(SUM(total), 0) as revenue
    FROM orders
    WHERE created_at >= date('now', '-${days} days')
    GROUP BY date(created_at)
    ORDER BY date ASC
  `).all();

  const byStatus = db.prepare(`
    SELECT status, COUNT(*) as count FROM orders
    WHERE created_at >= date('now', '-${days} days')
    GROUP BY status
  `).all();

  const byPayment = db.prepare(`
    SELECT payment_method, COUNT(*) as count, COALESCE(SUM(total),0) as revenue
    FROM orders WHERE created_at >= date('now', '-${days} days')
    GROUP BY payment_method
  `).all();

  res.json({ sales, byStatus, byPayment });
});

// GET /api/reports/products
router.get('/products', authMiddleware, adminOnly, (req, res) => {
  const topSelling = db.prepare(`
    SELECT p.id, p.name, p.category, p.price, p.stock, p.rating, p.reviews,
      COUNT(DISTINCT o.id) as order_count
    FROM products p
    LEFT JOIN orders o ON o.items LIKE '%' || p.id || '%'
    WHERE p.status = 'active'
    GROUP BY p.id ORDER BY order_count DESC LIMIT 10
  `).all();

  const lowStock = db.prepare("SELECT id, name, stock, category FROM products WHERE stock <= 10 AND status='active' ORDER BY stock ASC LIMIT 10").all();
  const byCategory = db.prepare("SELECT category, COUNT(*) as count FROM products WHERE status='active' GROUP BY category ORDER BY count DESC").all();
  const outOfStock = db.prepare("SELECT COUNT(*) as val FROM products WHERE in_stock=0 AND status='active'").get().val;

  res.json({ topSelling, lowStock, byCategory, outOfStock });
});

// GET /api/reports/customers
router.get('/customers', authMiddleware, adminOnly, (req, res) => {
  const topCustomers = db.prepare(`
    SELECT u.id, u.name, u.email, u.created_at,
      COUNT(o.id) as order_count,
      COALESCE(SUM(o.total), 0) as total_spent
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.role = 'customer'
    GROUP BY u.id ORDER BY total_spent DESC LIMIT 10
  `).all();

  const newThisMonth = db.prepare("SELECT COUNT(*) as val FROM users WHERE role='customer' AND created_at >= date('now', '-30 days')").get().val;
  const repeatCustomers = db.prepare("SELECT COUNT(*) as val FROM (SELECT user_id FROM orders GROUP BY user_id HAVING COUNT(*) > 1)").get().val;
  const avgOrderValue = db.prepare("SELECT COALESCE(AVG(total),0) as val FROM orders WHERE payment_status='paid'").get().val;

  res.json({ topCustomers, newThisMonth, repeatCustomers, avgOrderValue: Math.round(avgOrderValue) });
});

export default router;

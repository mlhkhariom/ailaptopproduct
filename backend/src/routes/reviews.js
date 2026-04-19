import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/reviews/:productId — public
router.get('/:productId', (req, res) => {
  const reviews = db.prepare("SELECT * FROM product_reviews WHERE product_id=? AND status='approved' ORDER BY created_at DESC").all(req.params.productId);
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  res.json({ reviews, avg, count: reviews.length });
});

// POST /api/reviews/:productId — auth required
router.post('/:productId', authMiddleware, (req, res) => {
  const { rating, review } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating 1-5 required' });
  const user = db.prepare('SELECT name FROM users WHERE id=?').get(req.user.id);
  db.prepare('INSERT INTO product_reviews (id,product_id,user_id,customer_name,rating,review) VALUES (?,?,?,?,?,?)')
    .run(uuid(), req.params.productId, req.user.id, user?.name || 'Customer', rating, review || '');
  res.status(201).json({ message: 'Review submitted for approval' });
});

// GET /api/reviews — admin: all pending
router.get('/', authMiddleware, adminOnly, (req, res) => {
  const { status = 'pending' } = req.query;
  res.json(db.prepare('SELECT r.*, p.name as product_name FROM product_reviews r LEFT JOIN products p ON r.product_id=p.id WHERE r.status=? ORDER BY r.created_at DESC').all(status));
});

// PUT /api/reviews/:id — admin approve/reject
router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE product_reviews SET status=? WHERE id=?').run(status, req.params.id);
  // Update product avg rating if approved
  if (status === 'approved') {
    const review = db.prepare('SELECT product_id FROM product_reviews WHERE id=?').get(req.params.id);
    const avg = db.prepare("SELECT AVG(rating) as avg FROM product_reviews WHERE product_id=? AND status='approved'").get(review.product_id);
    db.prepare('UPDATE products SET rating=? WHERE id=?').run(Math.round(avg.avg * 10) / 10, review.product_id);
  }
  res.json({ message: 'Updated' });
});

export default router;

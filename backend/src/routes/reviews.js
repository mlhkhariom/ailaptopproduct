import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/reviews/:productId — public
router.get('/:productId', async (req, res) => {
  const reviews = await db.prepare("SELECT * FROM product_reviews WHERE product_id=? AND status='approved' ORDER BY created_at DESC").all(req.params.productId);
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  res.json({ reviews, avg, count: reviews.length });
});

// POST /api/reviews/:productId — auth required
router.post('/:productId', authMiddleware, async (req, res) => {
  const { rating, review, images } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating 1-5 required' });
  const user = await db.prepare('SELECT name FROM users WHERE id=?').get(req.user.id);
  // Check if verified purchase
  const purchased = await db.prepare("SELECT id FROM orders WHERE user_id=? AND items LIKE ? AND status IN ('delivered','placed','shipped')").get(req.user.id, `%${req.params.productId}%`);
  await db.prepare('INSERT INTO product_reviews (id,product_id,user_id,customer_name,rating,review,images,verified_purchase) VALUES (?,?,?,?,?,?,?,?)')
    .run(uuid(), req.params.productId, req.user.id, user?.name || 'Customer', rating, review || '', JSON.stringify(images || []), purchased ? 1 : 0);
  res.status(201).json({ message: 'Review submitted for approval' });
});

// GET /api/reviews — admin: all pending
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  const { status = 'pending' } = req.query;
  res.json(await db.prepare('SELECT r.*, p.name as product_name FROM product_reviews r LEFT JOIN products p ON r.product_id=p.id WHERE r.status=? ORDER BY r.created_at DESC').all(status));
});

// PUT /api/reviews/:id — admin approve/reject
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.body;
  await db.prepare('UPDATE product_reviews SET status=? WHERE id=?').run(status, req.params.id);
  // Update product avg rating if approved
  if (status === 'approved') {
    const review = await db.prepare('SELECT product_id FROM product_reviews WHERE id=?').get(req.params.id);
    const avg = await db.prepare("SELECT AVG(rating) as avg FROM product_reviews WHERE product_id=? AND status='approved'").get(review.product_id);
    await db.prepare('UPDATE products SET rating=? WHERE id=?').run(Math.round(avg.avg * 10) / 10, review.product_id);
  }
  res.json({ message: 'Updated' });
});

// ── PRODUCT Q&A ───────────────────────────────────────────

// GET /api/reviews/questions/pending — admin: all unanswered questions
router.get('/questions/pending', authMiddleware, adminOnly, async (req, res) => {
  const questions = await db.prepare("SELECT q.*, p.name as product_name FROM product_questions q LEFT JOIN products p ON q.product_id=p.id WHERE q.answer IS NULL OR q.status='pending' ORDER BY q.created_at DESC LIMIT 20").all();
  res.json(questions);
});

// GET /api/reviews/:productId/questions — public
router.get('/:productId/questions', async (req, res) => {
  const questions = await db.prepare("SELECT * FROM product_questions WHERE product_id=? AND status='approved' ORDER BY votes DESC, created_at DESC").all(req.params.productId);
  res.json(questions);
});

// POST /api/reviews/:productId/questions — ask a question
router.post('/:productId/questions', authMiddleware, async (req, res) => {
  const { question } = req.body;
  if (!question || question.length < 5) return res.status(400).json({ error: 'Question too short' });
  const user = await db.prepare('SELECT name FROM users WHERE id=?').get(req.user.id);
  await db.prepare('INSERT INTO product_questions (id,product_id,user_id,customer_name,question) VALUES (?,?,?,?,?)')
    .run(uuid(), req.params.productId, req.user.id, user?.name || 'Customer', question);
  res.status(201).json({ message: 'Question submitted' });
});

// PUT /api/reviews/questions/:id/answer — admin answers
router.put('/questions/:id/answer', authMiddleware, adminOnly, async (req, res) => {
  const { answer } = req.body;
  if (!answer) return res.status(400).json({ error: 'Answer required' });
  await db.prepare("UPDATE product_questions SET answer=?, answered_by='Admin', answered_at=NOW(), status='approved' WHERE id=?").run(answer, req.params.id);
  res.json({ message: 'Answered' });
});

// POST /api/reviews/:productId/questions/:qId/vote — upvote question
router.post('/:productId/questions/:qId/vote', async (req, res) => {
  await db.prepare('UPDATE product_questions SET votes=votes+1 WHERE id=?').run(req.params.qId);
  res.json({ success: true });
});

export default router;

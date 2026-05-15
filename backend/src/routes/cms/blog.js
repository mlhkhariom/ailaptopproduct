import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminOnly } from '../../middleware/adminOnly.js';

const router = Router();

// Helper — parse tags from DB (JSON string or comma-separated)
const parseTags = (tags) => {
  if (!tags) return [];
  try { return JSON.parse(tags); } catch { return tags.split(',').map(t => t.trim()).filter(Boolean); }
};

// GET /api/blog — public
router.get('/', async (req, res) => {
  const { category, status } = req.query;
  let query = 'SELECT * FROM blog_posts WHERE 1=1';
  const params = [];
  if (status && status !== 'all') { query += ' AND status = ?'; params.push(status); }
  else { query += " AND status = 'published'"; }
  if (category) { query += ' AND category = ?'; params.push(category); }
  query += ' ORDER BY published_at DESC NULLS LAST, created_at DESC';
  res.json((await db.prepare(query).all(...params)).map(p => ({ ...p, tags: parseTags(p.tags) })));
});

// GET /api/blog/:slug — public
router.get('/:slug', async (req, res) => {
  const post = await db.prepare('SELECT * FROM blog_posts WHERE slug = ? OR id = ?').get(req.params.slug, req.params.slug);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ ...post, tags: parseTags(post.tags) });
});

// POST /api/blog — admin
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { title, slug, content, excerpt, image, category, author, status, tags, seo_title, seo_description } = req.body;
  const id = uuid();
  await db.prepare(`INSERT INTO blog_posts (id, title, slug, content, excerpt, image, category, author, status, tags, seo_title, seo_description, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, title, slug, content, excerpt, image, category, author, status || 'draft', JSON.stringify(tags || []), seo_title, seo_description, status === 'published' ? new Date().toISOString() : null);
  res.status(201).json({ id });
});

// PUT /api/blog/:id — admin
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { title, slug, content, excerpt, image, category, author, status, tags, seo_title, seo_description } = req.body;
  await db.prepare(`UPDATE blog_posts SET title=?, slug=?, content=?, excerpt=?, image=?, category=?, author=?, status=?, tags=?, seo_title=?, seo_description=?, published_at=COALESCE(published_at, CASE WHEN ? = 'published' THEN NOW() ELSE NULL END) WHERE id=?`)
    .run(title, slug, content, excerpt, image, category, author, status, JSON.stringify(tags || []), seo_title, seo_description, status, req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/blog/:id — admin
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;

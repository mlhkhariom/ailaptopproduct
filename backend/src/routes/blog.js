import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/blog — public
router.get('/', (req, res) => {
  const { category, status } = req.query;
  let query = 'SELECT * FROM blog_posts WHERE 1=1';
  const params = [];
const parseTags = (tags) => {
  if (!tags) return [];
  try { return JSON.parse(tags); } catch { return tags.split(',').map(t => t.trim()).filter(Boolean); }
};
  query += ` AND status = ?`;
  params.push(status || 'published');
  query += ' ORDER BY published_at DESC';
  res.json(db.prepare(query).all(...params).map(p => ({ ...p, tags: parseTags(p.tags) })));
});

// GET /api/blog/:slug — public
router.get('/:slug', (req, res) => {
  const post = db.prepare('SELECT * FROM blog_posts WHERE slug = ? OR id = ?').get(req.params.slug, req.params.slug);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ ...post, tags: parseTags(post.tags) });
});

// POST /api/blog — admin
router.post('/', authMiddleware, adminOnly, (req, res) => {
  const { title, slug, content, excerpt, image, category, author, status, tags, seo_title, seo_description } = req.body;
  const id = uuid();
  db.prepare(`INSERT INTO blog_posts (id, title, slug, content, excerpt, image, category, author, status, tags, seo_title, seo_description, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, title, slug, content, excerpt, image, category, author, status || 'draft', JSON.stringify(tags || []), seo_title, seo_description, status === 'published' ? new Date().toISOString() : null);
  res.status(201).json({ id });
});

// PUT /api/blog/:id — admin
router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const { title, slug, content, excerpt, image, category, author, status, tags, seo_title, seo_description } = req.body;
  db.prepare(`UPDATE blog_posts SET title=?, slug=?, content=?, excerpt=?, image=?, category=?, author=?, status=?, tags=?, seo_title=?, seo_description=?, published_at=COALESCE(published_at, CASE WHEN ? = 'published' THEN datetime('now') ELSE NULL END) WHERE id=?`)
    .run(title, slug, content, excerpt, image, category, author, status, JSON.stringify(tags || []), seo_title, seo_description, status, req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/blog/:id — admin
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;

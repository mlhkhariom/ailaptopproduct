import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/reels — public (all active reels)
router.get('/', (req, res) => {
  const { product_id, platform } = req.query;
  let q = 'SELECT r.*, p.name as product_name, p.slug as product_slug FROM reels r LEFT JOIN products p ON r.product_id = p.id WHERE r.is_active = 1';
  const params = [];
  if (product_id) { q += ' AND r.product_id = ?'; params.push(product_id); }
  if (platform) { q += ' AND r.platform = ?'; params.push(platform); }
  q += ' ORDER BY r.created_at DESC';
  res.json(db.prepare(q).all(...params));
});

// POST /api/reels — admin create
router.post('/', authMiddleware, adminOnly, (req, res) => {
  const { product_id, title, thumbnail, video_url, platform, views } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const id = uuid();
  db.prepare('INSERT INTO reels (id, product_id, title, thumbnail, video_url, platform, views) VALUES (?,?,?,?,?,?,?)')
    .run(id, product_id || null, title, thumbnail, video_url, platform || 'instagram', views || '0');
  res.status(201).json(db.prepare('SELECT * FROM reels WHERE id = ?').get(id));
});

// PUT /api/reels/:id — admin update
router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const { product_id, title, thumbnail, video_url, platform, views, is_active } = req.body;
  db.prepare('UPDATE reels SET product_id=?, title=?, thumbnail=?, video_url=?, platform=?, views=?, is_active=? WHERE id=?')
    .run(product_id || null, title, thumbnail, video_url, platform, views, is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/reels/:id — admin
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  db.prepare('DELETE FROM reels WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// POST /api/reels/instagram — fetch reel info from Instagram URL
router.post('/instagram', authMiddleware, adminOnly, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });

  // Extract shortcode from Instagram URL
  const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  if (!match) return res.status(400).json({ error: 'Invalid Instagram URL' });

  const shortcode = match[1];
  // Use oEmbed API (no auth needed)
  try {
    const oembedUrl = `https://www.instagram.com/oembed/?url=${encodeURIComponent(url)}`;
    const response = await fetch(oembedUrl);
    if (!response.ok) throw new Error('Instagram oEmbed failed');
    const data = await response.json();
    res.json({
      title: data.title || 'Instagram Reel',
      thumbnail: data.thumbnail_url,
      video_url: url,
      platform: 'instagram',
      author: data.author_name,
    });
  } catch {
    // Fallback — return basic info
    res.json({
      title: 'Instagram Reel',
      thumbnail: `https://www.instagram.com/p/${shortcode}/media/?size=l`,
      video_url: url,
      platform: 'instagram',
    });
  }
});

export default router;

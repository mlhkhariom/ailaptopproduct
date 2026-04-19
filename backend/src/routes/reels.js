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

  const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  if (!match) return res.status(400).json({ error: 'Invalid Instagram URL' });

  const shortcode = match[1];
  try {
    const oembedUrl = `https://www.instagram.com/oembed/?url=${encodeURIComponent(url)}&omitscript=true`;
    const response = await fetch(oembedUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) throw new Error('oEmbed failed');
    const data = await response.json();
    res.json({
      title: data.title || 'Instagram Reel',
      thumbnail: data.thumbnail_url,
      video_url: url,
      platform: 'instagram',
      author: data.author_name,
    });
  } catch {
    res.json({ title: 'Instagram Reel', thumbnail: null, video_url: url, platform: 'instagram' });
  }
});

// GET /api/reels/fetch-profile — fetch latest reels from Instagram profile via Graph API
router.get('/fetch-profile', authMiddleware, adminOnly, async (req, res) => {
  const s = db.prepare("SELECT meta_access_token, meta_ig_account_id FROM social_settings WHERE id='main'").get();

  if (!s?.meta_access_token || !s?.meta_ig_account_id) {
    return res.status(400).json({ error: 'Instagram credentials not configured. Go to Social Media → API Settings.' });
  }

  try {
    // Fetch media from Instagram Graph API
    const url = `https://graph.facebook.com/v18.0/${s.meta_ig_account_id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=12&access_token=${s.meta_access_token}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    // Filter only REELS and VIDEO
    const reels = (data.data || []).filter((m: any) => m.media_type === 'VIDEO' || m.media_type === 'REEL');

    // Auto-save to DB if not already exists
    const insertReel = db.prepare('INSERT OR IGNORE INTO reels (id, title, thumbnail, video_url, platform, views, is_active) VALUES (?,?,?,?,?,?,1)');
    let added = 0;
    for (const reel of reels) {
      const existing = db.prepare('SELECT id FROM reels WHERE video_url = ?').get(reel.permalink);
      if (!existing) {
        const { v4: uuid } = await import('uuid');
        insertReel.run(uuid(), reel.caption?.slice(0, 100) || 'Instagram Reel', reel.thumbnail_url || reel.media_url, reel.permalink, 'instagram', '0');
        added++;
      }
    }

    res.json({ fetched: reels.length, added, reels });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

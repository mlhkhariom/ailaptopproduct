import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly, superAdminOnly } from '../middleware/adminOnly.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } }); // 200MB

const router = Router();

// ── Helpers ──────────────────────────────────────────────
const getSettings = async () => await db.prepare('SELECT * FROM social_settings WHERE id = ?').get('main') || {};

const metaFetch = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
};

// ── Settings ─────────────────────────────────────────────

// GET /api/social/settings
router.get('/settings', authMiddleware, adminOnly, async (req, res) => {
  const s = getSettings();
  // mask secret
  if (s.meta_app_secret) s.meta_app_secret = s.meta_app_secret.replace(/.(?=.{4})/g, '*');
  res.json(s);
});

// PUT /api/social/settings — superadmin only
router.put('/settings', authMiddleware, superAdminOnly, async (req, res) => {
  const { meta_app_id, meta_app_secret, meta_access_token, meta_page_id, meta_ig_account_id } = req.body;
  const existing = await db.prepare('SELECT id FROM social_settings WHERE id = ?').get('main');
  if (existing) {
    await db.prepare(`UPDATE social_settings SET meta_app_id=?, meta_app_secret=COALESCE(NULLIF(?,?),meta_app_secret), meta_access_token=?, meta_page_id=?, meta_ig_account_id=?, updated_at=datetime('now') WHERE id='main'`)
      .run(meta_app_id, meta_app_secret, '***masked***', meta_access_token, meta_page_id, meta_ig_account_id);
  } else {
    await db.prepare(`INSERT INTO social_settings (id, meta_app_id, meta_app_secret, meta_access_token, meta_page_id, meta_ig_account_id) VALUES ('main',?,?,?,?,?)`)
      .run(meta_app_id, meta_app_secret, meta_access_token, meta_page_id, meta_ig_account_id);
  }
  res.json({ message: 'Settings saved' });
});

// POST /api/social/settings/verify — test connection
router.post('/settings/verify', authMiddleware, adminOnly, async (req, res) => {
  const s = getSettings();
  if (!s.meta_access_token) return res.status(400).json({ error: 'No access token configured' });
  try {
    const data = await metaFetch(`https://graph.facebook.com/v18.0/me?access_token=${s.meta_access_token}`);
    res.json({ valid: true, name: data.name, id: data.id });
  } catch (e) {
    res.json({ valid: false, error: e.message });
  }
});

// ── Upload video ──────────────────────────────────────────

// POST /api/social/upload
router.post('/upload', authMiddleware, adminOnly, upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ path: req.file.filename, url: `/uploads/${req.file.filename}` });
});

// ── Posts CRUD ────────────────────────────────────────────

// GET /api/social/posts
router.get('/posts', authMiddleware, adminOnly, async (req, res) => {
  const { platform, status } = req.query;
  let q = 'SELECT * FROM social_posts WHERE 1=1';
  const params = [];
  if (platform) { q += ' AND platform = ?'; params.push(platform); }
  if (status) { q += ' AND status = ?'; params.push(status); }
  q += ' ORDER BY created_at DESC';
  res.json(await db.prepare(q).all(...params));
});

// POST /api/social/posts — create draft
router.post('/posts', authMiddleware, adminOnly, async (req, res) => {
  const { title, caption, hashtags, thumbnail, video_path, platform, product_id, scheduled_at } = req.body;
  const id = uuid();
  await db.prepare(`INSERT INTO social_posts (id, title, caption, hashtags, thumbnail, video_path, platform, product_id, scheduled_at) VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(id, title, caption, hashtags, thumbnail, video_path, platform, product_id, scheduled_at);
  res.status(201).json({ id });
});

// PUT /api/social/posts/:id
router.put('/posts/:id', authMiddleware, adminOnly, async (req, res) => {
  const { title, caption, hashtags, thumbnail, video_path, platform, product_id, scheduled_at } = req.body;
  await db.prepare('UPDATE social_posts SET title=?, caption=?, hashtags=?, thumbnail=?, video_path=?, platform=?, product_id=?, scheduled_at=? WHERE id=?')
    .run(title, caption, hashtags, thumbnail, video_path, platform, product_id, scheduled_at, req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/social/posts/:id
router.delete('/posts/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM social_posts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── Publish ───────────────────────────────────────────────

// POST /api/social/publish/:id — publish to platform
router.post('/publish/:id', authMiddleware, adminOnly, async (req, res) => {
  const post = await db.prepare('SELECT * FROM social_posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const s = getSettings();
  if (!s.meta_access_token) return res.status(400).json({ error: 'Meta credentials not configured. Go to Settings → Social Media.' });

  const fullCaption = `${post.caption || ''}\n\n${post.hashtags || ''}`.trim();
  const videoUrl = post.video_path ? `${req.protocol}://${req.get('host')}/uploads/${post.video_path}` : null;

  try {
    let metaPostId = null;

    if (post.platform === 'instagram') {
      if (!s.meta_ig_account_id) throw new Error('Instagram Account ID not configured');
      if (!videoUrl) throw new Error('Video file required for Instagram Reels');

      // Step 1: Create container
      const container = await metaFetch(
        `https://graph.facebook.com/v18.0/${s.meta_ig_account_id}/reels`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ video_url: videoUrl, caption: fullCaption, access_token: s.meta_access_token }),
        }
      );

      // Step 2: Wait for processing
      let status = 'IN_PROGRESS';
      let attempts = 0;
      while (status === 'IN_PROGRESS' && attempts < 20) {
        await new Promise(r => setTimeout(r, 3000));
        const check = await metaFetch(`https://graph.facebook.com/v18.0/${container.id}?fields=status_code&access_token=${s.meta_access_token}`);
        status = check.status_code;
        attempts++;
      }
      if (status !== 'FINISHED') throw new Error(`Video processing failed: ${status}`);

      // Step 3: Publish
      const publish = await metaFetch(
        `https://graph.facebook.com/v18.0/${s.meta_ig_account_id}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creation_id: container.id, access_token: s.meta_access_token }),
        }
      );
      metaPostId = publish.id;

    } else if (post.platform === 'facebook') {
      if (!s.meta_page_id) throw new Error('Facebook Page ID not configured');

      if (videoUrl) {
        // Video post
        const result = await metaFetch(
          `https://graph.facebook.com/v18.0/${s.meta_page_id}/videos`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_url: videoUrl, description: fullCaption, access_token: s.meta_access_token }),
          }
        );
        metaPostId = result.id;
      } else {
        // Text/image post
        const result = await metaFetch(
          `https://graph.facebook.com/v18.0/${s.meta_page_id}/feed`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: fullCaption, link: post.thumbnail || undefined, access_token: s.meta_access_token }),
          }
        );
        metaPostId = result.id;
      }
    }

    await db.prepare(`UPDATE social_posts SET status='published', meta_post_id=?, published_at=datetime('now'), error_msg=NULL WHERE id=?`)
      .run(metaPostId, post.id);

    res.json({ success: true, meta_post_id: metaPostId });

  } catch (e) {
    await db.prepare(`UPDATE social_posts SET status='failed', error_msg=? WHERE id=?`).run(e.message, post.id);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/social/publish-both/:id — publish to both Instagram + Facebook
router.post('/publish-both/:id', authMiddleware, adminOnly, async (req, res) => {
  const results = { instagram: null, facebook: null, errors: [] };

  // Create FB post
  const fbPost = await db.prepare('SELECT * FROM social_posts WHERE id = ?').get(req.params.id);
  if (!fbPost) return res.status(404).json({ error: 'Post not found' });

  // Duplicate for FB if original is IG
  let fbId = req.params.id;
  if (fbPost.platform === 'instagram') {
    const newId = uuid();
    await db.prepare(`INSERT INTO social_posts (id, title, caption, hashtags, thumbnail, video_path, platform, product_id) VALUES (?,?,?,?,?,?,?,?)`)
      .run(newId, fbPost.title, fbPost.caption, fbPost.hashtags, fbPost.thumbnail, fbPost.video_path, 'facebook', fbPost.product_id);
    fbId = newId;
  }

  // Publish IG
  try {
    const igRes = await fetch(`http://localhost:${process.env.PORT || 5000}/api/social/publish/${req.params.id}`, {
      method: 'POST', headers: { Authorization: req.headers.authorization }
    });
    results.instagram = await igRes.json();
  } catch (e) { results.errors.push(`Instagram: ${e.message}`); }

  // Publish FB
  try {
    const fbRes = await fetch(`http://localhost:${process.env.PORT || 5000}/api/social/publish/${fbId}`, {
      method: 'POST', headers: { Authorization: req.headers.authorization }
    });
    results.facebook = await fbRes.json();
  } catch (e) { results.errors.push(`Facebook: ${e.message}`); }

  res.json(results);
});

// GET /api/social/stats — fetch live stats from Meta
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  const s = getSettings();
  if (!s.meta_access_token) return res.json({ instagram: null, facebook: null });
  try {
    const [igData, fbData] = await Promise.allSettled([
      s.meta_ig_account_id ? metaFetch(`https://graph.facebook.com/v18.0/${s.meta_ig_account_id}?fields=followers_count,media_count,name&access_token=${s.meta_access_token}`) : null,
      s.meta_page_id ? metaFetch(`https://graph.facebook.com/v18.0/${s.meta_page_id}?fields=fan_count,name&access_token=${s.meta_access_token}`) : null,
    ]);
    res.json({
      instagram: igData.status === 'fulfilled' ? igData.value : null,
      facebook: fbData.status === 'fulfilled' ? fbData.value : null,
    });
  } catch (e) {
    res.json({ error: e.message });
  }
});

export default router;

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// ── Public ─────────────────────────────────────────────────
// GET /api/reels?product_id=...&platform=...&limit=12
router.get('/', async (req, res) => {
  const { product_id, platform, limit } = req.query;
  let q = `SELECT r.*, p.name as product_name, p.slug as product_slug
           FROM reels r LEFT JOIN products p ON r.product_id = p.id
           WHERE r.is_active = 1`;
  const params = [];
  if (product_id) { q += ' AND r.product_id = ?'; params.push(product_id); }
  if (platform) { q += ' AND r.platform = ?'; params.push(platform); }
  q += ' ORDER BY r.published_at DESC NULLS LAST, r.created_at DESC';
  if (limit) { q += ' LIMIT ?'; params.push(parseInt(limit)); }
  res.json(await db.prepare(q).all(...params));
});

// ── Admin CRUD ─────────────────────────────────────────────
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { product_id, title, thumbnail, video_url, platform, views, caption } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const id = uuid();
  await db.prepare(`INSERT INTO reels (id, product_id, title, thumbnail, video_url, platform, views, caption, is_active)
    VALUES (?,?,?,?,?,?,?,?,1)`)
    .run(id, product_id || null, title, thumbnail || '', video_url || '', platform || 'instagram', views || '0', caption || '');
  res.status(201).json(await db.prepare('SELECT * FROM reels WHERE id = ?').get(id));
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { product_id, title, thumbnail, video_url, platform, views, is_active, caption } = req.body;
  await db.prepare(`UPDATE reels SET product_id=?, title=?, thumbnail=?, video_url=?, platform=?, views=?, caption=?, is_active=? WHERE id=?`)
    .run(product_id || null, title, thumbnail || '', video_url || '', platform || 'instagram', views || '0', caption || '', is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM reels WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── Fetch from URL (Instagram oEmbed) ──────────────────────
router.post('/instagram', authMiddleware, adminOnly, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });

  const isInsta = /instagram\.com\/(?:p|reel|tv)\//.test(url);
  const isYt = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)/.test(url);
  const isFb = /facebook\.com\/(?:watch|reel|[^/]+\/videos)/.test(url);

  try {
    if (isInsta) {
      const oembedUrl = `https://www.instagram.com/oembed/?url=${encodeURIComponent(url)}&omitscript=true`;
      const response = await fetch(oembedUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (response.ok) {
        const data = await response.json();
        return res.json({ title: data.title || 'Instagram Reel', thumbnail: data.thumbnail_url, video_url: url, platform: 'instagram', author: data.author_name });
      }
      return res.json({ title: 'Instagram Reel', thumbnail: null, video_url: url, platform: 'instagram' });
    }
    if (isYt) {
      const ytMatch = url.match(/(?:v=|shorts\/|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      const vid = ytMatch?.[1];
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const r = await fetch(oembedUrl);
      if (r.ok) {
        const d = await r.json();
        return res.json({ title: d.title, thumbnail: d.thumbnail_url || (vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : null), video_url: url, platform: 'youtube', author: d.author_name });
      }
      return res.json({ title: 'YouTube Video', thumbnail: vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : null, video_url: url, platform: 'youtube' });
    }
    if (isFb) {
      return res.json({ title: 'Facebook Video', thumbnail: null, video_url: url, platform: 'facebook' });
    }
    res.status(400).json({ error: 'Unsupported URL. Use Instagram, YouTube, or Facebook.' });
  } catch (e) {
    res.json({ title: 'Reel', thumbnail: null, video_url: url, platform: isInsta ? 'instagram' : isYt ? 'youtube' : 'facebook' });
  }
});

// ── Auto-fetch from Instagram Business profile ─────────────
router.get('/fetch-profile', authMiddleware, adminOnly, async (req, res) => {
  const s = await db.prepare("SELECT meta_access_token, meta_ig_account_id FROM social_settings WHERE id='main'").get();

  if (!s?.meta_access_token || !s?.meta_ig_account_id) {
    return res.status(400).json({ error: 'Instagram credentials not configured. Go to Social Media → API Settings.' });
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${s.meta_ig_account_id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=24&access_token=${s.meta_access_token}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const reels = (data.data || []).filter(m => m.media_type === 'VIDEO' || m.media_type === 'REELS');

    let added = 0, updated = 0;
    for (const reel of reels) {
      const existing = await db.prepare('SELECT id FROM reels WHERE external_id = ? OR video_url = ?').get(reel.id, reel.permalink);
      const thumb = reel.thumbnail_url || reel.media_url;
      const title = (reel.caption || 'Instagram Reel').split('\n')[0].slice(0, 100);

      if (existing) {
        await db.prepare(`UPDATE reels SET thumbnail=?, likes=?, published_at=? WHERE id=?`)
          .run(thumb, reel.like_count || 0, reel.timestamp, existing.id);
        updated++;
      } else {
        await db.prepare(`INSERT INTO reels (id, external_id, title, thumbnail, video_url, platform, views, caption, is_active, likes, published_at, auto_synced)
          VALUES (?,?,?,?,?,?,?,?,1,?,?,1)`)
          .run(uuid(), reel.id, title, thumb, reel.permalink, 'instagram', '0', reel.caption || '', reel.like_count || 0, reel.timestamp);
        added++;
      }
    }

    await db.prepare("UPDATE social_settings SET last_sync_at = NOW() WHERE id='main'").run();
    res.json({ fetched: reels.length, added, updated, platform: 'instagram' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Auto-fetch from YouTube channel ────────────────────────
router.get('/fetch-youtube', authMiddleware, adminOnly, async (req, res) => {
  const s = await db.prepare("SELECT youtube_api_key, youtube_channel_id FROM social_settings WHERE id='main'").get();

  if (!s?.youtube_api_key || !s?.youtube_channel_id) {
    return res.status(400).json({ error: 'YouTube API key + Channel ID not configured. Go to Social Media → API Settings.' });
  }

  try {
    // 1. Get uploads playlist from channel
    const chRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${s.youtube_channel_id}&key=${s.youtube_api_key}`);
    const chData = await chRes.json();
    if (chData.error) throw new Error(chData.error.message);
    const uploadsPlaylist = chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylist) return res.status(404).json({ error: 'Channel uploads playlist not found' });

    // 2. Get latest videos from uploads playlist
    const videosRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylist}&maxResults=20&key=${s.youtube_api_key}`);
    const videosData = await videosRes.json();
    if (videosData.error) throw new Error(videosData.error.message);

    let added = 0, updated = 0;
    for (const v of (videosData.items || [])) {
      const videoId = v.contentDetails?.videoId || v.snippet?.resourceId?.videoId;
      if (!videoId) continue;
      const permalink = `https://www.youtube.com/watch?v=${videoId}`;
      const title = v.snippet?.title?.slice(0, 200) || 'YouTube Video';
      const thumb = v.snippet?.thumbnails?.high?.url || v.snippet?.thumbnails?.default?.url;
      const caption = v.snippet?.description || '';
      const publishedAt = v.snippet?.publishedAt;

      const existing = await db.prepare('SELECT id FROM reels WHERE external_id = ? OR video_url = ?').get(videoId, permalink);
      if (existing) {
        await db.prepare(`UPDATE reels SET thumbnail=?, title=?, caption=?, published_at=? WHERE id=?`)
          .run(thumb, title, caption, publishedAt, existing.id);
        updated++;
      } else {
        await db.prepare(`INSERT INTO reels (id, external_id, title, thumbnail, video_url, platform, views, caption, is_active, published_at, auto_synced)
          VALUES (?,?,?,?,?,?,?,?,1,?,1)`)
          .run(uuid(), videoId, title, thumb, permalink, 'youtube', '0', caption, publishedAt);
        added++;
      }
    }

    await db.prepare("UPDATE social_settings SET last_sync_at = NOW() WHERE id='main'").run();
    res.json({ fetched: videosData.items?.length || 0, added, updated, platform: 'youtube' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Unified auto-fetch — all platforms at once ─────────────
router.post('/sync-all', authMiddleware, adminOnly, async (req, res) => {
  const results = { instagram: null, youtube: null };
  const s = await db.prepare('SELECT * FROM social_settings WHERE id=?').get('main');

  // Instagram
  if (s?.meta_access_token && s?.meta_ig_account_id) {
    try {
      const r = await fetch(`http://localhost:${process.env.PORT || 5000}/api/reels/fetch-profile`, {
        headers: { Authorization: req.headers.authorization },
      }).then(x => x.json());
      results.instagram = r;
    } catch (e) { results.instagram = { error: e.message }; }
  } else {
    results.instagram = { skipped: 'Not configured' };
  }

  // YouTube
  if (s?.youtube_api_key && s?.youtube_channel_id) {
    try {
      const r = await fetch(`http://localhost:${process.env.PORT || 5000}/api/reels/fetch-youtube`, {
        headers: { Authorization: req.headers.authorization },
      }).then(x => x.json());
      results.youtube = r;
    } catch (e) { results.youtube = { error: e.message }; }
  } else {
    results.youtube = { skipped: 'Not configured' };
  }

  res.json(results);
});

export default router;

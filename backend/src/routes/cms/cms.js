import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminOnly } from '../../middleware/adminOnly.js';

const router = Router();

// GET /api/cms/:section — public (active only)
router.get('/:section', async (req, res) => {
  const isAdmin = req.query.admin === '1';
  let q = 'SELECT * FROM cms_content WHERE section = ?';
  if (!isAdmin) q += ' AND is_active = 1';
  q += ' ORDER BY sort_order ASC';
  const items = await db.prepare(q).all(req.params.section)
    .then(rows => (rows || []).map(i => ({ ...i, content: JSON.parse(i.content) })));
  res.json(items);
});

// POST /api/cms — admin add item
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { section, content, sort_order } = req.body;
  const id = uuid();
  await db.prepare('INSERT INTO cms_content (id, section, content, sort_order) VALUES (?, ?, ?, ?)').run(id, section, JSON.stringify(content), sort_order || 0);
  res.status(201).json({ id });
});

// PUT /api/cms/:id — admin update
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { content, sort_order, is_active } = req.body;
  await db.prepare("UPDATE cms_content SET content=?, sort_order=?, is_active=?, updated_at=NOW() WHERE id=?")
    .run(JSON.stringify(content), sort_order, is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/cms/:id — admin
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM cms_content WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── STATIC PAGES (About, Privacy, Terms, Refund etc) ──────
// GET /api/cms/page/:slug — public
router.get('/page/:slug', async (req, res) => {
  const row = await db.prepare("SELECT * FROM cms_pages WHERE slug=? AND is_active=1").get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Page not found' });
  res.json(row);
});

// GET /api/cms-pages — admin list all
router.get('/admin/pages/list', authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.prepare('SELECT id, slug, title, is_active, updated_at FROM cms_pages ORDER BY slug').all();
  res.json(rows);
});

// GET /api/cms-pages/:id — admin full content
router.get('/admin/pages/:id', authMiddleware, adminOnly, async (req, res) => {
  const row = await db.prepare('SELECT * FROM cms_pages WHERE id=?').get(req.params.id);
  res.json(row);
});

// POST /api/cms-pages — admin create
router.post('/admin/pages', authMiddleware, adminOnly, async (req, res) => {
  const { slug, title, content, meta_title, meta_description } = req.body;
  if (!slug || !title) return res.status(400).json({ error: 'slug and title required' });
  const id = uuid();
  await db.prepare(`INSERT INTO cms_pages (id, slug, title, content, meta_title, meta_description, is_active)
    VALUES (?,?,?,?,?,?,1) ON CONFLICT (slug) DO UPDATE SET
    title=EXCLUDED.title, content=EXCLUDED.content, meta_title=EXCLUDED.meta_title, meta_description=EXCLUDED.meta_description, updated_at=NOW()`)
    .run(id, slug, title, content || '', meta_title || '', meta_description || '');
  res.status(201).json({ id, slug });
});

// PUT /api/cms-pages/:id — admin update
router.put('/admin/pages/:id', authMiddleware, adminOnly, async (req, res) => {
  const { title, content, meta_title, meta_description, is_active } = req.body;
  await db.prepare(`UPDATE cms_pages SET title=?, content=?, meta_title=?, meta_description=?, is_active=?, updated_at=NOW() WHERE id=?`)
    .run(title, content, meta_title, meta_description, is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/cms-pages/:id — admin
router.delete('/admin/pages/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM cms_pages WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── TESTIMONIALS (with video support) ─────────────────────

// GET /api/cms/testimonials — public
router.get('/testimonials', async (req, res) => {
  const testimonials = await db.prepare("SELECT * FROM cms_content WHERE section='testimonial' AND is_active=1 ORDER BY sort_order").all();
  res.json(testimonials.map(t => {
    const content = typeof t.content === 'string' ? JSON.parse(t.content) : t.content;
    return { id: t.id, ...content };
  }));
});

// POST /api/cms/testimonials — admin add (supports video_url)
router.post('/testimonials', authMiddleware, adminOnly, async (req, res) => {
  const { name, role, text, rating, image, video_url } = req.body;
  if (!name || !text) return res.status(400).json({ error: 'name and text required' });
  const id = uuid();
  await db.prepare("INSERT INTO cms_content (id, section, content, is_active, sort_order) VALUES (?,?,?,1,0)")
    .run(id, 'testimonial', JSON.stringify({ name, role, text, rating: rating || 5, image, video_url }));
  res.status(201).json({ success: true, id });
});

// ── MENUS ─────────────────────────────────────────────────

// GET /api/cms/menus/:location — public
router.get('/menus/:location', async (req, res) => {
  const menu = await db.prepare('SELECT * FROM menus WHERE location=?').get(req.params.location);
  res.json(menu ? { ...menu, items: typeof menu.items === 'string' ? JSON.parse(menu.items) : menu.items } : { location: req.params.location, items: [] });
});

// PUT /api/cms/menus/:location — admin save menu
router.put('/menus/:location', authMiddleware, adminOnly, async (req, res) => {
  const { items } = req.body;
  const existing = await db.prepare('SELECT id FROM menus WHERE location=?').get(req.params.location);
  if (existing) {
    await db.prepare('UPDATE menus SET items=?, updated_at=NOW() WHERE location=?').run(JSON.stringify(items), req.params.location);
  } else {
    await db.prepare('INSERT INTO menus (id, location, items) VALUES (?,?,?)').run(uuid(), req.params.location, JSON.stringify(items));
  }
  res.json({ success: true });
});

// ── BANNERS ───────────────────────────────────────────────

// GET /api/cms/banners — public (active + scheduled)
router.get('/banners', async (req, res) => {
  const now = new Date().toISOString();
  const banners = await db.prepare("SELECT * FROM banners WHERE is_active=1 AND (starts_at IS NULL OR starts_at <= ?) AND (ends_at IS NULL OR ends_at >= ?) ORDER BY sort_order").all(now, now);
  res.json(banners);
});

// GET /api/cms/banners/all — admin (all banners)
router.get('/banners/all', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM banners ORDER BY sort_order').all());
});

// POST /api/cms/banners — admin create
router.post('/banners', authMiddleware, adminOnly, async (req, res) => {
  const { title, subtitle, image, link, button_text, position, sort_order, starts_at, ends_at } = req.body;
  if (!image) return res.status(400).json({ error: 'image required' });
  const id = uuid();
  await db.prepare('INSERT INTO banners (id, title, subtitle, image, link, button_text, position, sort_order, starts_at, ends_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, title, subtitle, image, link, button_text, position || 'homepage', sort_order || 0, starts_at || null, ends_at || null);
  res.status(201).json(await db.prepare('SELECT * FROM banners WHERE id=?').get(id));
});

// PUT /api/cms/banners/:id
router.put('/banners/:id', authMiddleware, adminOnly, async (req, res) => {
  const { title, subtitle, image, link, button_text, sort_order, is_active, starts_at, ends_at } = req.body;
  await db.prepare('UPDATE banners SET title=COALESCE(?,title), subtitle=COALESCE(?,subtitle), image=COALESCE(?,image), link=COALESCE(?,link), button_text=COALESCE(?,button_text), sort_order=COALESCE(?,sort_order), is_active=COALESCE(?,is_active), starts_at=COALESCE(?,starts_at), ends_at=COALESCE(?,ends_at) WHERE id=?')
    .run(title, subtitle, image, link, button_text, sort_order, is_active, starts_at, ends_at, req.params.id);
  res.json({ success: true });
});

// DELETE /api/cms/banners/:id
router.delete('/banners/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM banners WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ── FAQS ──────────────────────────────────────────────────

// GET /api/cms/faqs — public
router.get('/faqs', async (req, res) => {
  const { category } = req.query;
  let q = "SELECT * FROM faqs WHERE is_active=1";
  const params = [];
  if (category) { q += ' AND category=?'; params.push(category); }
  q += ' ORDER BY sort_order';
  res.json(await db.prepare(q).all(...params));
});

// GET /api/cms/faqs/all — admin
router.get('/faqs/all', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM faqs ORDER BY category, sort_order').all());
});

// POST /api/cms/faqs
router.post('/faqs', authMiddleware, adminOnly, async (req, res) => {
  const { question, answer, category, sort_order } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'question and answer required' });
  const id = uuid();
  await db.prepare('INSERT INTO faqs (id, question, answer, category, sort_order) VALUES (?,?,?,?,?)').run(id, question, answer, category || 'General', sort_order || 0);
  res.status(201).json(await db.prepare('SELECT * FROM faqs WHERE id=?').get(id));
});

// PUT /api/cms/faqs/:id
router.put('/faqs/:id', authMiddleware, adminOnly, async (req, res) => {
  const { question, answer, category, sort_order, is_active } = req.body;
  await db.prepare('UPDATE faqs SET question=COALESCE(?,question), answer=COALESCE(?,answer), category=COALESCE(?,category), sort_order=COALESCE(?,sort_order), is_active=COALESCE(?,is_active) WHERE id=?')
    .run(question, answer, category, sort_order, is_active, req.params.id);
  res.json({ success: true });
});

// DELETE /api/cms/faqs/:id
router.delete('/faqs/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM faqs WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ── POPUPS ────────────────────────────────────────────────

// GET /api/cms/popups/active — public (for frontend to show)
router.get('/popups/active', async (req, res) => {
  const now = new Date().toISOString();
  const popup = await db.prepare("SELECT * FROM popups WHERE is_active=1 AND (starts_at IS NULL OR starts_at <= ?) AND (ends_at IS NULL OR ends_at >= ?) ORDER BY created_at DESC LIMIT 1").get(now, now);
  res.json(popup || null);
});

// GET /api/cms/popups — admin all
router.get('/popups', authMiddleware, adminOnly, async (req, res) => {
  res.json(await db.prepare('SELECT * FROM popups ORDER BY created_at DESC').all());
});

// POST /api/cms/popups
router.post('/popups', authMiddleware, adminOnly, async (req, res) => {
  const { title, body, image, button_text, button_link, type, trigger_type, trigger_value, show_on, starts_at, ends_at } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const id = uuid();
  await db.prepare('INSERT INTO popups (id, title, body, image, button_text, button_link, type, trigger_type, trigger_value, show_on, starts_at, ends_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, title, body, image, button_text, button_link, type || 'modal', trigger_type || 'delay', trigger_value || '5', show_on || 'all', starts_at || null, ends_at || null);
  res.status(201).json(await db.prepare('SELECT * FROM popups WHERE id=?').get(id));
});

// PUT /api/cms/popups/:id
router.put('/popups/:id', authMiddleware, adminOnly, async (req, res) => {
  const { title, body, image, button_text, button_link, type, trigger_type, trigger_value, is_active, starts_at, ends_at } = req.body;
  await db.prepare('UPDATE popups SET title=COALESCE(?,title), body=COALESCE(?,body), image=COALESCE(?,image), button_text=COALESCE(?,button_text), button_link=COALESCE(?,button_link), type=COALESCE(?,type), trigger_type=COALESCE(?,trigger_type), trigger_value=COALESCE(?,trigger_value), is_active=COALESCE(?,is_active), starts_at=COALESCE(?,starts_at), ends_at=COALESCE(?,ends_at) WHERE id=?')
    .run(title, body, image, button_text, button_link, type, trigger_type, trigger_value, is_active, starts_at, ends_at, req.params.id);
  res.json({ success: true });
});

// DELETE /api/cms/popups/:id
router.delete('/popups/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM popups WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ── HOMEPAGE SECTIONS ─────────────────────────────────────

// GET /api/cms/homepage-sections — public
router.get('/homepage-sections', async (req, res) => {
  const sections = await db.prepare('SELECT * FROM homepage_sections WHERE is_active=1 ORDER BY sort_order').all();
  res.json(sections.map(s => ({ ...s, config: typeof s.config === 'string' ? JSON.parse(s.config) : s.config })));
});

// POST /api/cms/homepage-sections — admin create
router.post('/homepage-sections', authMiddleware, adminOnly, async (req, res) => {
  const { type, title, subtitle, config, sort_order } = req.body;
  const id = uuid();
  await db.prepare('INSERT INTO homepage_sections (id, type, title, subtitle, config, sort_order) VALUES (?,?,?,?,?,?)')
    .run(id, type, title || '', subtitle || '', JSON.stringify(config || {}), sort_order || 0);
  res.status(201).json(await db.prepare('SELECT * FROM homepage_sections WHERE id=?').get(id));
});

// PUT /api/cms/homepage-sections/:id — admin update
router.put('/homepage-sections/:id', authMiddleware, adminOnly, async (req, res) => {
  const { type, title, subtitle, config, sort_order, is_active } = req.body;
  await db.prepare('UPDATE homepage_sections SET type=COALESCE(?,type), title=COALESCE(?,title), subtitle=COALESCE(?,subtitle), config=COALESCE(?,config), sort_order=COALESCE(?,sort_order), is_active=COALESCE(?,is_active) WHERE id=?')
    .run(type, title, subtitle, config ? JSON.stringify(config) : null, sort_order, is_active, req.params.id);
  res.json({ success: true });
});

// DELETE /api/cms/homepage-sections/:id — admin delete
router.delete('/homepage-sections/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM homepage_sections WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════
// CMS ADVANCED FEATURES
// ══════════════════════════════════════════════════════════

// ── SEO META MANAGER (per page) ───────────────────────────

// GET /api/cms/seo-meta — all pages with their SEO meta
router.get('/seo-meta', authMiddleware, adminOnly, async (req, res) => {
  const pages = await db.prepare("SELECT slug, title, meta_title, meta_description FROM cms_pages WHERE is_active=1 ORDER BY title").all();
  const products = await db.prepare("SELECT slug, name, meta_title, meta_description FROM products WHERE status='active' ORDER BY name LIMIT 50").all();
  const blogs = await db.prepare("SELECT slug, title, seo_title, seo_description FROM blog_posts WHERE status='published' ORDER BY title").all();
  res.json({ pages, products, blogs });
});

// PUT /api/cms/seo-meta/:type/:slug — update SEO meta for any page
router.put('/seo-meta/:type/:slug', authMiddleware, adminOnly, async (req, res) => {
  const { meta_title, meta_description, og_image, canonical_url } = req.body;
  const { type, slug } = req.params;
  if (type === 'page') await db.prepare('UPDATE cms_pages SET meta_title=?, meta_description=? WHERE slug=?').run(meta_title, meta_description, slug);
  else if (type === 'product') await db.prepare('UPDATE products SET meta_title=?, meta_description=? WHERE slug=?').run(meta_title, meta_description, slug);
  else if (type === 'blog') await db.prepare('UPDATE blog_posts SET seo_title=?, seo_description=? WHERE slug=?').run(meta_title, meta_description, slug);
  res.json({ success: true });
});

// ── SCHEMA MARKUP MANAGER ─────────────────────────────────

// GET /api/cms/schema/:type — get schema markup config
router.get('/schema/:type', async (req, res) => {
  const schema = (await db.prepare("SELECT value FROM app_settings WHERE key=?").get(`schema_${req.params.type}`))?.value;
  res.json(schema ? JSON.parse(schema) : null);
});

// PUT /api/cms/schema/:type — save custom schema
router.put('/schema/:type', authMiddleware, adminOnly, async (req, res) => {
  const { schema } = req.body;
  await db.prepare("INSERT INTO app_settings (key, value) VALUES (?,?) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value")
    .run(`schema_${req.params.type}`, JSON.stringify(schema));
  res.json({ success: true });
});

// ── REDIRECT MANAGER ──────────────────────────────────────

// GET /api/cms/redirects
router.get('/redirects', authMiddleware, adminOnly, async (req, res) => {
  const redirects = await db.prepare("SELECT * FROM app_settings WHERE key LIKE 'redirect_%' ORDER BY key").all();
  res.json(redirects.map(r => ({ id: r.key, ...JSON.parse(r.value) })));
});

// POST /api/cms/redirects — add redirect rule
router.post('/redirects', authMiddleware, adminOnly, async (req, res) => {
  const { from_path, to_path, type } = req.body;
  if (!from_path || !to_path) return res.status(400).json({ error: 'from_path and to_path required' });
  const key = `redirect_${Date.now()}`;
  await db.prepare("INSERT INTO app_settings (key, value) VALUES (?,?)").run(key, JSON.stringify({ from_path, to_path, type: type || '301' }));
  res.json({ success: true });
});

// DELETE /api/cms/redirects/:id
router.delete('/redirects/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare("DELETE FROM app_settings WHERE key=?").run(req.params.id);
  res.json({ success: true });
});

// ── PAGE VERSION HISTORY / DRAFT-PUBLISH ──────────────────

// GET /api/cms/pages/:id/versions — version history
router.get('/pages/:id/versions', authMiddleware, adminOnly, async (req, res) => {
  const versions = await db.prepare("SELECT * FROM app_settings WHERE key LIKE ? ORDER BY key DESC").all(`page_version_${req.params.id}_%`);
  res.json(versions.map(v => ({ id: v.key, ...JSON.parse(v.value) })));
});

// POST /api/cms/pages/:id/publish — save version + publish
router.post('/pages/:id/publish', authMiddleware, adminOnly, async (req, res) => {
  const page = await db.prepare('SELECT * FROM cms_pages WHERE id=?').get(req.params.id);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  // Save current as version
  const versionKey = `page_version_${req.params.id}_${Date.now()}`;
  await db.prepare("INSERT INTO app_settings (key, value) VALUES (?,?)").run(versionKey, JSON.stringify({ content: page.content, title: page.title, saved_at: new Date().toISOString(), saved_by: req.user?.name }));
  // Update page
  const { content, title, meta_title, meta_description } = req.body;
  await db.prepare('UPDATE cms_pages SET content=COALESCE(?,content), title=COALESCE(?,title), meta_title=COALESCE(?,meta_title), meta_description=COALESCE(?,meta_description), is_active=1, updated_at=NOW() WHERE id=?')
    .run(content, title, meta_title, meta_description, req.params.id);
  res.json({ success: true, version: versionKey });
});

// POST /api/cms/pages/:id/revert/:versionId — revert to version
router.post('/pages/:id/revert/:versionId', authMiddleware, adminOnly, async (req, res) => {
  const version = (await db.prepare("SELECT value FROM app_settings WHERE key=?").get(req.params.versionId))?.value;
  if (!version) return res.status(404).json({ error: 'Version not found' });
  const data = JSON.parse(version);
  await db.prepare('UPDATE cms_pages SET content=?, title=?, updated_at=NOW() WHERE id=?').run(data.content, data.title, req.params.id);
  res.json({ success: true, reverted_to: req.params.versionId });
});

export default router;

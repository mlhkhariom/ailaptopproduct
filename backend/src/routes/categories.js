import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// ══════════════════════════════════════════════════════════
// CATEGORIES (with hierarchy)
// ══════════════════════════════════════════════════════════

// GET /api/categories — public (tree structure)
router.get('/', async (req, res) => {
  const { flat } = req.query;
  const all = await db.prepare("SELECT * FROM categories WHERE is_active=1 ORDER BY sort_order, name").all();
  if (flat === '1') return res.json(all);
  // Build tree
  const tree = buildTree(all);
  res.json(tree);
});

// GET /api/categories/:slug — single category + products count
router.get('/:slug', async (req, res) => {
  const cat = await db.prepare('SELECT * FROM categories WHERE slug=? OR id=?').get(req.params.slug, req.params.slug);
  if (!cat) return res.status(404).json({ error: 'Category not found' });
  const productCount = (await db.prepare("SELECT COUNT(*) as c FROM products WHERE category=? AND status='active'").get(cat.name))?.c || 0;
  const children = await db.prepare('SELECT id, name, slug, image, icon FROM categories WHERE parent_id=? AND is_active=1 ORDER BY sort_order').all(cat.id);
  // Breadcrumb
  const breadcrumb = await buildBreadcrumb(cat);
  res.json({ ...cat, product_count: productCount, children, breadcrumb });
});

// POST /api/categories — admin create
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { name, name_hi, slug, parent_id, description, image, icon, sort_order, meta_title, meta_description } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  await db.prepare("INSERT INTO categories (id, name, name_hi, slug, parent_id, description, image, icon, sort_order, meta_title, meta_description) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
    .run(id, name, name_hi || null, finalSlug, parent_id || null, description || null, image || null, icon || null, sort_order || 0, meta_title || null, meta_description || null);
  res.status(201).json(await db.prepare('SELECT * FROM categories WHERE id=?').get(id));
});

// PUT /api/categories/:id — admin update
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, name_hi, slug, parent_id, description, image, icon, sort_order, is_active, meta_title, meta_description } = req.body;
  await db.prepare("UPDATE categories SET name=COALESCE(?,name), name_hi=COALESCE(?,name_hi), slug=COALESCE(?,slug), parent_id=COALESCE(?,parent_id), description=COALESCE(?,description), image=COALESCE(?,image), icon=COALESCE(?,icon), sort_order=COALESCE(?,sort_order), is_active=COALESCE(?,is_active), meta_title=COALESCE(?,meta_title), meta_description=COALESCE(?,meta_description) WHERE id=?")
    .run(name, name_hi, slug, parent_id, description, image, icon, sort_order, is_active, meta_title, meta_description, req.params.id);
  res.json({ success: true });
});

// DELETE /api/categories/:id
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  // Move children to parent
  const cat = await db.prepare('SELECT parent_id FROM categories WHERE id=?').get(req.params.id);
  await db.prepare('UPDATE categories SET parent_id=? WHERE parent_id=?').run(cat?.parent_id || null, req.params.id);
  await db.prepare('DELETE FROM categories WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════
// BRANDS
// ══════════════════════════════════════════════════════════

// GET /api/categories/brands/all — all brands
router.get('/brands/all', async (req, res) => {
  const brands = await db.prepare("SELECT * FROM brands WHERE is_active=1 ORDER BY name").all();
  // Fallback: get brands from products if brands table empty
  if (brands.length === 0) {
    const fromProducts = await db.prepare("SELECT DISTINCT brand as name FROM products WHERE brand IS NOT NULL AND brand != '' AND status='active' ORDER BY brand").all();
    return res.json(fromProducts.map(b => ({ id: b.name, name: b.name, slug: b.name.toLowerCase() })));
  }
  res.json(brands);
});

// POST /api/categories/brands — admin create brand
router.post('/brands', authMiddleware, adminOnly, async (req, res) => {
  const { name, slug, logo, description, meta_title, meta_description } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  await db.prepare("INSERT INTO brands (id, name, slug, logo, description, meta_title, meta_description) VALUES (?,?,?,?,?,?,?)")
    .run(id, name, slug || name.toLowerCase(), logo || null, description || null, meta_title || null, meta_description || null);
  res.status(201).json(await db.prepare('SELECT * FROM brands WHERE id=?').get(id));
});

// PUT /api/categories/brands/:id
router.put('/brands/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, slug, logo, description, is_active, meta_title, meta_description } = req.body;
  await db.prepare("UPDATE brands SET name=COALESCE(?,name), slug=COALESCE(?,slug), logo=COALESCE(?,logo), description=COALESCE(?,description), is_active=COALESCE(?,is_active), meta_title=COALESCE(?,meta_title), meta_description=COALESCE(?,meta_description) WHERE id=?")
    .run(name, slug, logo, description, is_active, meta_title, meta_description, req.params.id);
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════════════════════

// GET /api/categories/search?q= — search products + categories + brands
router.get('/search/all', async (req, res) => {
  const { q } = req.query;
  if (!q || String(q).length < 2) return res.json({ products: [], categories: [], brands: [] });
  const term = `%${q}%`;
  const products = await db.prepare("SELECT id, name, slug, price, image, category, brand FROM products WHERE (name ILIKE ? OR brand ILIKE ? OR description ILIKE ?) AND status='active' LIMIT 10").all(term, term, term);
  const categories = await db.prepare("SELECT id, name, slug, image FROM categories WHERE name ILIKE ? AND is_active=1 LIMIT 5").all(term);
  const brands = await db.prepare("SELECT id, name, slug, logo FROM brands WHERE name ILIKE ? AND is_active=1 LIMIT 5").all(term);
  res.json({ products, categories, brands });
});

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════

function buildTree(items) {
  const map = {};
  const roots = [];
  items.forEach(item => { map[item.id] = { ...item, children: [] }; });
  items.forEach(item => {
    if (item.parent_id && map[item.parent_id]) map[item.parent_id].children.push(map[item.id]);
    else roots.push(map[item.id]);
  });
  return roots;
}

async function buildBreadcrumb(cat) {
  const crumbs = [{ name: cat.name, slug: cat.slug }];
  let current = cat;
  while (current.parent_id) {
    current = await db.prepare('SELECT id, name, slug, parent_id FROM categories WHERE id=?').get(current.parent_id);
    if (!current) break;
    crumbs.unshift({ name: current.name, slug: current.slug });
  }
  crumbs.unshift({ name: 'Home', slug: '/' });
  return crumbs;
}

export default router;

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/products — public, with filters
router.get('/', async (req, res) => {
  const { category, search, inStock, minPrice, maxPrice, sort } = req.query;
  let query = "SELECT * FROM products WHERE status = 'active'";
  const params = [];
  if (category) { query += ' AND category = ?'; params.push(category); }
  if (inStock === 'true') { query += ' AND in_stock = 1'; }
  if (minPrice) { query += ' AND price >= ?'; params.push(Number(minPrice)); }
  if (maxPrice) { query += ' AND price <= ?'; params.push(Number(maxPrice)); }
  if (search) { query += ' AND (name LIKE ? OR name_hi LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  const sortMap = { price_asc: 'price ASC', price_desc: 'price DESC', rating: 'rating DESC', name: 'name ASC' };
  query += ` ORDER BY ${sortMap[sort] || 'created_at DESC'}`;
  const products = (await db.prepare(query).all(...params)).map(p => ({
    ...p, ingredients: JSON.parse(p.ingredients || '[]'), benefits: JSON.parse(p.benefits || '[]'), in_stock: !!p.in_stock,
  }));
  res.json(products);
});

// ── MUST be before /:slug ──────────────────────────────────

// GET /api/products/export — export all products as CSV
router.get('/export', authMiddleware, adminOnly, async (req, res) => {
  const products = await db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  const headers = ['id','name','price','original_price','category','stock','in_stock','sku','slug','badge','status','description','meta_title','meta_description','focus_keywords','image','rating','reviews'];
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
  };
  const rows = products.map(p => headers.map(h => {
    let val = p[h];
    if (h === 'focus_keywords' && val) { try { val = JSON.parse(val).join(';'); } catch {} }
    return escape(val);
  }).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="ailaptopwala-products-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
});

// POST /api/products/import — import products from CSV
router.post('/import', authMiddleware, adminOnly, async (req, res) => {
  const { csv } = req.body;
  if (!csv) return res.status(400).json({ error: 'CSV data required' });
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return res.status(400).json({ error: 'CSV must have header + data rows' });
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  let added = 0, updated = 0, errors = [];
  const parseCSVRow = (line) => {
    const result = []; let current = ''; let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQuotes = !inQuotes; }
      else if (line[i] === ',' && !inQuotes) { result.push(current); current = ''; }
      else { current += line[i]; }
    }
    result.push(current);
    return result.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
  };
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    try {
      const values = parseCSVRow(lines[i]);
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
      if (!row.name || !row.price) { errors.push(`Row ${i}: name and price required`); continue; }
      const existing = row.sku ? await db.prepare('SELECT id FROM products WHERE sku=?').get(row.sku) : (row.id ? await db.prepare('SELECT id FROM products WHERE id=?').get(row.id) : null);
      const focusKeywords = row.focus_keywords ? JSON.stringify(row.focus_keywords.split(';').filter(Boolean)) : null;
      if (existing) {
        await db.prepare('UPDATE products SET name=?,price=?,original_price=?,category=?,stock=?,in_stock=?,slug=?,badge=?,status=?,description=?,meta_title=?,meta_description=?,focus_keywords=?,image=? WHERE id=?')
          .run(row.name, Number(row.price)||0, Number(row.original_price)||null, row.category, Number(row.stock)||0, row.in_stock==='1'?1:0, row.slug||existing.slug, row.badge||null, row.status||'active', row.description, row.meta_title||null, row.meta_description||null, focusKeywords, row.image||null, existing.id);
        updated++;
      } else {
        const id = row.id || uuid();
        const slug = row.slug || row.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
        await db.prepare('INSERT OR IGNORE INTO products (id,name,price,original_price,category,stock,in_stock,sku,slug,badge,status,description,meta_title,meta_description,focus_keywords,image,rating,reviews) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
          .run(id, row.name, Number(row.price)||0, Number(row.original_price)||null, row.category||'Laptops', Number(row.stock)||0, row.in_stock==='1'?1:0, row.sku||`ALW-${Date.now()}`, slug, row.badge||null, row.status||'active', row.description||'', row.meta_title||null, row.meta_description||null, focusKeywords, row.image||null, Number(row.rating)||4.5, Number(row.reviews)||0);
        added++;
      }
    } catch (e) { errors.push(`Row ${i}: ${e.message}`); }
  }
  res.json({ added, updated, errors, total: lines.length - 1 });
});

// GET /api/products/:slug — AFTER /export and /import
router.get('/:slug', async (req, res) => {
  const p = await db.prepare('SELECT * FROM products WHERE slug = ? OR id = ?').get(req.params.slug, req.params.slug);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json({ ...p, ingredients: JSON.parse(p.ingredients || '[]'), benefits: JSON.parse(p.benefits || '[]'), in_stock: !!p.in_stock });
});

// POST /api/products — admin only
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { name, name_hi, price, original_price, image, category, description, ingredients, benefits, usage, stock, sku, slug, badge, meta_title, meta_description, focus_keywords } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'name and price required' });
  const id = uuid();
  const finalSlug = slug || name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  await db.prepare(`INSERT INTO products (id,name,name_hi,price,original_price,image,category,description,ingredients,benefits,usage,stock,in_stock,sku,slug,badge,meta_title,meta_description,focus_keywords)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, name, name_hi, price, original_price, image, category, description,
      JSON.stringify(ingredients || []), JSON.stringify(benefits || []), usage, stock || 0, stock > 0 ? 1 : 0,
      sku || `ALW-${Date.now()}`, finalSlug, badge, meta_title || null, meta_description || null,
      Array.isArray(focus_keywords) ? JSON.stringify(focus_keywords) : focus_keywords || null);
  res.status(201).json(await db.prepare('SELECT * FROM products WHERE id = ?').get(id));
});

// PUT /api/products/:id — admin only
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, name_hi, price, original_price, image, category, description, ingredients, benefits, usage, stock, sku, slug, badge, status, meta_title, meta_description, focus_keywords } = req.body;
  await db.prepare(`UPDATE products SET name=?,name_hi=?,price=?,original_price=?,image=?,category=?,description=?,ingredients=?,benefits=?,usage=?,stock=?,in_stock=?,sku=?,slug=?,badge=?,status=?,meta_title=?,meta_description=?,focus_keywords=? WHERE id=?`)
    .run(name, name_hi, price, original_price, image, category, description,
      JSON.stringify(ingredients || []), JSON.stringify(benefits || []), usage, stock, stock > 0 ? 1 : 0,
      sku, slug, badge, status || 'active',
      meta_title || null, meta_description || null,
      Array.isArray(focus_keywords) ? JSON.stringify(focus_keywords) : focus_keywords || null,
      req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/products/:id — admin only
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;

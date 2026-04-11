import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/products — public, with filters
router.get('/', (req, res) => {
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

  const products = db.prepare(query).all(...params).map(p => ({
    ...p,
    ingredients: JSON.parse(p.ingredients || '[]'),
    benefits: JSON.parse(p.benefits || '[]'),
    in_stock: !!p.in_stock,
  }));
  res.json(products);
});

// GET /api/products/:slug
router.get('/:slug', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE slug = ? OR id = ?').get(req.params.slug, req.params.slug);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json({ ...p, ingredients: JSON.parse(p.ingredients || '[]'), benefits: JSON.parse(p.benefits || '[]'), in_stock: !!p.in_stock });
});

// POST /api/products — admin only
router.post('/', authMiddleware, adminOnly, (req, res) => {
  const { name, name_hi, price, original_price, image, category, description, ingredients, benefits, usage, stock, sku, slug, badge } = req.body;
  if (!name || !price || !slug) return res.status(400).json({ error: 'name, price, slug required' });
  const id = uuid();
  db.prepare(`INSERT INTO products (id, name, name_hi, price, original_price, image, category, description, ingredients, benefits, usage, stock, in_stock, sku, slug, badge)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, name, name_hi, price, original_price, image, category, description,
      JSON.stringify(ingredients || []), JSON.stringify(benefits || []), usage, stock || 0, stock > 0 ? 1 : 0, sku, slug, badge);
  res.status(201).json(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
});

// PUT /api/products/:id — admin only
router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const { name, name_hi, price, original_price, image, category, description, ingredients, benefits, usage, stock, sku, slug, badge, status } = req.body;
  db.prepare(`UPDATE products SET name=?, name_hi=?, price=?, original_price=?, image=?, category=?, description=?, ingredients=?, benefits=?, usage=?, stock=?, in_stock=?, sku=?, slug=?, badge=?, status=? WHERE id=?`)
    .run(name, name_hi, price, original_price, image, category, description,
      JSON.stringify(ingredients || []), JSON.stringify(benefits || []), usage, stock, stock > 0 ? 1 : 0, sku, slug, badge, status || 'active', req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/products/:id — admin only
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminOnly } from '../../middleware/adminOnly.js';

const router = Router();

// ── GET /api/products/:productId/variants ─────────────────
router.get('/:productId/variants', async (req, res) => {
  const variants = await db.prepare('SELECT * FROM product_variants WHERE product_id=? AND is_active=1 ORDER BY sort_order').all(req.params.productId);
  const options = await db.prepare('SELECT * FROM product_variant_options WHERE product_id=? ORDER BY sort_order').all(req.params.productId);
  res.json({ variants, options });
});

// ── POST /api/products/:productId/variants ────────────────
router.post('/:productId/variants', authMiddleware, adminOnly, async (req, res) => {
  const { name, sku, price, original_price, stock, attributes, image, sort_order } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'name and price required' });

  const id = uuid();
  await db.prepare(`INSERT INTO product_variants (id, product_id, name, sku, price, original_price, stock, in_stock, attributes, image, sort_order)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, req.params.productId, name, sku || null, price, original_price || null,
      stock || 0, stock > 0 ? 1 : 0, JSON.stringify(attributes || {}), image || null, sort_order || 0);

  // Mark product as has_variants
  await db.prepare('UPDATE products SET has_variants=1 WHERE id=?').run(req.params.productId);

  res.status(201).json(await db.prepare('SELECT * FROM product_variants WHERE id=?').get(id));
});

// ── PUT /api/products/:productId/variants/:variantId ──────
router.put('/:productId/variants/:variantId', authMiddleware, adminOnly, async (req, res) => {
  const { name, sku, price, original_price, stock, attributes, image, sort_order, is_active } = req.body;
  const existing = await db.prepare('SELECT * FROM product_variants WHERE id=? AND product_id=?').get(req.params.variantId, req.params.productId);
  if (!existing) return res.status(404).json({ error: 'Variant not found' });

  await db.prepare(`UPDATE product_variants SET name=?, sku=?, price=?, original_price=?, stock=?, in_stock=?, attributes=?, image=?, sort_order=?, is_active=? WHERE id=?`)
    .run(name || existing.name, sku ?? existing.sku, price ?? existing.price, original_price ?? existing.original_price,
      stock ?? existing.stock, (stock ?? existing.stock) > 0 ? 1 : 0,
      JSON.stringify(attributes || existing.attributes), image ?? existing.image,
      sort_order ?? existing.sort_order, is_active ?? existing.is_active, req.params.variantId);

  res.json(await db.prepare('SELECT * FROM product_variants WHERE id=?').get(req.params.variantId));
});

// ── DELETE /api/products/:productId/variants/:variantId ────
router.delete('/:productId/variants/:variantId', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM product_variants WHERE id=? AND product_id=?').run(req.params.variantId, req.params.productId);
  // Check if any variants left
  const remaining = await db.prepare('SELECT COUNT(*) as c FROM product_variants WHERE product_id=? AND is_active=1').get(req.params.productId);
  if (remaining.c === 0) await db.prepare('UPDATE products SET has_variants=0 WHERE id=?').run(req.params.productId);
  res.json({ success: true });
});

// ── POST /api/products/:productId/variant-options ─────────
// Save variant option definitions (e.g., RAM: [8GB, 16GB], Storage: [256GB, 512GB])
router.post('/:productId/variant-options', authMiddleware, adminOnly, async (req, res) => {
  const { options } = req.body; // [{option_name: "RAM", option_values: ["8GB","16GB"]}, ...]
  if (!Array.isArray(options)) return res.status(400).json({ error: 'options array required' });

  // Replace all options for this product
  await db.prepare('DELETE FROM product_variant_options WHERE product_id=?').run(req.params.productId);
  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    await db.prepare('INSERT INTO product_variant_options (id, product_id, option_name, option_values, sort_order) VALUES (?,?,?,?,?)')
      .run(uuid(), req.params.productId, opt.option_name, JSON.stringify(opt.option_values || []), i);
  }
  res.json({ success: true, count: options.length });
});

// ── GET /api/products/:productId/images ───────────────────
router.get('/:productId/images', async (req, res) => {
  const images = await db.prepare('SELECT * FROM product_images WHERE product_id=? ORDER BY sort_order, is_primary DESC').all(req.params.productId);
  res.json(images);
});

// ── POST /api/products/:productId/images ──────────────────
router.post('/:productId/images', authMiddleware, adminOnly, async (req, res) => {
  const { url, alt, is_primary, sort_order } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });

  const id = uuid();
  // If marking as primary, unset others
  if (is_primary) {
    await db.prepare('UPDATE product_images SET is_primary=0 WHERE product_id=?').run(req.params.productId);
    // Also update main product image
    await db.prepare('UPDATE products SET image=? WHERE id=?').run(url, req.params.productId);
  }

  await db.prepare('INSERT INTO product_images (id, product_id, url, alt, sort_order, is_primary) VALUES (?,?,?,?,?,?)')
    .run(id, req.params.productId, url, alt || null, sort_order || 0, is_primary ? 1 : 0);

  res.status(201).json(await db.prepare('SELECT * FROM product_images WHERE id=?').get(id));
});

// ── DELETE /api/products/:productId/images/:imageId ────────
router.delete('/:productId/images/:imageId', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM product_images WHERE id=? AND product_id=?').run(req.params.imageId, req.params.productId);
  res.json({ success: true });
});

// ── PUT /api/products/:productId/images/reorder ───────────
router.put('/:productId/images/reorder', authMiddleware, adminOnly, async (req, res) => {
  const { order } = req.body; // [{id: "img1", sort_order: 0}, {id: "img2", sort_order: 1}]
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order array required' });
  for (const item of order) {
    await db.prepare('UPDATE product_images SET sort_order=? WHERE id=? AND product_id=?').run(item.sort_order, item.id, req.params.productId);
  }
  res.json({ success: true });
});

export default router;

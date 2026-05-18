import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminOnly } from '../../middleware/adminOnly.js';

const router = Router();

// GET /api/products — public, with filters
router.get('/', async (req, res) => {
  const { category, search, inStock, minPrice, maxPrice, sort, all, brand, ram, processor, page, limit: rawLimit } = req.query;
  // all=1 → admin sees everything (including hidden from public)
  let query = all === '1' ? "SELECT * FROM products WHERE 1=1" : "SELECT * FROM products WHERE status = 'active' AND (show_public IS NULL OR show_public = 1)";
  const params = [];
  if (category && category !== 'All') { query += ' AND category = ?'; params.push(category); }
  if (brand) { query += ' AND brand = ?'; params.push(brand); }
  if (inStock === 'true') { query += ' AND in_stock = 1'; }
  if (minPrice) { query += ' AND price >= ?'; params.push(Number(minPrice)); }
  if (maxPrice) { query += ' AND price <= ?'; params.push(Number(maxPrice)); }
  if (ram) { query += ' AND (name ILIKE ? OR description ILIKE ?)'; params.push(`%${ram}%`, `%${ram}%`); }
  if (processor) { query += ' AND (name ILIKE ? OR description ILIKE ?)'; params.push(`%${processor}%`, `%${processor}%`); }
  if (search) { query += ' AND (name ILIKE ? OR name_hi ILIKE ? OR description ILIKE ? OR brand ILIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }

  // Count total before pagination
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const totalResult = await db.prepare(countQuery).get(...params);
  const total = totalResult?.total || 0;

  const sortMap = { price_asc: 'price ASC', price_desc: 'price DESC', rating: 'rating DESC', name: 'name ASC', newest: 'created_at DESC', popular: 'reviews DESC', discount: 'CASE WHEN original_price > 0 THEN (original_price - price) * 100 / original_price ELSE 0 END DESC' };
  query += ` ORDER BY ${sortMap[sort] || 'created_at DESC'}`;

  // Pagination
  const limit = Math.min(Number(rawLimit) || 20, 100);
  const currentPage = Math.max(Number(page) || 1, 1);
  const offset = (currentPage - 1) * limit;
  query += ` LIMIT ${limit} OFFSET ${offset}`;

  const products = (await db.prepare(query).all(...params)).map(p => ({
    ...p, ingredients: JSON.parse(p.ingredients || '[]'), benefits: JSON.parse(p.benefits || '[]'), in_stock: !!p.in_stock,
  }));

  // Get available filters (dynamic from actual data)
  const brands = await db.prepare("SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand != '' AND status='active' ORDER BY brand").all();
  const categories = await db.prepare("SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND status='active' ORDER BY category").all();
  const priceRange = await db.prepare("SELECT MIN(price) as min, MAX(price) as max FROM products WHERE status='active'").get();

  res.json({
    products,
    pagination: { page: currentPage, limit, total, totalPages: Math.ceil(total / limit) },
    filters: {
      brands: brands.map(b => b.brand),
      categories: categories.map(c => c.category),
      price_range: { min: priceRange?.min || 0, max: priceRange?.max || 200000 },
    }
  });
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

// POST /api/products/import-xlsx — import from Excel file (multipart upload)
import multer from 'multer';
const xlsUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/import-xlsx', authMiddleware, adminOnly, xlsUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Excel file required' });
  try {
    const XLSX = await import('xlsx');
    const wb = XLSX.read(req.file.buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);

    let added = 0, updated = 0, errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Map Excel columns to DB fields (supports your format + standard)
        const name = row['PRODUCT NAME'] || row['name'] || row['Name'] || '';
        const brand = row['BRAND'] || row['brand'] || '';
        const model = row['MODEL / SERIES'] || row['model'] || '';
        const fullName = name || `${brand} ${model}`.trim();
        if (!fullName) { errors.push(`Row ${i+2}: no name`); continue; }

        const price = Number(row['SELLING PRICE'] || row['price'] || row['Price'] || 0);
        const purchasePrice = Number(row['PURCHASE PRICE'] || row['original_price'] || row['Compare Price'] || 0);
        const stock = Number(row['QUANTITY'] || row['stock'] || row['Stock'] || 0);
        const category = row['CATEGORY OPTION'] || row['category'] || row['Category'] || 'Laptops';
        const sku = row['sku'] || row['SKU'] || '';
        const condition = row['CONDITION'] || row['condition'] || row['QUALITY'] || '';

        // Build description from specs
        const specs = [
          row['PROCESSOR COMPANY'] && row['GEN'] ? `${row['PROCESSOR COMPANY']} ${row['GEN']}` : '',
          row['RAM'] || '', row['STORAGE'] || '', row['SCREEN'] || '',
          row['TOUCH'] === 'Yes' ? 'Touchscreen' : '',
          row['GRAPHICS'] || '', row['OTHER FEATURES'] || '',
          row['KEYBOARD'] || '', row['COLOR'] || '',
        ].filter(Boolean);
        const description = row['description'] || row['Description'] || specs.join(' | ') || '';

        const slug = (row['slug'] || fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')).slice(0, 80) + '-' + Date.now().toString().slice(-4);

        // Check existing by SKU or name
        const existing = sku
          ? await db.prepare('SELECT id FROM products WHERE sku=?').get(sku)
          : await db.prepare('SELECT id FROM products WHERE name=?').get(fullName);

        if (existing) {
          await db.prepare('UPDATE products SET price=?,original_price=?,stock=?,in_stock=?,category=?,description=? WHERE id=?')
            .run(price || undefined, purchasePrice || undefined, stock, stock > 0 ? 1 : 0, category, description, existing.id);
          updated++;
        } else {
          const id = uuid();
          await db.prepare(`INSERT INTO products (id,name,price,original_price,category,stock,in_stock,sku,slug,status,description,badge,show_public) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
            .run(id, fullName, price, purchasePrice || null, category, stock, stock > 0 ? 1 : 0, sku || `ALW-${Date.now().toString().slice(-6)}`, slug, 'active', description, condition || null, 1);
          added++;
        }
      } catch (e) { errors.push(`Row ${i+2}: ${e.message}`); }
    }

    res.json({ added, updated, errors: errors.slice(0, 20), total: rows.length, sheet: wb.SheetNames[0] });
  } catch (e) {
    res.status(500).json({ error: 'Failed to parse Excel: ' + e.message });
  }
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

// GET /api/products/barcode/:id — generate barcode label HTML (printable)
router.get('/barcode/:id', authMiddleware, adminOnly, async (req, res) => {
  const product = await db.prepare('SELECT name, sku, price, slug FROM products WHERE id=?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const sku = product.sku || 'N/A';
  // Simple Code128-like barcode as SVG
  const bars = sku.split('').map((c, i) => {
    const w = ((c.charCodeAt(0) % 3) + 1);
    return `<rect x="${i * 4}" y="0" width="${w}" height="40" fill="black"/>`;
  }).join('');
  const svg = `<svg width="${sku.length * 4 + 10}" height="40" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
  const html = `<!DOCTYPE html><html><head><title>Label: ${product.name}</title><style>body{font-family:sans-serif;text-align:center;padding:20px}.label{border:1px dashed #ccc;padding:15px;display:inline-block;width:280px}h3{margin:0 0 5px;font-size:14px}p{margin:2px 0;font-size:11px;color:#666}.barcode{margin:10px 0}.price{font-size:18px;font-weight:bold}@media print{.no-print{display:none}}</style></head><body>
  <button class="no-print" onclick="window.print()">🖨️ Print Label</button>
  <div class="label"><h3>${product.name}</h3><p>SKU: ${sku}</p><div class="barcode">${svg}</div><p class="price">₹${product.price?.toLocaleString('en-IN')}</p><p>ailaptopwala.com/products/${product.slug}</p></div></body></html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// GET /api/products/:slug — AFTER /export and /import
router.get('/:slug', async (req, res) => {
  const p = await db.prepare('SELECT * FROM products WHERE slug = ? OR id = ?').get(req.params.slug, req.params.slug);
  if (!p) return res.status(404).json({ error: 'Product not found' });

  // Fetch images and variants
  const images = await db.prepare('SELECT * FROM product_images WHERE product_id=? ORDER BY sort_order, is_primary DESC').all(p.id);
  const variants = p.has_variants ? await db.prepare('SELECT * FROM product_variants WHERE product_id=? AND is_active=1 ORDER BY sort_order').all(p.id) : [];
  const variant_options = p.has_variants ? await db.prepare('SELECT * FROM product_variant_options WHERE product_id=? ORDER BY sort_order').all(p.id) : [];

  res.json({
    ...p,
    ingredients: JSON.parse(p.ingredients || '[]'),
    benefits: JSON.parse(p.benefits || '[]'),
    specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications || '{}') : (p.specifications || {}),
    highlights: typeof p.highlights === 'string' ? JSON.parse(p.highlights || '[]') : (p.highlights || []),
    images: images.length > 0 ? images : (p.image ? [{ id: 'main', url: p.image, is_primary: 1 }] : []),
    variants,
    variant_options: variant_options.map(vo => ({ ...vo, option_values: typeof vo.option_values === 'string' ? JSON.parse(vo.option_values) : vo.option_values })),
    in_stock: !!p.in_stock
  });
});

// POST /api/products — admin only
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { name, name_hi, price, original_price, image, category, description, ingredients, benefits, usage, stock, sku, slug, badge, meta_title, meta_description, focus_keywords, branch_id } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'name and price required' });
  const id = uuid();
  const finalSlug = slug || name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  await db.prepare(`INSERT INTO products (id,name,name_hi,price,original_price,image,category,description,ingredients,benefits,usage,stock,in_stock,sku,slug,badge,meta_title,meta_description,focus_keywords,show_public)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, name, name_hi, price, original_price, image, category, description,
      JSON.stringify(ingredients || []), JSON.stringify(benefits || []), usage, stock || 0, stock > 0 ? 1 : 0,
      sku || `ALW-${Date.now()}`, finalSlug, badge, meta_title || null, meta_description || null,
      Array.isArray(focus_keywords) ? JSON.stringify(focus_keywords) : focus_keywords || null, 1);

  // Auto-link to branch_stock (default: Silver Mall)
  const targetBranch = branch_id || 'branch-silver-mall';
  try {
    await db.prepare('INSERT INTO branch_stock (id,branch_id,product_id,stock,reorder_level) VALUES (?,?,?,?,?) ON CONFLICT (branch_id,product_id) DO UPDATE SET stock=EXCLUDED.stock')
      .run(uuid(), targetBranch, id, stock || 0, 5);
  } catch {}

  res.status(201).json(await db.prepare('SELECT * FROM products WHERE id = ?').get(id));
});

// PUT /api/products/:id — admin only (supports partial update)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  // Get existing product first, merge with incoming data
  const existing = await db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const { name, name_hi, price, original_price, image, category, description, ingredients, benefits, usage, stock, in_stock, sku, slug, badge, status, meta_title, meta_description, focus_keywords, show_public } = { ...existing, ...req.body };

  await db.prepare(`UPDATE products SET name=?,name_hi=?,price=?,original_price=?,image=?,category=?,description=?,ingredients=?,benefits=?,usage=?,stock=?,in_stock=?,sku=?,slug=?,badge=?,status=?,meta_title=?,meta_description=?,focus_keywords=?,show_public=? WHERE id=?`)
    .run(
      name, name_hi, price, original_price, image || null, category, description,
      typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients || []),
      typeof benefits === 'string' ? benefits : JSON.stringify(benefits || []),
      usage, stock ?? 0, in_stock !== undefined ? (in_stock ? 1 : 0) : (stock > 0 ? 1 : 0),
      sku, slug, badge, status || 'active',
      meta_title || null, meta_description || null,
      Array.isArray(focus_keywords) ? JSON.stringify(focus_keywords) : focus_keywords || null,
      show_public === false || show_public === 0 ? 0 : 1,
      req.params.id
    );
  // Sync branch_stock when stock changes
  try {
    const hasBranch = await db.prepare('SELECT id FROM branch_stock WHERE product_id=? LIMIT 1').get(req.params.id);
    if (hasBranch) {
      await db.prepare('UPDATE branch_stock SET stock=? WHERE product_id=? AND branch_id=(SELECT branch_id FROM branch_stock WHERE product_id=? LIMIT 1)')
        .run(stock ?? 0, req.params.id, req.params.id);
    } else {
      await db.prepare('INSERT INTO branch_stock (id,branch_id,product_id,stock,reorder_level) VALUES (?,?,?,?,?)')
        .run(uuid(), 'branch-silver-mall', req.params.id, stock ?? 0, 5);
    }
  } catch {}

  // Price drop alert — notify wishlisted users
  if (price && existing.price && price < existing.price) {
    try {
      const wishlisted = await db.prepare('SELECT w.user_id, u.phone FROM wishlists w JOIN users u ON w.user_id=u.id WHERE w.product_id=? AND w.notify_price_drop=1').all(req.params.id);
      if (wishlisted.length > 0) {
        const { queueWhatsAppNotification } = await import('../whatsapp/notifications.js');
        for (const w of wishlisted) {
          if (w.phone) queueWhatsAppNotification(w.phone, `🔔 Price Drop Alert!\n\n${existing.name} is now ₹${price.toLocaleString('en-IN')} (was ₹${existing.price.toLocaleString('en-IN')})\n\n👉 Buy now: https://ailaptopwala.com/products/${existing.slug}`);
        }
      }
    } catch {}
  }

  res.json({ message: 'Updated' });
});

// DELETE /api/products/:id — admin only
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// DELETE /api/products/bulk/delete — superadmin only
router.post('/bulk/delete', authMiddleware, async (req, res) => {
  if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Only Super Admin can bulk delete products' });
  const { ids } = req.body;
  if (!ids?.length) return res.status(400).json({ error: 'ids array required' });
  for (const id of ids) {
    await db.prepare('DELETE FROM products WHERE id=?').run(id);
  }
  res.json({ message: `${ids.length} products deleted`, count: ids.length });
});

// POST /api/products/bulk/update — admin bulk update (price, stock, status, category)
router.post('/bulk/update', authMiddleware, adminOnly, async (req, res) => {
  const { ids, updates } = req.body;
  if (!ids?.length || !updates) return res.status(400).json({ error: 'ids array and updates object required' });

  const allowed = ['price', 'original_price', 'stock', 'status', 'category', 'brand', 'show_public', 'badge'];
  const fields = Object.keys(updates).filter(k => allowed.includes(k));
  if (fields.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  for (const id of ids) {
    const sets = fields.map(f => `${f}=?`).join(', ');
    const values = fields.map(f => updates[f]);
    await db.prepare(`UPDATE products SET ${sets}, updated_at=NOW() WHERE id=?`).run(...values, id);
    // Sync stock to branch_stock
    if (updates.stock !== undefined) {
      await db.prepare('UPDATE branch_stock SET stock=? WHERE product_id=?').run(updates.stock, id);
    }
  }
  res.json({ message: `${ids.length} products updated`, count: ids.length, fields });
});

export default router;

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// ── SUPPLIERS ─────────────────────────────────────────────

router.get('/suppliers', authMiddleware, adminOnly, async (req, res) => {
  const { search, include_inactive } = req.query;
  let q = include_inactive ? 'SELECT * FROM suppliers' : 'SELECT * FROM suppliers WHERE is_active=1';
  const params = [];
  if (search) { q += (include_inactive ? ' WHERE' : ' AND') + ' (name ILIKE ? OR contact_person ILIKE ? OR phone ILIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  q += ' ORDER BY name ASC';
  const suppliers = await db.prepare(q).all(...params) || [];
  // Attach PO stats per supplier
  const withStats = await Promise.all(suppliers.map(async s => {
    const poStats = await db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(total),0) as total, MAX(created_at) as last_po FROM purchase_orders WHERE supplier_id=?").get(s.id);
    return { ...s, po_count: poStats?.count || 0, total_spend: poStats?.total || 0, last_po: poStats?.last_po };
  }));
  res.json(withStats);
});

router.post('/suppliers', authMiddleware, adminOnly, async (req, res) => {
  const { name, contact_person, phone, email, address, gstin, payment_terms, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  await db.prepare('INSERT INTO suppliers (id,name,contact_person,phone,email,address,gstin,payment_terms,notes,branch_id) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, name, contact_person, phone, email, address, gstin, payment_terms || 'net30', notes);
  res.status(201).json(await db.prepare('SELECT * FROM suppliers WHERE id=?').get(id));
});

router.put('/suppliers/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, contact_person, phone, email, address, gstin, payment_terms, notes, is_active } = req.body;
  await db.prepare('UPDATE suppliers SET name=?,contact_person=?,phone=?,email=?,address=?,gstin=?,payment_terms=?,notes=?,is_active=? WHERE id=?')
    .run(name, contact_person, phone, email, address, gstin, payment_terms, notes, is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

router.delete('/suppliers/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM suppliers WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── PURCHASE ORDERS ───────────────────────────────────────

router.get('/purchase-orders', authMiddleware, adminOnly, async (req, res) => {
  const { status, search } = req.query;
  let q = `SELECT po.*, s.name as supplier_name, b.name as branch_name FROM purchase_orders po LEFT JOIN suppliers s ON po.supplier_id=s.id LEFT JOIN branches b ON b.id=po.branch_id WHERE 1=1`;
  const params = [];
  if (status && status !== 'all') { q += ' AND po.status=?'; params.push(status); }
  if (search) { q += ' AND (po.po_number ILIKE ? OR s.name ILIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  q += ' ORDER BY po.created_at DESC';
  res.json((await db.prepare(q).all(...params) || []).map(r => ({ ...r, items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items })));
});

router.post('/purchase-orders', authMiddleware, adminOnly, async (req, res) => {
  const { supplier_id, items, subtotal, tax, total, expected_date, notes, branch_id } = req.body;
  const id = uuid();
  const po_number = 'PO-' + Date.now().toString().slice(-6);
  await db.prepare('INSERT INTO purchase_orders (id,po_number,supplier_id,branch_id,items,subtotal,tax,total,expected_date,notes,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, po_number, supplier_id, branch_id || null, JSON.stringify(items || []), subtotal || 0, tax || 0, total || 0, expected_date, notes, req.user.id);
  res.status(201).json({ id, po_number });
});

router.put('/purchase-orders/:id', authMiddleware, adminOnly, async (req, res) => {
  const { status, items, subtotal, tax, total, expected_date, received_date, notes } = req.body;
  await db.prepare('UPDATE purchase_orders SET status=?,items=?,subtotal=?,tax=?,total=?,expected_date=?,received_date=?,notes=?,updated_at=NOW() WHERE id=?')
    .run(status, JSON.stringify(items || []), subtotal, tax, total, expected_date, received_date, notes, req.params.id);

  // If received — update product stock
  if (status === 'received' && items?.length) {
    for (const item of items) {
      if (item.product_id && item.quantity) {
        await db.prepare('UPDATE products SET stock=stock+?, in_stock=1 WHERE id=?').run(item.quantity, item.product_id);
        await db.prepare('INSERT INTO stock_movements (id,product_id,type,quantity,reference_id,reference_type,notes) VALUES (?,?,?,?,?,?,?)')
          .run(uuid(), item.product_id, 'purchase_received', item.quantity, req.params.id, 'purchase_order', `PO received`);
      }
    }
  }
  res.json({ message: 'Updated' });
});

router.delete('/purchase-orders/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.prepare('DELETE FROM purchase_orders WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── STOCK MOVEMENTS ───────────────────────────────────────

router.get('/stock-movements', authMiddleware, adminOnly, async (req, res) => {
  const { product_id, limit = 50 } = req.query;
  let q = `SELECT sm.*, p.name as product_name FROM stock_movements sm LEFT JOIN products p ON sm.product_id=p.id WHERE 1=1`;
  const params = [];
  if (product_id) { q += ' AND sm.product_id=?'; params.push(product_id); }
  q += ` ORDER BY sm.created_at DESC LIMIT ${limit}`;
  const rows = await db.prepare(q).all(...params);
  res.json(rows || []);
});

router.post('/stock-movements', authMiddleware, adminOnly, async (req, res) => {
  const { product_id, type, quantity, notes } = req.body;
  if (!product_id || !type || !quantity) return res.status(400).json({ error: 'product_id, type, quantity required' });
  const id = uuid();
  await db.prepare('INSERT INTO stock_movements (id,product_id,type,quantity,notes,created_by) VALUES (?,?,?,?,?,?)')
    .run(id, product_id, type, quantity, notes, req.user.id);

  // Update product stock
  const delta = ['sale', 'damage', 'return_to_supplier'].includes(type) ? -Math.abs(quantity) : Math.abs(quantity);
  await db.prepare('UPDATE products SET stock=GREATEST(0,stock+?), in_stock=CASE WHEN stock+?>0 THEN 1 ELSE 0 END WHERE id=?')
    .run(delta, delta, product_id);

  res.status(201).json({ id });
});

// ── INVENTORY STATS ───────────────────────────────────────

router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  const totalProducts = (await db.prepare("SELECT COUNT(*) as c FROM products WHERE status='active'").get())?.c || 0;
  const inStock = (await db.prepare("SELECT COUNT(*) as c FROM products WHERE status='active' AND in_stock=1").get())?.c || 0;
  const outOfStock = (await db.prepare("SELECT COUNT(*) as c FROM products WHERE status='active' AND in_stock=0").get())?.c || 0;
  const lowStock = (await db.prepare("SELECT COUNT(*) as c FROM products WHERE status='active' AND stock>0 AND stock<=5").get())?.c || 0;
  const totalValue = (await db.prepare("SELECT COALESCE(SUM(price*stock),0) as v FROM products WHERE status='active' AND in_stock=1").get())?.v || 0;
  const totalSuppliers = (await db.prepare("SELECT COUNT(*) as c FROM suppliers WHERE is_active=1").get())?.c || 0;
  const pendingPOs = (await db.prepare("SELECT COUNT(*) as c FROM purchase_orders WHERE status IN ('draft','ordered')").get())?.c || 0;
  const lowStockProducts = await db.prepare("SELECT id,name,stock,category,reorder_level FROM products WHERE status='active' AND stock<=COALESCE(reorder_level,5) AND stock>=0 ORDER BY stock ASC LIMIT 10").all();
  // Products below their custom reorder level
  const belowReorder = (await db.prepare("SELECT COUNT(*) as c FROM products WHERE status='active' AND stock<=COALESCE(reorder_level,5) AND stock>0").get())?.c || 0;

  res.json({ totalProducts, inStock, outOfStock, lowStock, totalValue, totalSuppliers, pendingPOs, lowStockProducts: lowStockProducts || [], belowReorder });
});

// PUT /api/inventory/products/:id/reorder-level
router.put('/products/:id/reorder-level', authMiddleware, adminOnly, async (req, res) => {
  const { reorder_level } = req.body;
  await db.prepare('UPDATE products SET reorder_level=? WHERE id=?').run(reorder_level || 5, req.params.id);
  res.json({ message: 'Updated' });
});

// GET /api/inventory/reorder-suggestions — products below reorder level with supplier info
router.get('/reorder-suggestions', authMiddleware, adminOnly, async (req, res) => {
  const products = await db.prepare(`
    SELECT p.id, p.name, p.stock, p.reorder_level, p.category, p.price,
      (SELECT s.name FROM suppliers s WHERE s.id = (SELECT supplier_id FROM purchase_orders WHERE items::text LIKE '%' || p.id || '%' ORDER BY created_at DESC LIMIT 1)) as last_supplier
    FROM products p
    WHERE p.status='active' AND p.stock <= COALESCE(p.reorder_level, 5)
    ORDER BY p.stock ASC
  `).all() || [];
  
  const suggestions = products.map(p => ({
    ...p,
    suggested_qty: Math.max(10, (p.reorder_level || 5) * 2 - p.stock),
    urgency: p.stock === 0 ? 'critical' : p.stock <= 2 ? 'high' : 'medium',
  }));
  
  res.json(suggestions);
});

// ── PHYSICAL STOCK AUDIT ──────────────────────────────────

// POST /api/inventory/audit — record physical count
router.post('/audit', authMiddleware, adminOnly, async (req, res) => {
  const { items } = req.body; // [{product_id, physical_count}]
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });
  let adjusted = 0;
  for (const item of items) {
    const product = await db.prepare('SELECT stock FROM products WHERE id=?').get(item.product_id);
    if (!product) continue;
    const diff = item.physical_count - (product.stock || 0);
    if (diff !== 0) {
      await db.prepare('UPDATE products SET stock=?, in_stock=? WHERE id=?').run(item.physical_count, item.physical_count > 0 ? 1 : 0, item.product_id);
      await db.prepare('UPDATE branch_stock SET stock=? WHERE product_id=?').run(item.physical_count, item.product_id);
      await db.prepare("INSERT INTO stock_movements (id, product_id, type, quantity, note, created_at) VALUES (?,?,?,?,?,NOW())")
        .run(uuid(), item.product_id, 'audit', diff, `Physical audit: system ${product.stock} → actual ${item.physical_count}`);
      adjusted++;
    }
  }
  res.json({ success: true, adjusted, total: items.length });
});

// GET /api/inventory/dead-stock — products with no sales in 60+ days
router.get('/dead-stock', authMiddleware, adminOnly, async (req, res) => {
  const deadStock = await db.prepare(`
    SELECT p.id, p.name, p.stock, p.price, p.created_at,
      COALESCE((SELECT MAX(o.created_at) FROM orders o WHERE o.items LIKE '%' || p.id || '%'), p.created_at) as last_sold
    FROM products p WHERE p.status='active' AND p.stock > 0
    HAVING last_sold < NOW() - INTERVAL '60 days'
    ORDER BY last_sold ASC LIMIT 50
  `).all().catch(() => []);
  // Fallback: products older than 60 days with stock
  const fallback = deadStock.length > 0 ? deadStock : await db.prepare("SELECT id, name, stock, price, created_at FROM products WHERE status='active' AND stock > 0 AND created_at < NOW() - INTERVAL '60 days' ORDER BY created_at ASC LIMIT 50").all();
  res.json(fallback);
});

// GET /api/inventory/auto-reorder — products below reorder level
router.get('/auto-reorder', authMiddleware, adminOnly, async (req, res) => {
  const items = await db.prepare(`
    SELECT p.id, p.name, p.stock, p.sku, bs.reorder_level, s.name as supplier_name, s.id as supplier_id
    FROM products p
    LEFT JOIN branch_stock bs ON bs.product_id = p.id
    LEFT JOIN purchase_orders po ON po.items LIKE '%' || p.id || '%'
    LEFT JOIN suppliers s ON po.supplier_id = s.id
    WHERE p.status='active' AND p.stock <= COALESCE(bs.reorder_level, 5)
    GROUP BY p.id ORDER BY p.stock ASC LIMIT 30
  `).all().catch(async () => {
    return await db.prepare("SELECT p.id, p.name, p.stock, p.sku FROM products p LEFT JOIN branch_stock bs ON bs.product_id=p.id WHERE p.status='active' AND p.stock <= COALESCE(bs.reorder_level, 5) ORDER BY p.stock ASC LIMIT 30").all();
  });
  res.json(items);
});

// POST /api/inventory/auto-reorder/generate — auto-create PO for low stock items
router.post('/auto-reorder/generate', authMiddleware, adminOnly, async (req, res) => {
  const lowStock = await db.prepare("SELECT p.id, p.name, p.stock, p.price FROM products p LEFT JOIN branch_stock bs ON bs.product_id=p.id WHERE p.status='active' AND p.stock <= COALESCE(bs.reorder_level, 5) AND p.stock > 0 LIMIT 20").all();
  if (lowStock.length === 0) return res.json({ message: 'No items need reorder' });
  const id = uuid();
  const poNumber = 'PO-AUTO-' + Date.now().toString().slice(-6);
  const items = lowStock.map(p => ({ product_id: p.id, product_name: p.name, quantity: 10, unit_price: Math.round(p.price * 0.6) }));
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  await db.prepare("INSERT INTO purchase_orders (id, po_number, status, items, subtotal, total) VALUES (?,?,?,?,?,?)")
    .run(id, poNumber, 'draft', JSON.stringify(items), subtotal, subtotal);
  res.status(201).json({ success: true, po_number: poNumber, items_count: items.length });
});

// GET /api/inventory/stock-count-sheet — printable stock count sheet
router.get('/stock-count-sheet', authMiddleware, adminOnly, async (req, res) => {
  const products = await db.prepare("SELECT name, sku, stock, category FROM products WHERE status='active' ORDER BY category, name").all();
  const html = `<!DOCTYPE html><html><head><title>Stock Count Sheet</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background:#f5f5f5}.header{display:flex;justify-content:space-between;margin-bottom:20px}@media print{button{display:none}}</style></head><body>
  <div class="header"><div><h2>Stock Count Sheet</h2><p>AI Laptop Wala — ${new Date().toLocaleDateString('en-IN')}</p></div><button onclick="window.print()">🖨️ Print</button></div>
  <table><thead><tr><th>#</th><th>Product</th><th>SKU</th><th>Category</th><th>System Stock</th><th>Physical Count</th><th>Difference</th><th>Notes</th></tr></thead><tbody>
  ${products.map((p, i) => `<tr><td>${i + 1}</td><td>${p.name}</td><td>${p.sku || '-'}</td><td>${p.category || '-'}</td><td>${p.stock}</td><td style="width:80px"></td><td style="width:80px"></td><td style="width:120px"></td></tr>`).join('')}
  </tbody></table><p style="margin-top:20px;font-size:11px">Total Products: ${products.length} | Counted by: _____________ | Date: _____________ | Verified by: _____________</p></body></html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

export default router;

// POST /api/inventory/grn — Generate Goods Receipt Note
router.post('/grn', authMiddleware, adminOnly, async (req, res) => {
  const { po_id, items, received_by, notes } = req.body;
  const id = uuid();
  const grn_number = `GRN-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  
  await db.prepare('INSERT INTO grn (id, grn_number, po_id, items, received_by, notes, created_at) VALUES (?,?,?,?,?,?,NOW())')
    .run(id, grn_number, po_id || null, JSON.stringify(items || []), received_by || null, notes || '');

  // Update stock for received items
  for (const item of (items || [])) {
    if (item.product_id && item.qty_received) {
      await db.prepare('UPDATE products SET stock=stock+?, in_stock=1 WHERE id=?').run(item.qty_received, item.product_id);
    }
  }

  // Update PO status if linked
  if (po_id) await db.prepare("UPDATE purchase_orders SET status='received' WHERE id=?").run(po_id);

  res.status(201).json({ id, grn_number });
});

// GET /api/inventory/grn — list GRNs
router.get('/grn', authMiddleware, adminOnly, async (req, res) => {
  const grns = await db.prepare('SELECT * FROM grn ORDER BY created_at DESC LIMIT 100').all();
  res.json(grns);
});

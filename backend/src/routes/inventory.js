import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// ── SUPPLIERS ─────────────────────────────────────────────

router.get('/suppliers', authMiddleware, adminOnly, async (req, res) => {
  const rows = await db.prepare('SELECT * FROM suppliers ORDER BY name ASC').all();
  res.json(rows || []);
});

router.post('/suppliers', authMiddleware, adminOnly, async (req, res) => {
  const { name, contact_person, phone, email, address, gstin, payment_terms, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  await db.prepare('INSERT INTO suppliers (id,name,contact_person,phone,email,address,gstin,payment_terms,notes) VALUES (?,?,?,?,?,?,?,?,?)')
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
  const rows = await db.prepare(`
    SELECT po.*, s.name as supplier_name 
    FROM purchase_orders po LEFT JOIN suppliers s ON po.supplier_id=s.id 
    ORDER BY po.created_at DESC
  `).all();
  res.json((rows || []).map(r => ({ ...r, items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items })));
});

router.post('/purchase-orders', authMiddleware, adminOnly, async (req, res) => {
  const { supplier_id, items, subtotal, tax, total, expected_date, notes } = req.body;
  const id = uuid();
  const po_number = 'PO-' + Date.now().toString().slice(-6);
  await db.prepare('INSERT INTO purchase_orders (id,po_number,supplier_id,items,subtotal,tax,total,expected_date,notes,created_by) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, po_number, supplier_id, JSON.stringify(items || []), subtotal || 0, tax || 0, total || 0, expected_date, notes, req.user.id);
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
  const lowStockProducts = await db.prepare("SELECT id,name,stock,category FROM products WHERE status='active' AND stock<=5 AND stock>=0 ORDER BY stock ASC LIMIT 10").all();

  res.json({ totalProducts, inStock, outOfStock, lowStock, totalValue, totalSuppliers, pendingPOs, lowStockProducts: lowStockProducts || [] });
});

export default router;

import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

// GET /api/invoice/:orderNumber — public invoice download (HTML)
router.get('/:orderNumber', (req, res) => {
  const order = db.prepare('SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.order_number=?').get(req.params.orderNumber);
  if (!order) return res.status(404).send('Invoice not found');

  const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
  const address = typeof order.address === 'string' ? JSON.parse(order.address || '{}') : (order.address || {});
  const date = new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice ${order.order_number}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; color: #333; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px solid #FF8000; padding-bottom: 20px; }
  .brand h1 { color: #FF8000; font-size: 24px; }
  .brand p { color: #666; font-size: 12px; }
  .invoice-info { text-align: right; }
  .invoice-info h2 { color: #333; font-size: 20px; }
  .invoice-info p { color: #666; font-size: 12px; }
  .section { margin: 20px 0; }
  .section h3 { color: #FF8000; font-size: 13px; text-transform: uppercase; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th { background: #FF8000; color: white; padding: 10px; text-align: left; font-size: 13px; }
  td { padding: 10px; border-bottom: 1px solid #eee; font-size: 13px; }
  .total-row { font-weight: bold; background: #fff8f0; }
  .grand-total { font-size: 16px; color: #FF8000; }
  .footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 20px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; background: #e8f5e9; color: #2e7d32; }
  @media print { button { display: none; } }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>💻 AI Laptop Wala</h1>
      <p>Buy, Sell & Repair Laptops</p>
      <p>Shop No. 5, IT Park Road, Indore, MP 452001</p>
      <p>📞 +91 98765 43210 | info@ailaptopwala.com</p>
    </div>
    <div class="invoice-info">
      <h2>INVOICE</h2>
      <p><strong>#${order.order_number}</strong></p>
      <p>Date: ${date}</p>
      <p><span class="badge">${order.payment_status?.toUpperCase() || 'PENDING'}</span></p>
    </div>
  </div>

  <div style="display:flex; gap:40px; margin-bottom:20px;">
    <div class="section" style="flex:1">
      <h3>Bill To</h3>
      <p><strong>${address.name || order.customer_name || 'Customer'}</strong></p>
      <p>${address.line || ''}</p>
      <p>${address.city || ''} ${address.state || ''} ${address.pin ? '- ' + address.pin : ''}</p>
      <p>${address.phone || order.customer_phone || ''}</p>
      <p>${address.email || order.customer_email || ''}</p>
    </div>
    <div class="section" style="flex:1">
      <h3>Payment Info</h3>
      <p><strong>Method:</strong> ${order.payment_method || 'N/A'}</p>
      <p><strong>Status:</strong> ${order.payment_status || 'Pending'}</p>
      ${order.razorpay_id ? `<p><strong>Txn ID:</strong> ${order.razorpay_id}</p>` : ''}
      ${order.tracking_id ? `<p><strong>Tracking:</strong> ${order.tracking_id}</p>` : ''}
    </div>
  </div>

  <table>
    <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
    ${items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.price.toLocaleString()}</td><td>₹${(i.price * i.quantity).toLocaleString()}</td></tr>`).join('')}
    <tr class="total-row"><td colspan="3">Subtotal</td><td>₹${(order.subtotal || order.total).toLocaleString()}</td></tr>
    ${order.discount > 0 ? `<tr><td colspan="3">Discount</td><td>-₹${order.discount.toLocaleString()}</td></tr>` : ''}
    <tr class="total-row grand-total"><td colspan="3"><strong>Grand Total</strong></td><td><strong>₹${order.total.toLocaleString()}</strong></td></tr>
  </table>

  <div class="footer">
    <p>Thank you for shopping with AI Laptop Wala! 💻</p>
    <p>For support: +91 98765 43210 | info@ailaptopwala.com</p>
    <p style="margin-top:10px;">
      <button onclick="window.print()" style="padding:8px 20px;background:#FF8000;color:white;border:none;border-radius:4px;cursor:pointer;font-size:13px;">🖨️ Print / Download PDF</button>
    </p>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

export default router;

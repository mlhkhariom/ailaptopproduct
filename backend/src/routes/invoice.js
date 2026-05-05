import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

// ── Shared invoice HTML generator ────────────────────────
const LOGO_URL = 'https://ailaptopwala.com/assets/logo.png';
const BRAND = {
  name: 'AI Laptop Wala',
  tagline: 'Buy, Sell & Repair Laptops',
  address: 'Silver Mall, LB-21, RNT Marg, Indore 452001',
  phone: '+91 98934 96163',
  email: 'info@ailaptopwala.com',
  website: 'ailaptopwala.com',
  gstin: '23ATNPA4415H1Z2',
};

const invoiceCSS = `
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Segoe UI',Arial,sans-serif; background:#f5f5f5; color:#222; }
.page { background:#fff; max-width:780px; margin:0 auto; padding:40px; }
.header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:20px; border-bottom:3px solid #FF8000; margin-bottom:24px; }
.logo-wrap { display:flex; align-items:center; gap:12px; }
.logo-wrap img { height:52px; width:auto; object-fit:contain; }
.brand-text h1 { font-size:20px; font-weight:800; color:#FF8000; line-height:1.2; }
.brand-text p { font-size:11px; color:#666; margin-top:2px; }
.inv-meta { text-align:right; }
.inv-meta .inv-title { font-size:22px; font-weight:900; color:#222; letter-spacing:1px; }
.inv-meta .inv-num { font-size:13px; color:#FF8000; font-weight:700; margin-top:4px; }
.inv-meta p { font-size:11px; color:#666; margin-top:2px; }
.status-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; margin-top:6px; }
.paid { background:#e8f5e9; color:#2e7d32; }
.pending { background:#fff3e0; color:#e65100; }
.parties { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:24px; }
.party-box { background:#fafafa; border:1px solid #eee; border-radius:8px; padding:14px; }
.party-box h3 { font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#999; margin-bottom:8px; }
.party-box p { font-size:12px; line-height:1.7; color:#333; }
.party-box strong { color:#111; font-size:13px; }
table { width:100%; border-collapse:collapse; margin-bottom:16px; }
thead tr { background:#FF8000; }
thead th { color:#fff; padding:10px 12px; text-align:left; font-size:12px; font-weight:600; }
thead th:last-child { text-align:right; }
tbody tr:nth-child(even) { background:#fafafa; }
tbody td { padding:10px 12px; font-size:12px; border-bottom:1px solid #f0f0f0; vertical-align:top; }
tbody td:last-child { text-align:right; font-weight:600; }
.totals { margin-left:auto; width:260px; }
.totals table { margin:0; }
.totals td { padding:6px 12px; font-size:12px; border:none; }
.totals td:last-child { text-align:right; font-weight:600; }
.totals .grand td { font-size:14px; font-weight:800; color:#FF8000; border-top:2px solid #FF8000; padding-top:10px; }
.notes-box { background:#fff8f0; border-left:3px solid #FF8000; padding:10px 14px; border-radius:4px; font-size:12px; color:#555; margin-top:16px; }
.footer { margin-top:32px; padding-top:16px; border-top:1px solid #eee; display:flex; justify-content:space-between; align-items:center; }
.footer p { font-size:10px; color:#aaa; }
.print-btn { background:#FF8000; color:#fff; border:none; padding:10px 24px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:600; }
.wa-btn { background:#25D366; color:#fff; border:none; padding:10px 24px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:600; margin-left:8px; }
@media print { .no-print { display:none!important; } body { background:#fff; } }
`;

const buildInvoiceHTML = ({ invoiceNumber, invoiceType, date, billTo, paymentInfo, lineItems, subtotal, discount, gst, total, notes, paymentStatus }) => {
  const gstRows = gst > 0 ? `
    <tr><td>CGST (9%)</td><td>₹${Math.round(gst / 2).toLocaleString('en-IN')}</td></tr>
    <tr><td>SGST (9%)</td><td>₹${Math.round(gst / 2).toLocaleString('en-IN')}</td></tr>` : '';

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${invoiceNumber} — AI Laptop Wala</title>
<style>${invoiceCSS}</style>
</head><body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div class="logo-wrap">
      <img src="${LOGO_URL}" alt="AI Laptop Wala Logo" onerror="this.style.display='none'">
      <div class="brand-text">
        <h1>${BRAND.name}</h1>
        <p>${BRAND.tagline}</p>
        <p>${BRAND.address}</p>
        <p>GSTIN: ${BRAND.gstin}</p>
      </div>
    </div>
    <div class="inv-meta">
      <div class="inv-title">${invoiceType === 'service' ? 'SERVICE INVOICE' : 'TAX INVOICE'}</div>
      <div class="inv-num"># ${invoiceNumber}</div>
      <p>Date: ${date}</p>
      <p>${BRAND.phone} | ${BRAND.email}</p>
      <span class="status-badge ${paymentStatus === 'paid' ? 'paid' : 'pending'}">${paymentStatus === 'paid' ? '✓ PAID' : '⏳ PAYMENT PENDING'}</span>
    </div>
  </div>

  <!-- Bill To + Payment Info -->
  <div class="parties">
    <div class="party-box">
      <h3>Bill To</h3>
      <p><strong>${billTo.name}</strong></p>
      ${billTo.address ? `<p>${billTo.address}</p>` : ''}
      ${billTo.phone ? `<p>📞 ${billTo.phone}</p>` : ''}
      ${billTo.email ? `<p>✉ ${billTo.email}</p>` : ''}
    </div>
    <div class="party-box">
      <h3>Payment Details</h3>
      <p><strong>Method:</strong> ${paymentInfo.method || 'N/A'}</p>
      <p><strong>Status:</strong> ${paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}</p>
      ${paymentInfo.txnId ? `<p><strong>Txn ID:</strong> ${paymentInfo.txnId}</p>` : ''}
      ${paymentInfo.tracking ? `<p><strong>Tracking:</strong> ${paymentInfo.tracking}</p>` : ''}
      ${invoiceType === 'service' && paymentInfo.technician ? `<p><strong>Technician:</strong> ${paymentInfo.technician}</p>` : ''}
      ${invoiceType === 'service' && paymentInfo.device ? `<p><strong>Device:</strong> ${paymentInfo.device}</p>` : ''}
    </div>
  </div>

  <!-- Line Items -->
  <table>
    <thead><tr>
      <th>#</th><th>Description</th>
      ${invoiceType !== 'service' ? '<th>HSN</th>' : ''}
      <th>Qty</th><th>Rate</th><th>Amount</th>
    </tr></thead>
    <tbody>
      ${lineItems.map((item, i) => `<tr>
        <td>${i + 1}</td>
        <td>${item.name}${item.desc ? `<br><span style="color:#888;font-size:11px">${item.desc}</span>` : ''}</td>
        ${invoiceType !== 'service' ? `<td style="color:#888">${item.hsn || '8471'}</td>` : ''}
        <td>${item.qty}</td>
        <td>₹${Number(item.rate).toLocaleString('en-IN')}</td>
        <td>₹${Number(item.amount).toLocaleString('en-IN')}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <table>
      <tr><td>Subtotal</td><td>₹${subtotal.toLocaleString('en-IN')}</td></tr>
      ${discount > 0 ? `<tr><td>Discount</td><td style="color:#e53935">-₹${discount.toLocaleString('en-IN')}</td></tr>` : ''}
      ${gstRows}
      <tr class="grand"><td><strong>Grand Total</strong></td><td><strong>₹${total.toLocaleString('en-IN')}</strong></td></tr>
    </table>
  </div>

  ${notes ? `<div class="notes-box"><strong>Notes:</strong> ${notes}</div>` : ''}

  <!-- Footer -->
  <div class="footer">
    <div>
      <p>Thank you for choosing ${BRAND.name}!</p>
      <p>${BRAND.website} | This is a computer-generated invoice.</p>
    </div>
    <div class="no-print">
      <button class="print-btn" onclick="window.print()">🖨️ Print / Save PDF</button>
    </div>
  </div>
</div>
</body></html>`;
};

// ── GET /api/invoice/:number — ecommerce order invoice ───
router.get('/:number', async (req, res) => {
  const num = req.params.number;

  // Try ecommerce order first
  let order = await db.prepare(`SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
    FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE o.order_number=?`).get(num);

  if (order) {
    const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
    const address = typeof order.address === 'string' ? JSON.parse(order.address || '{}') : (order.address || {});
    const subtotal = order.subtotal || order.total;
    const discount = order.discount || 0;

    const html = buildInvoiceHTML({
      invoiceNumber: order.order_number,
      invoiceType: 'order',
      date: new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      billTo: {
        name: address.name || order.customer_name || 'Customer',
        address: [address.line, address.city, address.state, address.pin ? `- ${address.pin}` : ''].filter(Boolean).join(', '),
        phone: address.phone || order.customer_phone || '',
        email: address.email || order.customer_email || '',
      },
      paymentInfo: { method: order.payment_method, txnId: order.razorpay_id, tracking: order.tracking_id },
      lineItems: items.map(i => ({ name: i.name, qty: i.quantity, rate: i.price, amount: i.price * i.quantity, hsn: '8471' })),
      subtotal, discount, gst: 0, total: order.total,
      notes: null, paymentStatus: order.payment_status,
    });
    return res.setHeader('Content-Type', 'text/html').send(html);
  }

  // Try service job card
  let job = await db.prepare('SELECT * FROM service_bookings WHERE booking_number=?').get(num);
  if (job) {
    const lineItems = [
      { name: job.service_name || 'Repair Service', desc: job.diagnosis || job.issue_description || '', qty: 1, rate: job.labour_charge || 0, amount: job.labour_charge || 0 },
      ...(job.parts_charge > 0 ? [{ name: 'Parts & Components', desc: '', qty: 1, rate: job.parts_charge, amount: job.parts_charge }] : []),
    ];
    const subtotal = job.total_charge || 0;
    const gst = job.gst_enabled ? Math.round(subtotal * 0.18) : 0;
    const html = buildInvoiceHTML({
      invoiceNumber: job.booking_number,
      invoiceType: 'service',
      date: new Date(job.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      billTo: { name: job.customer_name, phone: job.customer_phone, email: job.customer_email || '', address: '' },
      paymentInfo: { method: job.payment_method, technician: job.technician, device: `${job.device_brand || ''} ${job.device_model || ''}`.trim() },
      lineItems, subtotal, discount: 0, gst, total: subtotal + gst,
      notes: job.notes, paymentStatus: job.payment_status,
    });
    return res.setHeader('Content-Type', 'text/html').send(html);
  }

  // Try custom invoice
  let custom = await db.prepare('SELECT * FROM custom_invoices WHERE invoice_number=?').get(num);
  if (custom) {
    const items = typeof custom.items === 'string' ? JSON.parse(custom.items || '[]') : (custom.items || []);
    const lineItems = items.map(i => ({ name: i.name, qty: i.qty || 1, rate: i.price, amount: i.price * (i.qty || 1) }));
    const subtotal = custom.subtotal || 0;
    const gst = custom.gst_enabled ? Math.round((subtotal - (custom.discount || 0)) * 0.18) : 0;
    const html = buildInvoiceHTML({
      invoiceNumber: custom.invoice_number,
      invoiceType: 'custom',
      date: new Date(custom.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      billTo: { name: custom.customer_name, phone: custom.customer_phone || '', email: custom.customer_email || '', address: '' },
      paymentInfo: { method: custom.payment_method },
      lineItems, subtotal, discount: custom.discount || 0, gst, total: custom.total + gst,
      notes: custom.notes, paymentStatus: custom.payment_status,
    });
    return res.setHeader('Content-Type', 'text/html').send(html);
  }

  res.status(404).send('Invoice not found');
});

export default router;

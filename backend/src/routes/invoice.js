import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

const LOGO_URL = 'https://ailaptopwala.com/assets/logo.png';
const BRAND = {
  name: 'AI Laptop Wala',
  tagline: 'Buy, Sell & Repair Laptops',
  address: 'Silver Mall, LB-21, RNT Marg, Indore – 452001, M.P.',
  phone: '+91 98934 96163',
  email: 'info@ailaptopwala.com',
  website: 'ailaptopwala.com',
  gstin: '23ATNPA4415H1Z2',
};

const invoiceCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',Arial,sans-serif;background:#f0f2f5;color:#1a1a2e;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{background:#fff;max-width:800px;margin:0 auto;min-height:100vh}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}.no-print{display:none!important}}

/* Header */
.header{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:28px 36px;display:flex;justify-content:space-between;align-items:center}
.logo-area{display:flex;align-items:center;gap:14px}
.logo-area img{height:48px;width:auto;object-fit:contain;border-radius:8px;background:#fff;padding:4px}
.logo-area .brand-name{font-size:22px;font-weight:900;color:#FF8000;letter-spacing:-0.5px}
.logo-area .brand-sub{font-size:11px;color:#aaa;margin-top:2px}
.logo-area .brand-contact{font-size:10px;color:#888;margin-top:4px}
.inv-badge{text-align:right}
.inv-badge .inv-type{font-size:11px;font-weight:700;letter-spacing:2px;color:#FF8000;text-transform:uppercase}
.inv-badge .inv-num{font-size:26px;font-weight:900;color:#fff;margin-top:2px;letter-spacing:-1px}
.inv-badge .inv-date{font-size:11px;color:#aaa;margin-top:4px}
.status-pill{display:inline-block;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;margin-top:8px;letter-spacing:0.5px}
.paid{background:#00c853;color:#fff}
.pending{background:#ff6d00;color:#fff}
.partial{background:#ffd600;color:#333}

/* Body */
.body{padding:28px 36px}

/* Parties */
.parties{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
.party-box{border:1px solid #e8e8e8;border-radius:10px;padding:16px;background:#fafafa}
.party-box .party-label{font-size:9px;font-weight:700;letter-spacing:2px;color:#FF8000;text-transform:uppercase;margin-bottom:8px}
.party-box .party-name{font-size:15px;font-weight:800;color:#1a1a2e;margin-bottom:4px}
.party-box p{font-size:12px;color:#555;line-height:1.7}
.party-box .gstin-badge{display:inline-block;background:#fff3e0;color:#e65100;font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;margin-top:4px}

/* Items table */
.items-section{margin-bottom:20px}
.items-section .section-title{font-size:10px;font-weight:700;letter-spacing:2px;color:#999;text-transform:uppercase;margin-bottom:10px}
table{width:100%;border-collapse:collapse}
thead tr{background:#1a1a2e}
thead th{color:#fff;padding:11px 14px;text-align:left;font-size:11px;font-weight:600;letter-spacing:0.5px}
thead th:nth-child(3),thead th:nth-child(4),thead th:nth-child(5){text-align:right}
tbody tr{border-bottom:1px solid #f0f0f0}
tbody tr:nth-child(even){background:#fafafa}
tbody tr:hover{background:#fff8f0}
tbody td{padding:11px 14px;font-size:12px;color:#333;vertical-align:top}
tbody td:nth-child(3),tbody td:nth-child(4),tbody td:nth-child(5){text-align:right}
tbody td:last-child{font-weight:700;color:#1a1a2e}
.item-desc{font-size:10px;color:#999;margin-top:2px}

/* Totals */
.totals-wrap{display:flex;justify-content:flex-end;margin-bottom:20px}
.totals-box{width:280px;border:1px solid #e8e8e8;border-radius:10px;overflow:hidden}
.totals-row{display:flex;justify-content:space-between;padding:9px 16px;font-size:12px;border-bottom:1px solid #f0f0f0}
.totals-row:last-child{border-bottom:none}
.totals-row.discount{color:#e53935}
.totals-row.gst{color:#555}
.totals-row.grand{background:#1a1a2e;color:#fff;font-size:15px;font-weight:800;padding:13px 16px}
.totals-row.grand span:last-child{color:#FF8000}

/* Notes */
.notes-box{background:#fff8f0;border-left:4px solid #FF8000;padding:12px 16px;border-radius:0 8px 8px 0;font-size:12px;color:#555;margin-bottom:20px}
.notes-box strong{color:#e65100;font-size:11px;letter-spacing:1px;text-transform:uppercase;display:block;margin-bottom:4px}

/* Footer */
.footer{border-top:1px solid #eee;padding:16px 36px;display:flex;justify-content:space-between;align-items:center;background:#fafafa}
.footer-brand{font-size:12px;color:#999}
.footer-brand strong{color:#FF8000}
.footer-actions{display:flex;gap:10px}
.btn-print{background:#FF8000;color:#fff;border:none;padding:10px 22px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;font-family:inherit}
.btn-print:hover{background:#e67300}
`;

const buildInvoiceHTML = ({ invoiceNumber, invoiceType, date, billTo, paymentInfo, lineItems, subtotal, discount, gst, total, notes, paymentStatus }) => {
  const typeLabel = invoiceType === 'service' ? 'SERVICE INVOICE' : invoiceType === 'custom' ? 'INVOICE' : 'TAX INVOICE';
  const statusClass = paymentStatus === 'paid' ? 'paid' : paymentStatus === 'partial' ? 'partial' : 'pending';
  // SVG icons inline for print compatibility
  const statusIcon = paymentStatus === 'paid'
    ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    : paymentStatus === 'partial'
    ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`;
  const statusText = paymentStatus === 'paid' ? 'PAID' : paymentStatus === 'partial' ? 'PARTIAL' : 'PENDING';

  const itemRows = lineItems.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>
        <div>${item.name}</div>
        ${item.desc ? `<div class="item-desc">${item.desc}</div>` : ''}
      </td>
      ${invoiceType !== 'service' ? `<td>${item.hsn || '8471'}</td>` : ''}
      <td>${item.qty}</td>
      <td>₹${Number(item.rate).toLocaleString('en-IN')}</td>
      <td>₹${Number(item.amount).toLocaleString('en-IN')}</td>
    </tr>`).join('');

  const cgst = gst > 0 ? Math.round(gst / 2) : 0;
  const sgst = gst > 0 ? gst - cgst : 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${typeLabel} — ${invoiceNumber}</title>
<style>${invoiceCSS}</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="logo-area">
      <img src="${LOGO_URL}" alt="Logo" onerror="this.style.display='none'">
      <div>
        <div class="brand-name">${BRAND.name}</div>
        <div class="brand-sub">${BRAND.tagline}</div>
        <div class="brand-contact">${BRAND.address}<br>${BRAND.phone} · ${BRAND.email}</div>
      </div>
    </div>
    <div class="inv-badge">
      <div class="inv-type">${typeLabel}</div>
      <div class="inv-num">${invoiceNumber}</div>
      <div class="inv-date">Date: ${date}</div>
      <span class="status-pill ${statusClass}" style="display:inline-flex;align-items:center;gap:5px">${statusIcon} ${statusText}</span>
    </div>
  </div>

  <!-- Body -->
  <div class="body">

    <!-- Parties -->
    <div class="parties">
      <div class="party-box">
        <div class="party-label">Bill To</div>
        <div class="party-name">${billTo.name}</div>
        ${billTo.phone ? `<p>📞 ${billTo.phone}</p>` : ''}
        ${billTo.email ? `<p>✉ ${billTo.email}</p>` : ''}
        ${billTo.address ? `<p>${billTo.address}</p>` : ''}
      </div>
      <div class="party-box">
        <div class="party-label">From</div>
        <div class="party-name">${BRAND.name}</div>
        <p>${BRAND.address}</p>
        <p>📞 ${BRAND.phone}</p>
        <span class="gstin-badge">GSTIN: ${BRAND.gstin}</span>
        ${paymentInfo.method ? `<p style="margin-top:8px;font-size:11px;color:#777">Payment: <strong>${paymentInfo.method}</strong></p>` : ''}
        ${paymentInfo.txnId ? `<p style="font-size:11px;color:#777">Txn ID: ${paymentInfo.txnId}</p>` : ''}
        ${invoiceType === 'service' && paymentInfo.device ? `<p style="font-size:11px;color:#777">Device: <strong>${paymentInfo.device}</strong></p>` : ''}
        ${invoiceType === 'service' && paymentInfo.technician ? `<p style="font-size:11px;color:#777">Technician: ${paymentInfo.technician}</p>` : ''}
        ${paymentInfo.tracking ? `<p style="font-size:11px;color:#777">Tracking: ${paymentInfo.tracking}</p>` : ''}
      </div>
    </div>

    <!-- Items -->
    <div class="items-section">
      <div class="section-title">Items / Services</div>
      <table>
        <thead>
          <tr>
            <th style="width:32px">#</th>
            <th>Description</th>
            ${invoiceType !== 'service' ? '<th style="width:60px">HSN</th>' : ''}
            <th style="width:50px">Qty</th>
            <th style="width:90px">Rate</th>
            <th style="width:100px">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="totals-wrap">
      <div class="totals-box">
        <div class="totals-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
        ${discount > 0 ? `<div class="totals-row discount"><span>Discount</span><span>−₹${discount.toLocaleString('en-IN')}</span></div>` : ''}
        ${cgst > 0 ? `<div class="totals-row gst"><span>CGST (9%)</span><span>₹${cgst.toLocaleString('en-IN')}</span></div>` : ''}
        ${sgst > 0 ? `<div class="totals-row gst"><span>SGST (9%)</span><span>₹${sgst.toLocaleString('en-IN')}</span></div>` : ''}
        <div class="totals-row grand"><span>Total Payable</span><span>₹${total.toLocaleString('en-IN')}</span></div>
      </div>
    </div>

    ${notes ? `<div class="notes-box"><strong>Notes</strong>${notes}</div>` : ''}

  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-brand">
      Thank you for choosing <strong>${BRAND.name}</strong><br>
      <span style="font-size:10px">${BRAND.website} · Computer-generated invoice</span>
    </div>
    <div class="footer-actions no-print">
      <button class="btn-print" onclick="window.print()">🖨️ Print / Save PDF</button>
    </div>
  </div>

</div>
</body>
</html>`;
};

// ── GET /api/invoice/:number ──────────────────────────────
router.get('/:number', async (req, res) => {
  const num = req.params.number;

  // Ecommerce order
  let order = await db.prepare(`SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE o.order_number=?`).get(num);
  if (order) {
    const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
    const address = typeof order.address === 'string' ? JSON.parse(order.address || '{}') : (order.address || {});
    const subtotal = order.subtotal || order.total;
    const discount = order.discount || 0;
    return res.setHeader('Content-Type', 'text/html').send(buildInvoiceHTML({
      invoiceNumber: order.order_number, invoiceType: 'order',
      date: new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      billTo: { name: address.name || order.customer_name || 'Customer', address: [address.line, address.city, address.state, address.pin ? `- ${address.pin}` : ''].filter(Boolean).join(', '), phone: address.phone || order.customer_phone || '', email: address.email || order.customer_email || '' },
      paymentInfo: { method: order.payment_method, txnId: order.razorpay_id, tracking: order.tracking_id },
      lineItems: items.map(i => ({ name: i.name, qty: i.quantity, rate: i.price, amount: i.price * i.quantity, hsn: '8471' })),
      subtotal, discount, gst: 0, total: order.total, notes: null, paymentStatus: order.payment_status,
    }));
  }

  // Service job card
  let job = await db.prepare('SELECT * FROM service_bookings WHERE booking_number=?').get(num);
  if (job) {
    const lineItems = [
      { name: job.service_name || 'Repair Service', desc: job.diagnosis || job.issue_description || '', qty: 1, rate: job.labour_charge || 0, amount: job.labour_charge || 0 },
      ...(job.parts_charge > 0 ? [{ name: 'Parts & Components', desc: '', qty: 1, rate: job.parts_charge, amount: job.parts_charge }] : []),
    ];
    const subtotal = job.total_charge || 0;
    const gst = job.gst_enabled ? Math.round(subtotal * 0.18) : 0;
    return res.setHeader('Content-Type', 'text/html').send(buildInvoiceHTML({
      invoiceNumber: job.booking_number, invoiceType: 'service',
      date: new Date(job.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      billTo: { name: job.customer_name, phone: job.customer_phone, email: job.customer_email || '', address: '' },
      paymentInfo: { method: job.payment_method, technician: job.technician, device: `${job.device_brand || ''} ${job.device_model || ''}`.trim() },
      lineItems, subtotal, discount: 0, gst, total: subtotal + gst, notes: job.notes, paymentStatus: job.payment_status,
    }));
  }

  // Custom invoice
  let custom = await db.prepare('SELECT * FROM custom_invoices WHERE invoice_number=?').get(num);
  if (custom) {
    const items = typeof custom.items === 'string' ? JSON.parse(custom.items || '[]') : (custom.items || []);
    const lineItems = items.map(i => ({ name: i.name, qty: i.qty || 1, rate: i.price, amount: i.price * (i.qty || 1) }));
    const subtotal = custom.subtotal || 0;
    const afterDiscount = subtotal - (custom.discount || 0);
    const gst = custom.gst_enabled ? Math.round(afterDiscount * 0.18) : 0;
    return res.setHeader('Content-Type', 'text/html').send(buildInvoiceHTML({
      invoiceNumber: custom.invoice_number, invoiceType: 'custom',
      date: new Date(custom.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      billTo: { name: custom.customer_name, phone: custom.customer_phone || '', email: custom.customer_email || '', address: '' },
      paymentInfo: { method: custom.payment_method },
      lineItems, subtotal, discount: custom.discount || 0, gst, total: custom.total + gst, notes: custom.notes, paymentStatus: custom.payment_status,
    }));
  }

  res.status(404).send('Invoice not found');
});

export default router;

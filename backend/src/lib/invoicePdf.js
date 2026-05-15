import PDFDocument from 'pdfkit';
import db from '../db/database.js';

// Generate GST Invoice PDF for an order/billing entry
export async function generateInvoicePDF(orderId) {
  const order = await db.prepare('SELECT * FROM orders WHERE id=? OR order_number=?').get(orderId, orderId);
  if (!order) throw new Error('Order not found');

  const settings = {};
  const rows = await db.prepare("SELECT key, value FROM app_settings WHERE key IN ('site_name','site_phone','site_email','site_address','gstin','invoice_prefix','invoice_footer')").all();
  rows.forEach(r => { settings[r.key] = r.value; });

  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  const address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {});

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const buffers = [];
  doc.on('data', b => buffers.push(b));

  // Header
  doc.fontSize(18).font('Helvetica-Bold').text(settings.site_name || 'AI Laptop Wala', 50, 50);
  doc.fontSize(9).font('Helvetica')
    .text(settings.site_address || 'Silver Mall, RNT Marg, Indore 452001', 50, 72)
    .text(`Phone: ${settings.site_phone || '+91 98934 96163'} | Email: ${settings.site_email || 'ailaptopwala@gmail.com'}`, 50, 84)
    .text(`GSTIN: ${settings.gstin || 'N/A'}`, 50, 96);

  // Invoice title
  doc.fontSize(14).font('Helvetica-Bold').text('TAX INVOICE', 400, 50, { align: 'right' });
  doc.fontSize(9).font('Helvetica')
    .text(`Invoice: ${settings.invoice_prefix || 'INV-'}${order.order_number}`, 400, 70, { align: 'right' })
    .text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, 400, 82, { align: 'right' })
    .text(`Status: ${order.payment_status?.toUpperCase() || 'PENDING'}`, 400, 94, { align: 'right' });

  // Divider
  doc.moveTo(50, 115).lineTo(545, 115).stroke();

  // Bill To
  doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', 50, 125);
  doc.fontSize(9).font('Helvetica')
    .text(address.name || 'Customer', 50, 140)
    .text(address.line || address.address || '', 50, 152)
    .text(`${address.city || ''}, ${address.state || ''} - ${address.pin || ''}`, 50, 164)
    .text(`Phone: ${address.phone || ''}`, 50, 176);

  // Table header
  const tableTop = 200;
  doc.font('Helvetica-Bold').fontSize(9);
  doc.text('#', 50, tableTop).text('Item', 70, tableTop).text('Qty', 350, tableTop)
    .text('Rate', 400, tableTop).text('Amount', 470, tableTop);
  doc.moveTo(50, tableTop + 14).lineTo(545, tableTop + 14).stroke();

  // Items
  let y = tableTop + 22;
  doc.font('Helvetica').fontSize(9);
  items.forEach((item, i) => {
    const amount = (item.price || 0) * (item.quantity || 1);
    doc.text(String(i + 1), 50, y).text(item.name || 'Product', 70, y, { width: 270 })
      .text(String(item.quantity || 1), 350, y).text(`₹${(item.price || 0).toLocaleString('en-IN')}`, 400, y)
      .text(`₹${amount.toLocaleString('en-IN')}`, 470, y);
    y += 18;
  });

  // Totals
  doc.moveTo(50, y + 5).lineTo(545, y + 5).stroke();
  y += 15;
  doc.font('Helvetica').text('Subtotal:', 380, y).text(`₹${(order.subtotal || order.total).toLocaleString('en-IN')}`, 470, y);
  y += 15;
  if (order.discount > 0) { doc.text('Discount:', 380, y).text(`-₹${order.discount.toLocaleString('en-IN')}`, 470, y); y += 15; }

  // GST (18%)
  const taxable = (order.subtotal || order.total) - (order.discount || 0);
  const cgst = Math.round(taxable * 0.09);
  const sgst = Math.round(taxable * 0.09);
  doc.text('CGST (9%):', 380, y).text(`₹${cgst.toLocaleString('en-IN')}`, 470, y); y += 15;
  doc.text('SGST (9%):', 380, y).text(`₹${sgst.toLocaleString('en-IN')}`, 470, y); y += 15;

  doc.font('Helvetica-Bold').fontSize(11);
  doc.text('TOTAL:', 380, y).text(`₹${order.total.toLocaleString('en-IN')}`, 470, y);

  // Footer
  y += 40;
  doc.font('Helvetica').fontSize(8).fillColor('#666')
    .text(settings.invoice_footer || 'Thank you for your business! For support: +91 98934 96163', 50, y, { align: 'center', width: 495 });

  // Terms
  y += 20;
  doc.text('Terms: Goods once sold will not be taken back. Warranty as per product card.', 50, y, { align: 'center', width: 495 });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

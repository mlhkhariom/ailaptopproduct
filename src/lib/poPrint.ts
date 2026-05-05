// PO Print utility
export const printPurchaseOrder = (po: any) => {
  const win = window.open('', '_blank');
  if (!win) return;
  const items = Array.isArray(po.items) ? po.items : [];
  const date = new Date(po.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Purchase Order ${po.po_number}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;padding:32px;max-width:700px;margin:0 auto;color:#333}
  .hdr{display:flex;justify-content:space-between;border-bottom:3px solid #FF8000;padding-bottom:16px;margin-bottom:20px}
  .brand h1{color:#FF8000;font-size:20px;font-weight:800}
  .brand p{font-size:11px;color:#666;margin-top:2px}
  .po-meta{text-align:right}
  .po-meta h2{font-size:18px;font-weight:700}
  .po-meta p{font-size:12px;color:#666;margin-top:2px}
  .status{display:inline-block;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;margin-top:6px;background:#e8f5e9;color:#2e7d32}
  .info{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
  .info-box{background:#fafafa;border:1px solid #eee;border-radius:8px;padding:12px}
  .info-box h3{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:6px}
  .info-box p{font-size:12px;line-height:1.6}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th{background:#FF8000;color:#fff;padding:9px 12px;text-align:left;font-size:12px}
  th:last-child,td:last-child{text-align:right}
  td{padding:9px 12px;font-size:12px;border-bottom:1px solid #f0f0f0}
  .total-row{font-weight:700;background:#fff8f0}
  .grand{font-size:14px;font-weight:800;color:#FF8000}
  .footer{margin-top:28px;padding-top:14px;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:10px;color:#aaa}
  @media print{button{display:none}}
</style></head><body>
<div class="hdr">
  <div class="brand">
    <h1>AI Laptop Wala</h1>
    <p>Asati Infotech | Silver Mall, Indore</p>
    <p>GSTIN: 23ATNPA4415H1Z2</p>
  </div>
  <div class="po-meta">
    <h2>PURCHASE ORDER</h2>
    <p># ${po.po_number}</p>
    <p>Date: ${date}</p>
    <span class="status">${po.status?.toUpperCase()}</span>
  </div>
</div>
<div class="info">
  <div class="info-box">
    <h3>Supplier</h3>
    <p><strong>${po.supplier_name || 'N/A'}</strong></p>
  </div>
  <div class="info-box">
    <h3>Delivery</h3>
    <p>Expected: ${po.expected_date || 'TBD'}</p>
    ${po.received_date ? `<p>Received: ${po.received_date}</p>` : ''}
  </div>
</div>
<table>
  <tr><th>#</th><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
  ${items.map((item: any, i: number) => `
  <tr>
    <td>${i + 1}</td>
    <td>${item.product_name || 'Product'}</td>
    <td>${item.quantity}</td>
    <td>₹${(item.unit_price || 0).toLocaleString('en-IN')}</td>
    <td>₹${((item.quantity || 0) * (item.unit_price || 0)).toLocaleString('en-IN')}</td>
  </tr>`).join('')}
  <tr class="total-row"><td colspan="4">Subtotal</td><td>₹${(po.subtotal || 0).toLocaleString('en-IN')}</td></tr>
  <tr class="total-row"><td colspan="4">GST (18%)</td><td>₹${(po.tax || 0).toLocaleString('en-IN')}</td></tr>
  <tr class="total-row grand"><td colspan="4"><strong>Grand Total</strong></td><td><strong>₹${(po.total || 0).toLocaleString('en-IN')}</strong></td></tr>
</table>
${po.notes ? `<p style="font-size:12px;color:#666;margin-bottom:16px"><strong>Notes:</strong> ${po.notes}</p>` : ''}
<div class="footer">
  <p>AI Laptop Wala | ailaptopwala.com</p>
  <p>Generated: ${new Date().toLocaleDateString('en-IN')}</p>
</div>
<br><button onclick="window.print()" style="background:#FF8000;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:13px">Print PO</button>
</body></html>`);
  win.document.close();
};

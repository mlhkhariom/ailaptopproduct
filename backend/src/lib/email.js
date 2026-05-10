// Central email helper — all emails go through here
// Respects admin's SMTP settings + notification toggles from DB

import db from '../db/database.js';

const getS = async (k) => (await db.prepare('SELECT value FROM app_settings WHERE key=?').get(k))?.value;

export async function getSmtpConfig() {
  return {
    host: (await getS('smtp_host')) || process.env.SMTP_HOST,
    port: parseInt((await getS('smtp_port')) || process.env.SMTP_PORT || '587'),
    secure: (await getS('smtp_secure')) === 'true',
    user: (await getS('smtp_user')) || process.env.SMTP_USER,
    pass: (await getS('smtp_pass')) || process.env.SMTP_PASS,
    from: (await getS('smtp_from')) || process.env.SMTP_FROM || 'info@ailaptopwala.com',
  };
}

export async function isEmailEnabled(toggleKey) {
  // default ON — only disabled if explicitly set to 'false'
  const val = await getS(toggleKey);
  return val !== 'false';
}

export async function sendEmail({ to, subject, html, toggleKey }) {
  if (!to) return { skipped: 'no recipient' };
  if (toggleKey) {
    const enabled = await isEmailEnabled(toggleKey);
    if (!enabled) return { skipped: `disabled by admin toggle: ${toggleKey}` };
  }
  const cfg = await getSmtpConfig();
  if (!cfg.host || !cfg.user) return { skipped: 'SMTP not configured' };

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: cfg.host, port: cfg.port, secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass },
    });
    await transporter.sendMail({ from: cfg.from, to, subject, html });
    return { sent: true };
  } catch (e) {
    console.error('[Email]', toggleKey || 'custom', '→', to, ':', e.message);
    return { error: e.message };
  }
}

// ── Email Templates ──────────────────────────────────────
const layout = (content) => `
<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f8f9fa;color:#333;">
<div style="background:#fff;border-radius:8px;padding:30px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<div style="text-align:center;margin-bottom:20px;border-bottom:2px solid #FF8000;padding-bottom:15px;">
<h1 style="color:#FF8000;margin:0;font-size:24px;">AI Laptop Wala</h1>
<p style="color:#666;margin:4px 0 0;font-size:12px;">Buy, Sell & Repair Laptops — Indore</p>
</div>
${content}
<div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #e5e5e5;color:#999;font-size:11px;">
<p>Silver Mall, LB-21, RNT Marg, Indore | +91 98934 96163</p>
<p>© ${new Date().getFullYear()} AI Laptop Wala. All rights reserved.</p>
</div></div></body></html>`;

export const EmailTemplates = {
  orderConfirmation: (o, name) => layout(`
    <h2>Order Confirmed! 🎉</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Thanks for your order. We've received it and will notify you as it ships.</p>
    <div style="background:#fff5e6;padding:15px;border-radius:6px;border-left:4px solid #FF8000;margin:15px 0;">
      <p style="margin:4px 0;"><b>Order #:</b> ${o.order_number}</p>
      <p style="margin:4px 0;"><b>Total:</b> ₹${o.total}</p>
      <p style="margin:4px 0;"><b>Payment:</b> ${o.payment_method?.toUpperCase()}</p>
    </div>
    <a href="https://ailaptopwala.com/track-order?number=${o.order_number}" style="display:inline-block;background:#FF8000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:10px;">Track Your Order →</a>
  `),

  orderShipped: (o, name, tracking) => layout(`
    <h2>Your Order is on the Way! 📦</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Good news — your order <b>#${o.order_number}</b> has been shipped.</p>
    ${tracking ? `<div style="background:#e8f5e9;padding:15px;border-radius:6px;margin:15px 0;"><p style="margin:0;"><b>Tracking:</b> ${tracking}</p></div>` : ''}
    <a href="https://ailaptopwala.com/track-order?number=${o.order_number}" style="display:inline-block;background:#FF8000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:10px;">Track Shipment →</a>
  `),

  orderDelivered: (o, name) => layout(`
    <h2>Delivered! ✅</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Your order <b>#${o.order_number}</b> has been delivered.</p>
    <p>We'd love your feedback — if anything isn't right, reply to this email and we'll make it right.</p>
    <a href="https://ailaptopwala.com/track-order?number=${o.order_number}" style="display:inline-block;background:#FF8000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:10px;">Leave a Review →</a>
  `),

  invoice: (inv, name) => layout(`
    <h2>Invoice — ${inv.invoice_number || inv.booking_number}</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Please find your invoice details below:</p>
    <div style="background:#f5f5f5;padding:15px;border-radius:6px;margin:15px 0;">
      <p style="margin:4px 0;"><b>Amount Due:</b> ₹${inv.amount || inv.total_charge}</p>
      <p style="margin:4px 0;"><b>Description:</b> ${inv.description || inv.service_name || 'Invoice'}</p>
    </div>
    ${inv.payment_link ? `<a href="${inv.payment_link}" style="display:inline-block;background:#FF8000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:10px;">Pay Now →</a>` : ''}
  `),

  passwordReset: (name, resetLink) => layout(`
    <h2>Password Reset Request 🔐</h2>
    <p>Hi ${name || 'there'},</p>
    <p>We received a request to reset your password. Click the link below to set a new one:</p>
    <a href="${resetLink}" style="display:inline-block;background:#FF8000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;margin:15px 0;">Reset Password →</a>
    <p style="color:#999;font-size:12px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
  `),

  welcome: (name) => layout(`
    <h2>Welcome to AI Laptop Wala! 🎉</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Thanks for signing up. Your account is ready — start exploring our wide range of laptops, repair services, and accessories.</p>
    <ul style="line-height:1.8;">
      <li>✓ Buy new & refurbished laptops at best prices</li>
      <li>✓ Professional repair services — 90-day warranty</li>
      <li>✓ Pickup & drop available across Indore</li>
      <li>✓ EMI options available</li>
    </ul>
    <a href="https://ailaptopwala.com" style="display:inline-block;background:#FF8000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:10px;">Start Shopping →</a>
  `),

  serviceUpdate: (jobCard, name, status) => layout(`
    <h2>Service Update 🛠️</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Your repair <b>${jobCard.booking_number || jobCard.id}</b> status has been updated:</p>
    <div style="background:#fff5e6;padding:15px;border-radius:6px;border-left:4px solid #FF8000;margin:15px 0;">
      <p style="margin:4px 0;"><b>Device:</b> ${jobCard.device_brand || ''} ${jobCard.device_model || ''}</p>
      <p style="margin:4px 0;"><b>Issue:</b> ${jobCard.issue_description || jobCard.service_name || ''}</p>
      <p style="margin:4px 0;font-size:16px;color:#FF8000;"><b>Status:</b> ${status}</p>
    </div>
    <a href="https://ailaptopwala.com/track-order" style="display:inline-block;background:#FF8000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:10px;">Track Repair →</a>
  `),

  adminNewOrder: (o, buyerName, buyerEmail, buyerPhone) => layout(`
    <h2>🔔 New Order Received</h2>
    <p>A new order has been placed on AI Laptop Wala:</p>
    <div style="background:#f5f5f5;padding:15px;border-radius:6px;margin:15px 0;">
      <p style="margin:4px 0;"><b>Order #:</b> ${o.order_number}</p>
      <p style="margin:4px 0;"><b>Total:</b> ₹${o.total}</p>
      <p style="margin:4px 0;"><b>Customer:</b> ${buyerName || 'Unknown'}</p>
      <p style="margin:4px 0;"><b>Email:</b> ${buyerEmail || '-'}</p>
      <p style="margin:4px 0;"><b>Phone:</b> ${buyerPhone || '-'}</p>
      <p style="margin:4px 0;"><b>Payment:</b> ${o.payment_method?.toUpperCase()} (${o.payment_status})</p>
    </div>
    <a href="https://ailaptopwala.com/admin/orders" style="display:inline-block;background:#FF8000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:10px;">View in Admin →</a>
  `),
};

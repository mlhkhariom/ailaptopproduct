import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// ── Helpers ───────────────────────────────────────────────
const getSetting = async (key) => (await db.prepare('SELECT value FROM app_settings WHERE key = ?').get(key))?.value || '';
const isEnabled = async (key) => (await getSetting(key)) === 'true';

// ── Shipping calculation ──────────────────────────────────
// GET /api/payment/shipping?subtotal=500
router.get('/shipping', async (req, res) => {
  const subtotal = Number(req.query.subtotal) || 0;
  const freeAbove = Number(getSetting('shipping_free_above')) || 499;
  const flatRate = Number(getSetting('shipping_flat_rate')) || 50;
  const expressRate = Number(getSetting('shipping_express')) || 150;
  const codCharge = Number(getSetting('shipping_cod_charge')) || 30;

  res.json({
    free: subtotal >= freeAbove,
    standard: subtotal >= freeAbove ? 0 : flatRate,
    express: expressRate,
    cod_charge: codCharge,
    free_above: freeAbove,
    courier: getSetting('shipping_courier') || 'dtdc',
  });
});

// ── Payment methods ───────────────────────────────────────
// GET /api/payment/methods — get enabled payment methods
router.get('/methods', async (req, res) => {
  res.json({
    razorpay: { enabled: isEnabled('payment_razorpay'), key_id: getSetting('razorpay_key_id') },
    paytm: { enabled: isEnabled('payment_paytm') },
    upi: { enabled: isEnabled('payment_upi') !== false },
    card: { enabled: isEnabled('payment_card') !== false },
    netbanking: { enabled: isEnabled('payment_netbanking') !== false },
    wallet: { enabled: isEnabled('payment_wallet') },
    cod: { enabled: isEnabled('payment_cod') !== false },
    emi: { enabled: isEnabled('payment_emi') },
  });
});

// ── Razorpay ──────────────────────────────────────────────
// POST /api/payment/razorpay/create-order
router.post('/razorpay/create-order', authMiddleware, async (req, res) => {
  const keyId = getSetting('razorpay_key_id');
  const keySecret = getSetting('razorpay_key_secret');

  if (!keyId || !keySecret) {
    return res.status(400).json({ error: 'Razorpay not configured. Using COD fallback.' });
  }

  try {
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: Math.round(req.body.amount * 100), // paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });
    res.json({ order_id: order.id, key_id: keyId, amount: order.amount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/payment/razorpay/verify
router.post('/razorpay/verify', authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const keySecret = getSetting('razorpay_key_secret');
  try {
    const crypto = await import('crypto');
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', keySecret).update(sign).digest('hex');
    if (expected === razorpay_signature) {
      res.json({ verified: true, payment_id: razorpay_payment_id });
    } else {
      res.status(400).json({ verified: false, error: 'Signature mismatch' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Paytm ─────────────────────────────────────────────────
// POST /api/payment/paytm/initiate
router.post('/paytm/initiate', authMiddleware, async (req, res) => {
  const merchantId = getSetting('paytm_merchant_id');
  const merchantKey = getSetting('paytm_merchant_key');

  if (!merchantId || !merchantKey) {
    return res.status(400).json({ error: 'Paytm not configured. Using COD fallback.' });
  }

  const { amount, orderId, customerId, email, phone } = req.body;
  const paytmParams = {
    MID: merchantId,
    WEBSITE: 'WEBSTAGING',
    INDUSTRY_TYPE_ID: 'Retail',
    CHANNEL_ID: 'WEB',
    ORDER_ID: orderId || `PAYTM_${Date.now()}`,
    CUST_ID: customerId,
    MOBILE_NO: phone,
    EMAIL: email,
    TXN_AMOUNT: String(amount),
    CALLBACK_URL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/paytm/callback`,
  };

  // Generate checksum (simplified — use paytmchecksum package in production)
  res.json({ params: paytmParams, note: 'Integrate paytmchecksum package for production' });
});

// POST /api/payment/paytm/callback
router.post('/paytm/callback', async (req, res) => {
  const { STATUS, ORDERID, TXNAMOUNT, TXNID } = req.body;
  if (STATUS === 'TXN_SUCCESS') {
    // Update order payment status
    await db.prepare("UPDATE orders SET payment_status='paid', razorpay_id=? WHERE order_number=?").run(TXNID, ORDERID);
    res.redirect(`http://localhost:8080/track-order?order=${ORDERID}&payment=success`);
  } else {
    res.redirect(`http://localhost:8080/checkout?payment=failed`);
  }
});

// POST /api/payment/create-link — create Razorpay Payment Link (for WhatsApp sharing)
router.post('/create-link', async (req, res) => {
  const keyId = getSetting('razorpay_key_id');
  const keySecret = getSetting('razorpay_key_secret');
  const { amount, description, customer_name, customer_phone, customer_email, order_number } = req.body;

  if (!keyId || !keySecret) {
    return res.status(400).json({ error: 'Razorpay not configured. Add keys in Admin → Settings.' });
  }

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const payload = {
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      description: description || `AI Laptop Wala Order ${order_number || ''}`,
      customer: {
        name: customer_name || 'Customer',
        contact: customer_phone ? customer_phone.replace(/[^0-9]/g, '') : undefined,
        email: customer_email || undefined,
      },
      notify: { sms: true, email: !!customer_email },
      reminder_enable: true,
      notes: { order_number: order_number || '', source: 'whatsapp_agent' },
      callback_url: `${getSetting('store_website') || 'https://ailaptopwala.com'}/order-success`,
      callback_method: 'get',
    };

    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.description || 'Payment link creation failed');

    res.json({ payment_link: data.short_url, link_id: data.id, amount: data.amount / 100 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/payment/razorpay/webhook — payment success webhook
router.post('/razorpay/webhook', async (req, res) => {
  const secret = getSetting('razorpay_webhook_secret');
  try {
    if (secret) {
      const crypto = await import('crypto');
      const sig = req.headers['x-razorpay-signature'];
      const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
      if (sig !== expected) return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment_link.paid' || event === 'payment.captured') {
      const notes = payload?.payment_link?.entity?.notes || payload?.payment?.entity?.notes || {};
      const orderNumber = notes.order_number;
      const paymentId = payload?.payment?.entity?.id || payload?.payment_link?.entity?.id;
      const phone = payload?.payment_link?.entity?.customer?.contact || payload?.payment?.entity?.contact;

      if (orderNumber) {
        await db.prepare("UPDATE orders SET payment_status='paid', razorpay_id=? WHERE order_number=?").run(paymentId, orderNumber);

        // WhatsApp notification
        if (phone) {
          const { notifyPaymentSuccess } = await import('../whatsapp/notifications.js');
          const order = await db.prepare('SELECT * FROM orders WHERE order_number=?').get(orderNumber);
          if (order) notifyPaymentSuccess(order, phone, 'Customer', paymentId);
        }
      }
    }
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

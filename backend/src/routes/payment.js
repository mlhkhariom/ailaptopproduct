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
  const pincode = String(req.query.pincode || '');
  const freeAbove = Number(await getSetting('shipping_free_above')) || 499;
  const flatRate = Number(await getSetting('shipping_flat_rate')) || 50;
  const expressRate = Number(await getSetting('shipping_express')) || 150;
  const codCharge = Number(await getSetting('shipping_cod_charge')) || 30;
  const localRate = Number(await getSetting('shipping_local_rate')) || 0;
  const localPrefix = await getSetting('shipping_local_pincode') || '452';
  const courier = await getSetting('shipping_courier') || 'dtdc';
  const daysLocal = await getSetting('shipping_days_local') || '1-2';
  const daysNational = await getSetting('shipping_days_national') || '3-5';

  const isLocal = pincode && pincode.startsWith(localPrefix);
  const isFree = subtotal >= freeAbove;
  const standard = isLocal ? localRate : (isFree ? 0 : flatRate);

  res.json({
    free: isFree && !isLocal,
    is_local: isLocal,
    standard,
    express: expressRate,
    cod_charge: codCharge,
    free_above: freeAbove,
    courier,
    estimated_days: isLocal ? daysLocal : daysNational,
  });
});

// ── Payment methods ───────────────────────────────────────
// GET /api/payment/methods — get enabled payment methods
router.get('/methods', async (req, res) => {
  res.json({
    razorpay: { enabled: await isEnabled('payment_razorpay'), key_id: await getSetting('razorpay_key_id') },
    paytm: { enabled: await isEnabled('payment_paytm') },
    cashfree: { enabled: await isEnabled('payment_cashfree'), app_id: await getSetting('cashfree_app_id') },
    phonepe: { enabled: await isEnabled('payment_phonepe'), merchant_id: await getSetting('phonepe_merchant_id') },
    upi: { enabled: (await getSetting('payment_upi')) !== 'false' },
    card: { enabled: (await getSetting('payment_card')) !== 'false' },
    netbanking: { enabled: (await getSetting('payment_netbanking')) !== 'false' },
    wallet: { enabled: await isEnabled('payment_wallet') },
    cod: { enabled: (await getSetting('payment_cod')) !== 'false' },
    emi: { enabled: await isEnabled('payment_emi') },
    // Payment settings
    min_order: Number(await getSetting('min_order')) || 0,
    max_cod: Number(await getSetting('max_cod')) || 0,
    merchant_upi: await getSetting('merchant_upi') || '',
    merchant_name: await getSetting('merchant_name') || 'AI Laptop Wala',
    prepaid_discount_enabled: (await getSetting('prepaid_discount_enabled')) === 'true',
    prepaid_discount_percent: Number(await getSetting('prepaid_discount_percent')) || 0,
  });
});

// ── Razorpay ──────────────────────────────────────────────
// POST /api/payment/razorpay/create-order
router.post('/razorpay/create-order', authMiddleware, async (req, res) => {
  const keyId = await getSetting('razorpay_key_id');
  const keySecret = await getSetting('razorpay_key_secret');

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
  const keySecret = await getSetting('razorpay_key_secret');
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
  const merchantId = await getSetting('paytm_merchant_id');
  const merchantKey = await getSetting('paytm_merchant_key');
  const website = await getSetting('paytm_website') || 'WEBSTAGING';
  const isProduction = (await getSetting('paytm_production')) === 'true';

  if (!merchantId || !merchantKey) {
    return res.status(400).json({ error: 'Paytm not configured. Add Merchant ID + Key in Admin → Settings → API Keys.' });
  }

  const { amount, orderId, customerId, email, phone } = req.body;
  if (!amount || !orderId) return res.status(400).json({ error: 'amount and orderId required' });

  const paytmParams = {
    MID: merchantId,
    WEBSITE: website,
    INDUSTRY_TYPE_ID: 'Retail',
    CHANNEL_ID: 'WEB',
    ORDER_ID: orderId,
    CUST_ID: customerId || req.user?.id || 'CUST_' + Date.now(),
    MOBILE_NO: phone || '',
    EMAIL: email || '',
    TXN_AMOUNT: String(amount),
    CALLBACK_URL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/paytm/callback`,
  };

  // Generate checksum using crypto AES-128-CBC (Paytm standard)
  const crypto = await import('crypto');
  const iv = '@@@@&&&&####$$$$';
  const salt = crypto.default.randomBytes(4).toString('hex');
  const paramString = Object.keys(paytmParams).sort().map(k => paytmParams[k]).join('|') + '|' + salt;
  const hash = crypto.default.createHash('sha256').update(paramString).digest('hex') + salt;
  const cipher = crypto.default.createCipheriv('aes-128-cbc', merchantKey.slice(0, 16), iv);
  let encrypted = cipher.update(hash, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const paytmHost = isProduction ? 'https://securegw.paytm.in' : 'https://securegw-stage.paytm.in';
  const transactionUrl = `${paytmHost}/theia/processTransaction`;

  res.json({
    params: paytmParams,
    checksumHash: encrypted,
    transactionUrl,
    environment: isProduction ? 'production' : 'staging',
  });
});

// POST /api/payment/paytm/callback — Paytm redirects here after payment
router.post('/paytm/callback', async (req, res) => {
  const { STATUS, ORDERID, TXNAMOUNT, TXNID, RESPCODE, RESPMSG } = req.body;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

  try {
    if (STATUS === 'TXN_SUCCESS') {
      await db.prepare("UPDATE orders SET payment_status='paid', razorpay_id=? WHERE order_number=?").run(TXNID, ORDERID);
      res.redirect(`${frontendUrl}/order-success?order=${ORDERID}&payment=success&gateway=paytm`);
    } else {
      console.error('Paytm payment failed:', RESPCODE, RESPMSG);
      res.redirect(`${frontendUrl}/checkout?payment=failed&reason=${encodeURIComponent(RESPMSG || 'Unknown')}`);
    }
  } catch (e) {
    console.error('Paytm callback error:', e.message);
    res.redirect(`${frontendUrl}/checkout?payment=error`);
  }
});

// POST /api/payment/paytm/verify — Verify Paytm transaction status
router.post('/paytm/verify', authMiddleware, async (req, res) => {
  const merchantId = await getSetting('paytm_merchant_id');
  const merchantKey = await getSetting('paytm_merchant_key');
  const isProduction = (await getSetting('paytm_production')) === 'true';
  const { orderId } = req.body;

  if (!merchantId || !merchantKey || !orderId) return res.status(400).json({ error: 'Missing config or orderId' });

  const host = isProduction ? 'https://securegw.paytm.in' : 'https://securegw-stage.paytm.in';
  try {
    const body = { MID: merchantId, ORDERID: orderId };
    const response = await fetch(`${host}/v3/order/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, head: { signature: '' } }),
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: 'Paytm verify failed: ' + e.message });
  }
});

// POST /api/payment/create-link — create Razorpay Payment Link (for WhatsApp sharing)
router.post('/create-link', async (req, res) => {
  const keyId = await getSetting('razorpay_key_id');
  const keySecret = await getSetting('razorpay_key_secret');
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
  const secret = await getSetting('razorpay_webhook_secret');
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



// ── CASHFREE ──────────────────────────────────────────────
router.post('/cashfree/create-order', authMiddleware, async (req, res) => {
  const appId = await getSetting('cashfree_app_id');
  const secretKey = await getSetting('cashfree_secret_key');
  const isProduction = (await getSetting('cashfree_production')) === 'true';

  if (!appId || !secretKey) {
    return res.status(400).json({ error: 'Cashfree not configured. Add App ID + Secret Key in Admin → Settings → API Keys.' });
  }

  const { amount, orderId, customerName, customerEmail, customerPhone } = req.body;
  if (!amount || !orderId) return res.status(400).json({ error: 'amount and orderId required' });

  const host = isProduction ? 'https://api.cashfree.com' : 'https://sandbox.cashfree.com';
  const payload = {
    order_id: orderId,
    order_amount: Number(amount),
    order_currency: 'INR',
    customer_details: {
      customer_id: req.user?.id || 'CUST_' + Date.now(),
      customer_name: customerName || 'Guest',
      customer_email: customerEmail || 'guest@example.com',
      customer_phone: customerPhone || '9999999999',
    },
    order_meta: {
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/order-success?order=${orderId}&gateway=cashfree`,
      notify_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/cashfree/webhook`,
    },
  };

  try {
    const response = await fetch(`${host}/pg/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (data.cf_order_id) {
      res.json({ payment_session_id: data.payment_session_id, cf_order_id: data.cf_order_id, order_id: data.order_id, environment: isProduction ? 'production' : 'sandbox' });
    } else {
      res.status(502).json({ error: data.message || 'Cashfree order create failed', detail: data });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/cashfree/verify', authMiddleware, async (req, res) => {
  const appId = await getSetting('cashfree_app_id');
  const secretKey = await getSetting('cashfree_secret_key');
  const isProduction = (await getSetting('cashfree_production')) === 'true';
  const { orderId } = req.body;

  if (!appId || !secretKey || !orderId) return res.status(400).json({ error: 'Missing config or orderId' });

  const host = isProduction ? 'https://api.cashfree.com' : 'https://sandbox.cashfree.com';
  try {
    const response = await fetch(`${host}/pg/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
    });
    const data = await response.json();
    if (data.order_status === 'PAID') {
      await db.prepare("UPDATE orders SET payment_status='paid', razorpay_id=? WHERE order_number=?").run(data.cf_order_id, orderId);
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/cashfree/webhook', async (req, res) => {
  try {
    const { data } = req.body;
    if (data?.order?.order_status === 'PAID') {
      await db.prepare("UPDATE orders SET payment_status='paid', razorpay_id=? WHERE order_number=?").run(data.payment?.cf_payment_id || '', data.order.order_id);
      console.log('Cashfree webhook: Order paid', data.order.order_id);
    }
    res.json({ received: true });
  } catch (e) {
    console.error('Cashfree webhook error:', e.message);
    res.status(500).json({ error: e.message });
  }
});



// ── PHONEPE ───────────────────────────────────────────────
import { createHash as phonepeHash } from 'crypto';

router.post('/phonepe/initiate', authMiddleware, async (req, res) => {
  const merchantId = await getSetting('phonepe_merchant_id');
  const saltKey = await getSetting('phonepe_salt_key');
  const saltIndex = await getSetting('phonepe_salt_index') || '1';
  const isProduction = (await getSetting('phonepe_production')) === 'true';

  if (!merchantId || !saltKey) {
    return res.status(400).json({ error: 'PhonePe not configured. Add Merchant ID + Salt Key in Admin → Settings → API Keys.' });
  }

  const { amount, orderId, customerPhone } = req.body;
  if (!amount || !orderId) return res.status(400).json({ error: 'amount and orderId required' });

  const host = isProduction
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  const payload = {
    merchantId,
    merchantTransactionId: orderId,
    merchantUserId: 'USR_' + (req.user?.id?.slice(0,10) || Date.now()),
    amount: Math.round(Number(amount) * 100), // paise
    redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/order-success?order=${orderId}&gateway=phonepe`,
    redirectMode: 'REDIRECT',
    callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/phonepe/callback`,
    mobileNumber: customerPhone || '9999999999',
    paymentInstrument: { type: 'PAY_PAGE' },
  };

  // PhonePe X-VERIFY: sha256(base64(payload) + "/pg/v1/pay" + saltKey) + "###" + saltIndex
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const stringToHash = payloadBase64 + '/pg/v1/pay' + saltKey;
  const sha256 = phonepeHash('sha256').update(stringToHash).digest('hex');
  const xVerify = sha256 + '###' + saltIndex;

  try {
    const response = await fetch(`${host}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'accept': 'application/json',
      },
      body: JSON.stringify({ request: payloadBase64 }),
    });
    const data = await response.json();
    if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
      res.json({
        redirect_url: data.data.instrumentResponse.redirectInfo.url,
        transaction_id: data.data.merchantTransactionId,
        environment: isProduction ? 'production' : 'sandbox',
      });
    } else {
      res.status(502).json({ error: data.message || 'PhonePe order failed', detail: data });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/phonepe/callback', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
  try {
    const encoded = req.body.response;
    if (encoded) {
      const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString());
      const orderId = decoded?.data?.merchantTransactionId;
      const status = decoded?.code;
      if (status === 'PAYMENT_SUCCESS' && orderId) {
        await db.prepare("UPDATE orders SET payment_status='paid', razorpay_id=? WHERE order_number=?")
          .run(decoded.data.transactionId || '', orderId);
        return res.redirect(`${frontendUrl}/order-success?order=${orderId}&gateway=phonepe&payment=success`);
      }
    }
    res.redirect(`${frontendUrl}/checkout?payment=failed&gateway=phonepe`);
  } catch (e) {
    console.error('PhonePe callback error:', e.message);
    res.redirect(`${frontendUrl}/checkout?payment=error`);
  }
});

router.post('/phonepe/verify', authMiddleware, async (req, res) => {
  const merchantId = await getSetting('phonepe_merchant_id');
  const saltKey = await getSetting('phonepe_salt_key');
  const saltIndex = await getSetting('phonepe_salt_index') || '1';
  const isProduction = (await getSetting('phonepe_production')) === 'true';
  const { orderId } = req.body;

  if (!merchantId || !saltKey || !orderId) return res.status(400).json({ error: 'Missing config' });

  const host = isProduction
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  const statusPath = `/pg/v1/status/${merchantId}/${orderId}`;
  const sha256 = phonepeHash('sha256').update(statusPath + saltKey).digest('hex');
  const xVerify = sha256 + '###' + saltIndex;

  try {
    const response = await fetch(`${host}${statusPath}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'X-VERIFY': xVerify, 'X-MERCHANT-ID': merchantId },
    });
    const data = await response.json();
    if (data.code === 'PAYMENT_SUCCESS') {
      await db.prepare("UPDATE orders SET payment_status='paid' WHERE order_number=?").run(orderId);
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

import db from '../db/database.js';
import { v4 as uuid } from 'uuid';
import { getClient, getStatus } from '../whatsapp/client.js';

// Queue a WhatsApp notification
export const queueNotification = (phone, message, type = 'general') => {
  try {
    db.prepare('INSERT INTO whatsapp_notifications (id, type, phone, message) VALUES (?,?,?,?)')
      .run(uuid(), type, phone, message);
  } catch (e) {
    console.error('Queue notification error:', e.message);
  }
};

// Send pending notifications
export const sendPendingNotifications = async () => {
  const client = getClient();
  if (!client || getStatus() !== 'ready') return;

  const pending = db.prepare("SELECT * FROM whatsapp_notifications WHERE status='pending' LIMIT 5").all();
  for (const n of pending) {
    try {
      const phone = n.phone.replace(/[^0-9]/g, '') + '@c.us';
      await client.sendMessage(phone, n.message);
      db.prepare("UPDATE whatsapp_notifications SET status='sent', sent_at=datetime('now') WHERE id=?").run(n.id);
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      db.prepare("UPDATE whatsapp_notifications SET status='failed' WHERE id=?").run(n.id);
    }
  }
};

// Order placed notification
export const notifyOrderPlaced = (order, phone, customerName) => {
  const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
  const itemList = items.map(i => `• ${i.name} x${i.quantity} — ₹${i.price * i.quantity}`).join('\n');
  const msg = `🛒 *Order Confirmed!*

Hello ${customerName}! 🙏

Your order has been placed successfully.

*Order ID:* ${order.order_number}
*Items:*
${itemList}

*Total:* ₹${order.total}
*Payment:* ${order.payment_method}

Track your order: ailaptopwala.com/track-order?order=${order.order_number}

Thank you for shopping with *AI Laptop Wala* 💻
📞 +91 98765 43210`;
  queueNotification(phone, msg, 'order_placed');
};

// Payment success notification
export const notifyPaymentSuccess = (order, phone, customerName, paymentId) => {
  const msg = `✅ *Payment Successful!*

Hello ${customerName}!

Your payment has been received.

*Order:* ${order.order_number}
*Amount:* ₹${order.total}
*Payment ID:* ${paymentId}

Your order is being processed. We'll update you soon!

*AI Laptop Wala* 💻`;
  queueNotification(phone, msg, 'payment_success');
};

// Order shipped notification
export const notifyOrderShipped = (order, phone, customerName) => {
  const msg = `🚚 *Order Shipped!*

Hello ${customerName}!

Your order *${order.order_number}* has been shipped.

*Courier:* ${order.courier || 'Speed Post'}
*Tracking ID:* ${order.tracking_id || 'Will be updated soon'}

Expected delivery: 2-5 business days

Track: ailaptopwala.com/track-order?order=${order.order_number}

*AI Laptop Wala* 💻`;
  queueNotification(phone, msg, 'order_shipped');
};

// Order delivered notification
export const notifyOrderDelivered = (order, phone, customerName) => {
  const msg = `🎉 *Order Delivered!*

Hello ${customerName}!

Your order *${order.order_number}* has been delivered successfully!

We hope you love your purchase! 💻

Please share your experience:
⭐ Rate us on Google
💬 Reply to this message with your feedback

*AI Laptop Wala* — Buy, Sell & Repair Laptops
📞 +91 98765 43210`;
  queueNotification(phone, msg, 'order_delivered');
};

// Service booking notification
export const notifyServiceBooked = (booking, phone) => {
  const msg = `🔧 *Service Booking Confirmed!*

Hello ${booking.customer_name}!

Your service has been booked.

*Booking ID:* ${booking.booking_number}
*Service:* ${booking.service_name}
*Device:* ${booking.device_brand} ${booking.device_model || ''}
*Date:* ${booking.preferred_date || 'Will be confirmed'}
*Time:* ${booking.preferred_time || 'Will be confirmed'}
*Price:* ₹${booking.price}

📍 *AI Laptop Wala*
Shop No. 5, IT Park Road, Indore

We'll contact you to confirm the appointment.
📞 +91 98765 43210`;
  queueNotification(phone, msg, 'service_booked');
};

// Invoice link notification
export const notifyInvoiceReady = (order, phone, customerName) => {
  const msg = `🧾 *Invoice Ready!*

Hello ${customerName}!

Your invoice for order *${order.order_number}* is ready.

Download Invoice: ailaptopwala.com/invoice/${order.order_number}

*AI Laptop Wala* 💻`;
  queueNotification(phone, msg, 'invoice');
};

// Start notification processor (every 30 seconds)
export const startNotificationProcessor = () => {
  setInterval(sendPendingNotifications, 30000);
  console.log('📬 WhatsApp notification processor started');
};

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { notifyServiceBooked } from '../whatsapp/notifications.js';

const router = Router();

// GET /api/services — public
router.get('/', (req, res) => {
  const { category } = req.query;
  let q = 'SELECT * FROM services WHERE is_active = 1';
  const params = [];
  if (category) { q += ' AND category = ?'; params.push(category); }
  q += ' ORDER BY price ASC';
  res.json(db.prepare(q).all(...params));
});

// POST /api/services — admin
router.post('/', authMiddleware, adminOnly, (req, res) => {
  const { name, description, price, duration, category } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'name and price required' });
  const id = uuid();
  db.prepare('INSERT INTO services (id,name,description,price,duration,category) VALUES (?,?,?,?,?,?)').run(id, name, description, price, duration || '2-4 hours', category || 'repair');
  res.status(201).json(db.prepare('SELECT * FROM services WHERE id=?').get(id));
});

// PUT /api/services/:id — admin
router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const { name, description, price, duration, category, is_active } = req.body;
  db.prepare('UPDATE services SET name=?,description=?,price=?,duration=?,category=?,is_active=? WHERE id=?').run(name, description, price, duration, category, is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/services/:id — admin
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  db.prepare('DELETE FROM services WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── Bookings ──────────────────────────────────────────────

// POST /api/services/book — public booking
router.post('/book', async (req, res) => {
  const { customer_name, customer_phone, customer_email, service_id, device_brand, device_model, issue_description, preferred_date, preferred_time } = req.body;
  if (!customer_name || !customer_phone || !service_id) return res.status(400).json({ error: 'name, phone, service required' });

  const service = db.prepare('SELECT * FROM services WHERE id=?').get(service_id);
  if (!service) return res.status(404).json({ error: 'Service not found' });

  const id = uuid();
  const booking_number = 'SVC-' + Date.now().toString().slice(-6);
  db.prepare('INSERT INTO service_bookings (id,booking_number,customer_name,customer_phone,customer_email,service_id,service_name,device_brand,device_model,issue_description,preferred_date,preferred_time,price) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, booking_number, customer_name, customer_phone, customer_email, service_id, service.name, device_brand, device_model, issue_description, preferred_date, preferred_time, service.price);

  // WhatsApp notification
  const booking = db.prepare('SELECT * FROM service_bookings WHERE id=?').get(id);
  notifyServiceBooked(booking, customer_phone);

  // Admin notification
  db.prepare('INSERT INTO notifications (id,type,title,message,link) VALUES (?,?,?,?,?)').run(uuid(), 'service', 'New Service Booking', `${customer_name} booked ${service.name}`, '/admin/services');

  res.status(201).json({ booking_number, id, message: 'Booking confirmed! You will receive WhatsApp confirmation.' });
});

// GET /api/services/bookings — admin
router.get('/bookings', authMiddleware, adminOnly, (req, res) => {
  const { status } = req.query;
  let q = 'SELECT * FROM service_bookings WHERE 1=1';
  const params = [];
  if (status) { q += ' AND status=?'; params.push(status); }
  q += ' ORDER BY created_at DESC';
  res.json(db.prepare(q).all(...params));
});

// PUT /api/services/bookings/:id — admin update status
router.put('/bookings/:id', authMiddleware, adminOnly, (req, res) => {
  const { status, notes } = req.body;
  db.prepare('UPDATE service_bookings SET status=?,notes=? WHERE id=?').run(status, notes, req.params.id);

  // Notify customer on status change
  const booking = db.prepare('SELECT * FROM service_bookings WHERE id=?').get(req.params.id);
  if (booking && status === 'completed') {
    const { queueNotification } = require('../whatsapp/notifications.js');
    queueNotification(booking.customer_phone, `✅ Your service *${booking.service_name}* (${booking.booking_number}) is completed! Please collect your device.\n\n*AI Laptop Wala* 💻`, 'service_completed');
  }

  res.json({ message: 'Updated' });
});

export default router;

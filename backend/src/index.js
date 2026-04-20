import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import db from './db/database.js';
import { runSeeder } from './db/seeder.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import couponRoutes from './routes/coupons.js';
import cmsRoutes from './routes/cms.js';
import blogRoutes from './routes/blog.js';
import contactRoutes from './routes/contacts.js';
import whatsappRoutes from './routes/whatsapp.js';
import customerRoutes from './routes/customers.js';
import notificationRoutes from './routes/notifications.js';
import reportRoutes from './routes/reports.js';
import mediaRoutes from './routes/media.js';
import aiRoutes from './routes/ai.js';
import paymentRoutes from './routes/payment.js';
import siteSettingsRoutes from './routes/siteSettings.js';
import appSettingsRoutes from './routes/appSettings.js';
import categoryRoutes from './routes/categories.js';
import socialRoutes from './routes/social.js';
import reelsRoutes from './routes/reels.js';
import servicesRoutes from './routes/services.js';
import invoiceRoutes from './routes/invoice.js';
import reviewsRoutes from './routes/reviews.js';
import { startNotificationProcessor } from './whatsapp/notifications.js';
import { setIO } from './whatsapp/client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);

// Socket.IO for real-time WhatsApp events
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:8080', process.env.FRONTEND_URL].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true,
  }
});
setIO(io);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:8080', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

// Security headers
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many login attempts. Try again in 15 minutes.' } });
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/app-settings', appSettingsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/reels', reelsRoutes);
app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Serve React frontend (only if dist exists)
const frontendDist = path.resolve(__dirname, '../../../dist');
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error on ${req.method} ${req.path}:`, err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack?.split('\n')[0] }),
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, async () => {
  console.log(`✅ AI Laptop Wala Backend running on http://localhost:${PORT}`);
  await runSeeder(db);
  startNotificationProcessor();
});

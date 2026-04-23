import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import db, { initDB } from './db/database.js';
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
import evolutionRoutes from './routes/evolution.js';
import { setIO as setEvolutionIO } from './evolution/webhook.js';
import { startNotificationProcessor } from './whatsapp/notifications.js';
import { setIO } from './whatsapp/client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.set('trust proxy', 1); // Trust nginx reverse proxy
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
app.use('/api/social', socialRoutes);
app.use('/api/evolution', evolutionRoutes);
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

// Dynamic Sitemap
app.get('/sitemap.xml', async (req, res) => {
  const base = 'https://ailaptopwala.com';
  const now = new Date().toISOString().split('T')[0];
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/products', priority: '0.9', changefreq: 'daily' },
    { url: '/services', priority: '0.9', changefreq: 'weekly' },
    { url: '/blog', priority: '0.8', changefreq: 'weekly' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/faq', priority: '0.6', changefreq: 'monthly' },
  ];
  const products = await db.prepare("SELECT slug, id, updated_at, created_at FROM products WHERE status='active'").all();
  const blogs = await db.prepare("SELECT slug, id, published_at, updated_at FROM blog_posts WHERE status='published'").all();
  const toUrl = (loc, lastmod, freq, priority) =>
    `\n  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`;
  const xml = [
    ...staticPages.map(p => toUrl(`${base}${p.url}`, now, p.changefreq, p.priority)),
    ...products.map(p => toUrl(`${base}/products/${p.slug || p.id}`, (p.updated_at || p.created_at || now).split('T')[0], 'weekly', '0.8')),
    ...blogs.map(b => toUrl(`${base}/blog/${b.slug || b.id}`, (b.updated_at || b.published_at || now).split('T')[0], 'monthly', '0.7')),
  ].join('');
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}\n</urlset>`);
});

// Dynamic robots.txt
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /checkout\nDisallow: /account\nDisallow: /cart\n\nSitemap: https://ailaptopwala.com/sitemap.xml');
});

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
  setEvolutionIO(io);
  await initDB();
  await runSeeder(db);
  startNotificationProcessor();

  // Connect to Evolution API WebSocket to process incoming messages with AI
  setTimeout(async () => {
    try {
      const evoSettings = await db.prepare("SELECT api_url, api_key FROM evolution_settings WHERE id='main'").get();
      if (!evoSettings?.api_url || !evoSettings?.api_key) return;

      const { io: socketIO } = await import('socket.io-client');

      const globalSock = socketIO(evoSettings.api_url, {
        transports: ['websocket', 'polling'],
        auth: { apikey: evoSettings.api_key },
        query: { apikey: evoSettings.api_key },
        reconnection: true,
        reconnectionDelay: 5000,
      });
      globalSock.on('connect', () => console.log('✅ Evolution API WebSocket connected (backend)'));
      globalSock.on('connect_error', e => console.warn('Evolution WS error:', e.message));
      globalSock.onAny(async (eventName, payload) => {
        const event = payload?.event || eventName;
        const data = payload?.data;
        const instanceName = payload?.instance;
        if (!data || !instanceName) return;
        const { handleWebhook } = await import('./evolution/webhook.js');
        await handleWebhook(instanceName, event, data).catch(e => console.error('Webhook error:', e.message));
      });

      console.log('✅ Evolution API AI processing started');
    } catch (e) {
      console.warn('Evolution API not configured:', e.message);
    }
  }, 3000);
});

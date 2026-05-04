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

// Prevent unhandled rejections from crashing the process
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason?.message || reason);
});

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
import inventoryRoutes from './routes/inventory.js';
import inventoryRoutes from './routes/inventory.js';
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
app.use('/api/inventory', inventoryRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// OG meta tags for social bots (WhatsApp, Facebook, Twitter)
app.get('/og/products/:slug', async (req, res) => {
  try {
    const p = await db.prepare('SELECT * FROM products WHERE slug=? OR id=?').get(req.params.slug, req.params.slug);
    if (!p) return res.redirect(`https://ailaptopwala.com/products/${req.params.slug}`);
    const image = p.image?.startsWith('http') ? p.image : `https://ailaptopwala.com${p.image}`;
    const title = p.meta_title || `${p.name} | Buy in Indore – AI Laptop Wala`;
    const desc = p.meta_description || `Buy ${p.name} at ₹${p.price} in Indore. AI Laptop Wala.`;
    const url = `https://ailaptopwala.com/products/${p.slug || p.id}`;
    res.send(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="product">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${image}">
<meta http-equiv="refresh" content="0;url=${url}">
</head><body><a href="${url}">${title}</a></body></html>`);
  } catch { res.redirect(`https://ailaptopwala.com/products/${req.params.slug}`); }
});

// Pre-render product pages for Google bot (works regardless of dist)
app.get('/products/:slug', async (req, res, next) => {
  const ua = req.headers['user-agent'] || '';
  const isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|facebookexternalhit|twitterbot|linkedinbot|whatsapp/i.test(ua);
  if (!isBot) return next();
  try {
    const p = await db.prepare('SELECT * FROM products WHERE slug=? OR id=?').get(req.params.slug, req.params.slug);
    if (!p) return next();
    const image = p.image?.startsWith('http') ? p.image : `https://ailaptopwala.com${p.image}`;
    const title = p.meta_title || `${p.name} | Buy in Indore – AI Laptop Wala`;
    const desc = p.meta_description || `Buy ${p.name} at ₹${p.price} in Indore. AI Laptop Wala.`;
    const url = `https://ailaptopwala.com/products/${p.slug || p.id}`;
    const benefits = (() => { try { return JSON.parse(p.benefits || '[]'); } catch { return []; } })();
    res.send(`<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="product">
<link rel="canonical" href="${url}">
<script type="application/ld+json">${JSON.stringify({
  "@context":"https://schema.org","@type":"Product",
  "name":p.name,"image":[image],"description":p.description,"sku":p.sku,
  "brand":{"@type":"Brand","name":p.name.split(' ')[0]},
  "offers":{"@type":"Offer","url":url,"priceCurrency":"INR","price":p.price,
    "availability":p.in_stock?"https://schema.org/InStock":"https://schema.org/OutOfStock",
    "itemCondition":"https://schema.org/RefurbishedCondition",
    "seller":{"@type":"Organization","name":"AI Laptop Wala","url":"https://ailaptopwala.com"}}
})}</script>
</head><body>
<h1>${p.name}</h1><p>Price: ₹${p.price?.toLocaleString('en-IN')}</p>
<p>${p.description || ''}</p>
<ul>${benefits.map((b) => `<li>${b}</li>`).join('')}</ul>
<p>${p.in_stock ? 'In Stock' : 'Out of Stock'}</p>
<a href="${url}">Buy ${p.name} at AI Laptop Wala</a>
</body></html>`);
  } catch { next(); }
});

// Serve React frontend (only if dist exists)
const frontendDist = path.resolve(__dirname, '../../../dist');
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

// llms.txt — AI engine context file
app.get('/llms.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`# AI Laptop Wala — llms.txt

## About
AI Laptop Wala is Indore's most trusted laptop store since 2011, operated by Asati Infotech.
Founder: Bhagwan Das Asati | CEO: Nitin Asati
GST: 23ATNPA4415H1Z2

## Products
- Certified refurbished laptops (Dell, HP, Lenovo, Apple MacBook)
- Gaming laptops (ASUS ROG, Lenovo Legion)
- Business laptops (Dell Latitude, HP EliteBook, ThinkPad)
- Desktop computers
- Laptop accessories

## Services
- Laptop repair and motherboard repair
- Screen replacement, battery replacement
- RAM/SSD upgrade
- Home service available across Indore

## Locations
- Silver Mall: LB-21, Block-B, RNT Marg, Indore MP 452001
- Bangali Chouraha: 21, G3, Sai Residency, Ashish Nagar, Indore

## Contact
Phone/WhatsApp: +91 98934 96163
Email: ailaptopwala@gmail.com
Hours: Daily 11:00 AM - 9:00 PM

## Key URLs
- Products: https://ailaptopwala.com/products
- Services: https://ailaptopwala.com/services
- Blog: https://ailaptopwala.com/blog
- Contact: https://ailaptopwala.com/contact
`);
});

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
  const products = await db.prepare("SELECT slug, id, created_at FROM products WHERE status='active'").all();
  const blogs = await db.prepare("SELECT slug, id, published_at, created_at FROM blog_posts WHERE status='published'").all();
  const toUrl = (loc, lastmod, freq, priority) =>
    `\n  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`;
  const safeDate = (d) => {
    if (!d) return now;
    try { const s = new Date(d).toISOString().split('T')[0]; return s || now; } catch { return now; }
  };
  const xml = [
    ...staticPages.map(p => toUrl(`${base}${p.url}`, now, p.changefreq, p.priority)),
    ...products.map(p => toUrl(`${base}/products/${p.slug || p.id}`, safeDate(p.created_at), 'weekly', '0.8')),
    ...blogs.map(b => toUrl(`${base}/blog/${b.slug || b.id}`, safeDate(b.published_at || b.created_at), 'monthly', '0.7')),
  ].join('');
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}\n</urlset>`);
});

// Dynamic robots.txt
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/*
Disallow: /checkout
Disallow: /account
Disallow: /cart

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://ailaptopwala.com/sitemap.xml
`);
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

  // Register Evolution API webhook for AI processing
  setTimeout(async () => {
    try {
      const evoSettings = await db.prepare("SELECT api_url, api_key, default_instance FROM evolution_settings WHERE id='main'").get();
      if (!evoSettings?.api_url || !evoSettings?.api_key || !evoSettings?.default_instance) return;

      const webhookUrl = `${process.env.BACKEND_URL || 'https://ailaptopwala.com'}/api/evolution/webhook/${evoSettings.default_instance}`;
      const res = await fetch(`${evoSettings.api_url}/webhook/set/${evoSettings.default_instance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': evoSettings.api_key },
        body: JSON.stringify({
          webhook: {
            enabled: true,
            url: webhookUrl,
            webhook_by_events: false,
            webhook_base64: false,
            events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
          }
        }),
      });
      if (res.ok) console.log(`✅ Evolution API webhook registered: ${webhookUrl}`);
      else console.warn('Evolution webhook registration failed:', await res.text());
    } catch (e) {
      console.warn('Evolution API not configured:', e.message);
    }
  }, 3000);
  console.log('✅ Evolution API AI processing started');
});

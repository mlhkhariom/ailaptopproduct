import { Router } from 'express';
import db from '../../db/database.js';
const router = Router();

router.get('/', async (req, res) => {
  const settings = Object.fromEntries((await db.prepare('SELECT key,value FROM app_settings').all()).map(r => [r.key, r.value]));
  const baseUrl = settings.site_url || settings.frontend_url || 'https://ailaptopwala.com';
  const products = await db.prepare('SELECT slug, updated_at FROM products WHERE is_active=1').all();
  const posts = await db.prepare("SELECT slug, updated_at FROM blog_posts WHERE status='published'").all();
  const categories = await db.prepare('SELECT slug FROM categories').all();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  const add = (loc, mod, pri) => { xml += `<url><loc>${baseUrl}${loc}</loc>${mod ? `<lastmod>${mod.split('T')[0]}</lastmod>` : ''}<priority>${pri}</priority></url>\n`; };

  add('/', null, '1.0');
  add('/products', null, '0.9');
  add('/about', null, '0.7');
  add('/deals', null, '0.8');
  add('/help', null, '0.5');
  add('/store-locator', null, '0.5');
  categories.forEach(c => add(`/products?category=${c.slug}`, null, '0.7'));
  products.forEach(p => add(`/product/${p.slug}`, p.updated_at, '0.8'));
  posts.forEach(p => add(`/blog/${p.slug}`, p.updated_at, '0.6'));

  xml += '</urlset>';
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

export default router;

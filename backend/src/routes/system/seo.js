import { Router } from 'express';
import db from '../../db/database.js';
const router = Router();

// Auto meta tags for any page
router.get('/meta/:type/:slug', async (req, res) => {
  const { type, slug } = req.params;
  const settings = Object.fromEntries((await db.prepare('SELECT key,value FROM app_settings').all()).map(r => [r.key, r.value]));
  const suffix = settings.seo_title_suffix || '| AI Laptop Wala';
  let meta = { title: '', description: '', og_image: settings.seo_og_image || '' };

  if (type === 'product') {
    const p = await db.prepare('SELECT name, description, images FROM products WHERE slug=?').get(slug);
    if (p) { meta.title = `${p.name} ${suffix}`; meta.description = (p.description || '').slice(0, 160); try { meta.og_image = JSON.parse(p.images)[0] || meta.og_image; } catch {} }
  } else if (type === 'blog') {
    const p = await db.prepare('SELECT title, excerpt, featured_image FROM blog_posts WHERE slug=?').get(slug);
    if (p) { meta.title = `${p.title} ${suffix}`; meta.description = (p.excerpt || '').slice(0, 160); meta.og_image = p.featured_image || meta.og_image; }
  } else if (type === 'category') {
    const c = await db.prepare('SELECT name, description FROM categories WHERE slug=?').get(slug);
    if (c) { meta.title = `${c.name} Laptops ${suffix}`; meta.description = c.description || `Buy ${c.name} laptops at best price`; }
  }
  res.json(meta);
});

// Schema.org JSON-LD for product
router.get('/schema/product/:slug', async (req, res) => {
  const p = await db.prepare('SELECT * FROM products WHERE slug=?').get(req.params.slug);
  if (!p) return res.json({});
  const settings = Object.fromEntries((await db.prepare('SELECT key,value FROM app_settings').all()).map(r => [r.key, r.value]));
  let images = []; try { images = JSON.parse(p.images); } catch {}
  res.json({
    "@context": "https://schema.org", "@type": "Product",
    name: p.name, description: (p.description || '').slice(0, 500),
    image: images, sku: p.sku || p.id,
    brand: { "@type": "Brand", name: p.brand || 'Generic' },
    offers: { "@type": "Offer", price: p.sale_price || p.price, priceCurrency: "INR", availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: `${settings.site_url || ''}/product/${p.slug}` },
    ...(p.avg_rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.avg_rating, reviewCount: p.review_count || 1 } } : {})
  });
});

// Schema.org for Organization
router.get('/schema/organization', async (req, res) => {
  const s = Object.fromEntries((await db.prepare('SELECT key,value FROM app_settings').all()).map(r => [r.key, r.value]));
  res.json({
    "@context": "https://schema.org", "@type": "LocalBusiness",
    name: s.store_name || 'AI Laptop Wala', description: s.store_tagline || '',
    url: s.site_url || '', telephone: s.store_phone || '',
    email: s.store_email || '', address: { "@type": "PostalAddress", streetAddress: s.store_address || '', addressLocality: "Indore", addressRegion: "MP", postalCode: "452001", addressCountry: "IN" },
    image: s.store_logo || '', foundingDate: s.founded_year || '2011',
    sameAs: [s.social_instagram, s.social_youtube, s.social_facebook, s.social_linkedin].filter(Boolean)
  });
});

export default router;

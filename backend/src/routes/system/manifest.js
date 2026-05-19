import { Router } from 'express';
import db from '../../db/database.js';
const router = Router();

router.get('/', async (req, res) => {
  const s = Object.fromEntries((await db.prepare('SELECT key,value FROM app_settings').all()).map(r => [r.key, r.value]));
  res.json({
    name: s.store_name || 'AI Laptop Wala',
    short_name: s.store_name || 'AI Laptop Wala',
    description: s.store_tagline || s.seo_description || 'Best Laptops in Indore',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: s.color_primary || '#2563eb',
    icons: [
      { src: s.store_logo || '/assets/logo.jpeg', sizes: '192x192', type: 'image/jpeg' },
      { src: s.store_logo || '/assets/logo.jpeg', sizes: '512x512', type: 'image/jpeg' },
    ]
  });
});

export default router;

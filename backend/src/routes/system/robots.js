import { Router } from 'express';
import db from '../../db/database.js';
const router = Router();

router.get('/', async (req, res) => {
  const settings = Object.fromEntries((await db.prepare('SELECT key,value FROM app_settings').all()).map(r => [r.key, r.value]));
  const siteUrl = settings.site_url || settings.frontend_url || 'https://ailaptopwala.com';
  const custom = settings.robots_custom || '';
  
  let txt = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /account/\n`;
  if (custom) txt += `\n${custom}\n`;
  txt += `\nSitemap: ${siteUrl}/sitemap.xml\n`;
  
  res.set('Content-Type', 'text/plain');
  res.send(txt);
});

export default router;

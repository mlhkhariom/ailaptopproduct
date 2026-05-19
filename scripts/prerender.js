import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

const ROUTES = [
  '/', '/products', '/about', '/contact', '/services',
  '/deals', '/blog', '/faq', '/help', '/store-locator',
  '/categories', '/new-arrivals', '/best-sellers',
  '/privacy', '/terms', '/refund', '/shipping',
];

const distDir = path.resolve('dist');
const indexHtml = readFileSync(path.join(distDir, 'index.html'), 'utf-8');

for (const route of ROUTES) {
  if (route === '/') continue;
  const dir = path.join(distDir, route);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const title = route.slice(1).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' | AI Laptop Wala';
  const html = indexHtml.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  writeFileSync(path.join(dir, 'index.html'), html);
}

console.log(`✅ Prerendered ${ROUTES.length} routes`);

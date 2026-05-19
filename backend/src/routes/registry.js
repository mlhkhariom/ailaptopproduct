// Route registry — maps URL prefixes to route files
// Keeps index.js clean by centralizing all route registrations

export const routeMap = [
  // Ecommerce
  { path: '/api/products', file: './ecommerce/products.js' },
  { path: '/api/products', file: './ecommerce/productVariants.js' },
  { path: '/api/orders', file: './ecommerce/orders.js' },
  { path: '/api/payment', file: './ecommerce/payment.js' },
  { path: '/api/coupons', file: './ecommerce/coupons.js' },
  { path: '/api/returns', file: './ecommerce/returns.js' },
  { path: '/api/wallet', file: './ecommerce/wallet.js' },
  { path: '/api/wishlist', file: './ecommerce/wishlist.js' },
  { path: '/api/addresses', file: './ecommerce/addresses.js' },
  { path: '/api/contacts', file: './ecommerce/contacts.js' },
  { path: '/api/customers', file: './ecommerce/customers.js' },
  { path: '/api/crm-tools', file: './ecommerce/crmTools.js' },

  // CMS
  { path: '/api/cms', file: './cms/cms.js' },
  { path: '/api/blog', file: './cms/blog.js' },
  { path: '/api/reels', file: './cms/reels.js' },
  { path: '/api/media', file: './cms/media.js' },
  { path: '/api/social', file: './cms/social.js' },

  // ERP
  { path: '/api/erp', file: './erp/index.js' },
  { path: '/api/inventory', file: './inventory.js' },
  { path: '/api/invoice', file: './invoice.js' },
  { path: '/api/services', file: './services.js' },

  // System
  { path: '/api/auth', file: './auth.js' },
  { path: '/api/push', file: './system/push.js' },
  { path: '/api/notifications', file: './system/notifications.js' },
  { path: '/api/app-settings', file: './system/appSettings.js' },
  { path: '/api/sitemap.xml', file: './system/sitemap.js' },
  { path: '/api/seo', file: './system/seo.js' },
  { path: '/api/menus', file: './system/menus.js' },
  { path: '/api/site-settings', file: './system/siteSettings.js' },

  // Tools
  { path: '/api/whatsapp', file: './whatsapp.js' },
  { path: '/api/ai', file: './ai.js' },
  { path: '/api/evolution', file: './evolution.js' },
  { path: '/api/categories', file: './categories.js' },
  { path: '/api/reviews', file: './reviews.js' },
  { path: '/api/reports', file: './reports.js' },
];

export async function registerRoutes(app) {
  for (const route of routeMap) {
    try {
      const mod = await import(route.file);
      app.use(route.path, mod.default);
    } catch (e) {
      console.error(`⚠️ Failed to load route ${route.path} (${route.file}):`, e.message);
    }
  }
  console.log(`✅ ${routeMap.length} routes registered`);
}

// Route registry — maps URL prefixes to route files
// Keeps index.js clean by centralizing all route registrations

export const routeMap = [
  // Ecommerce
  { path: '/api/products', file: './routes/ecommerce/products.js' },
  { path: '/api/products', file: './routes/ecommerce/productVariants.js' },
  { path: '/api/orders', file: './routes/ecommerce/orders.js' },
  { path: '/api/payment', file: './routes/ecommerce/payment.js' },
  { path: '/api/coupons', file: './routes/ecommerce/coupons.js' },
  { path: '/api/returns', file: './routes/ecommerce/returns.js' },
  { path: '/api/wallet', file: './routes/ecommerce/wallet.js' },
  { path: '/api/wishlist', file: './routes/ecommerce/wishlist.js' },
  { path: '/api/addresses', file: './routes/ecommerce/addresses.js' },
  { path: '/api/contacts', file: './routes/ecommerce/contacts.js' },
  { path: '/api/customers', file: './routes/ecommerce/customers.js' },
  { path: '/api/crm-tools', file: './routes/ecommerce/crmTools.js' },

  // CMS
  { path: '/api/cms', file: './routes/cms/cms.js' },
  { path: '/api/blog', file: './routes/cms/blog.js' },
  { path: '/api/reels', file: './routes/cms/reels.js' },
  { path: '/api/media', file: './routes/cms/media.js' },
  { path: '/api/social', file: './routes/cms/social.js' },

  // ERP
  { path: '/api/erp', file: './routes/erp/index.js' },
  { path: '/api/inventory', file: './routes/inventory.js' },
  { path: '/api/invoice', file: './routes/invoice.js' },
  { path: '/api/services', file: './routes/services.js' },

  // System
  { path: '/api/auth', file: './routes/auth.js' },
  { path: '/api/push', file: './routes/system/push.js' },
  { path: '/api/notifications', file: './routes/system/notifications.js' },
  { path: '/api/app-settings', file: './routes/system/appSettings.js' },
  { path: '/api/site-settings', file: './routes/system/siteSettings.js' },

  // Tools
  { path: '/api/whatsapp', file: './routes/whatsapp.js' },
  { path: '/api/ai', file: './routes/ai.js' },
  { path: '/api/evolution', file: './routes/evolution.js' },
  { path: '/api/categories', file: './routes/categories.js' },
  { path: '/api/reviews', file: './routes/reviews.js' },
  { path: '/api/reports', file: './routes/reports.js' },
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

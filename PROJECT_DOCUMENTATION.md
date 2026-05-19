# MLHK ERP Platform v2.1.0 — Complete Documentation

> **Developer:** MLHK Infotech  
> **Product:** Enterprise ERP/CRM/Ecommerce Platform  
> **Client:** AI Laptop Wala (Indore, MP)  
> **Domain:** ailaptopwala.com  
> **Last Updated:** 19 May 2026  
> **Total Commits:** 79 (this session)

---

## Platform Stats

| Metric | Count |
|--------|:-----:|
| Frontend Routes | 101 |
| Backend API Endpoints | 482 |
| Database Tables | 89 |
| Admin Pages | 50 |
| Public Pages | 40 |
| Settings Pages | 12 |
| Reusable Components | 100 |
| Backend Route Files | 45 |
| Modules (Super Admin) | 16 |
| JS Chunks (code split) | 94 |
| Prerendered SEO Pages | 17 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| State Management | Zustand (cart, wishlist, products, notifications) |
| Backend | Node.js + Express.js (ES Modules) |
| Database | PostgreSQL (89 tables) |
| Auth | JWT + RBAC (superadmin → admin → manager → staff → customer) |
| Payments | Razorpay, PhonePe, Paytm, Cashfree, COD, UPI |
| WhatsApp | Evolution API (auto-reply, broadcast, templates, notifications) |
| AI | OpenRouter (chatbot, product descriptions, auto-replies) |
| SEO | Prerender (17 pages) + Sitemap + Schema.org + robots.txt |
| PWA | Dynamic manifest.json + service worker ready |
| Performance | Code splitting (94 chunks) + Suspense + gzip compression |
| Security | Helmet + CORS (dynamic) + Rate limiting (dynamic) + 2FA ready |
| Hosting | VPS + Nginx + PM2 + Let's Encrypt SSL |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vite + React)                │
│  101 routes | 94 lazy chunks | Prerender 17 pages        │
│  Zustand stores | SiteSettingsContext | AuthContext       │
├─────────────────────────────────────────────────────────┤
│                    NGINX (Reverse Proxy + SSL)            │
├─────────────────────────────────────────────────────────┤
│                    BACKEND (Express.js)                   │
│  482 endpoints | 45 route files | 38 registered modules  │
│  Helmet | Compression | Rate Limit | CORS | Maintenance  │
├─────────────────────────────────────────────────────────┤
│                    DATABASE (PostgreSQL)                  │
│  89 tables | Settings cache (30s TTL) | Migrations       │
├─────────────────────────────────────────────────────────┤
│                    INTEGRATIONS                           │
│  Evolution API | OpenRouter AI | Razorpay | PhonePe      │
│  Paytm | Cashfree | SMTP | SMS | Push Notifications     │
└─────────────────────────────────────────────────────────┘
```

---

## File Structure

### Frontend (`src/`)

```
src/
├── App.tsx                     — Router (101 routes, 62 lazy-loaded)
├── main.tsx                    — Entry point
├── config/
│   └── index.ts               — APP_CONFIG, ROLES, MODULES constants
├── contexts/
│   ├── AuthContext.tsx         — JWT auth, login/logout, user state
│   └── SiteSettingsContext.tsx — Global settings + theme injection + custom CSS/JS
├── hooks/
│   └── usePermissions.ts      — RBAC permission checker
├── lib/
│   ├── api.ts                 — API client helpers
│   └── themes.ts              — 4 theme presets (default/ocean/forest/royal)
├── locale/
│   └── index.ts               — formatCurrency, formatDate, formatDateTime
├── store/
│   ├── cartStore.ts           — Shopping cart (add/remove/clear/quantity)
│   ├── wishlistStore.ts       — Wishlist (add/remove/toggle)
│   ├── productStore.ts        — Products, filters, pagination, brands
│   └── notificationStore.ts   — Admin notifications (unread count)
├── utils/
│   └── index.ts               — slugify, debounce, validators, timeAgo, getInitials
├── components/
│   ├── ui/                    — 50+ shadcn/ui primitives
│   ├── layout/
│   │   ├── AdminLayout.tsx    — Admin wrapper
│   │   ├── AdminSidebar.tsx   — Module-filtered sidebar (reads settings)
│   │   ├── CustomerLayout.tsx — Public wrapper
│   │   ├── Header.tsx         — Dynamic nav (from DB) + dark mode + announcement
│   │   ├── Footer.tsx         — Dynamic branches + social (from DB)
│   │   └── CustomerBottomNav.tsx — Mobile bottom nav
│   ├── common/
│   │   ├── SEOHead.tsx        — Meta tags + JSON-LD schema
│   │   ├── Breadcrumbs.tsx    — Breadcrumb navigation
│   │   ├── ModuleGuard.tsx    — Block disabled modules
│   │   ├── PageSkeleton.tsx   — Loading skeletons (3 variants)
│   │   └── SiteFeatures.tsx   — WhatsApp widget, free shipping banner
│   ├── ecommerce/
│   │   ├── ProductCard.tsx    — Product grid card
│   │   └── GlobalSearch.tsx   — Autocomplete search
│   ├── products/
│   │   └── ProductFormDialog.tsx — Add/edit product form
│   ├── settings/              — Settings tab components
│   └── ProtectedRoute.tsx     — Auth guard + module access check
├── pages/
│   ├── *.tsx (40 public pages)
│   ├── admin/*.tsx (50 admin pages)
│   └── admin/settings/*.tsx (12 settings pages)
├── modules/
│   ├── erp/ crm/ ecommerce/ cms/ hr/
│   └── README.md
└── types/                     — TypeScript interfaces
```

### Backend (`backend/src/`)

```
backend/src/
├── index.js                    — Express app entry (helmet, cors, compression, rate limit, maintenance)
├── db/
│   └── database.js            — PostgreSQL + 89 tables + migrations
├── middleware/
│   ├── auth.js                — JWT verification
│   └── adminOnly.js           — RBAC: adminOnly, superAdminOnly, requireRole, canAccess, ERP_PERMS
├── routes/
│   ├── registry.js            — Auto-loader (38 modules)
│   ├── auth.js                — Login, register, forgot/reset password
│   ├── categories.js          — 12 endpoints
│   ├── reviews.js             — 9 endpoints (approve/reply/delete)
│   ├── services.js            — 7 endpoints
│   ├── inventory.js           — 18 endpoints (stock, PO, suppliers, audit)
│   ├── invoice.js             — PDF generation
│   ├── reports.js             — Sales/revenue reports
│   ├── ai.js                  — 8 endpoints (chatbot, descriptions)
│   ├── evolution.js           — 20 endpoints (WhatsApp Evolution API)
│   ├── whatsapp.js            — 26 endpoints (chat, messages)
│   ├── ecommerce/
│   │   ├── products.js        — 11 endpoints
│   │   ├── orders.js          — 9 endpoints + abandoned cart recovery
│   │   ├── payment.js         — 15 endpoints (all gateways)
│   │   ├── returns.js         — 4 endpoints
│   │   ├── coupons.js         — 6 endpoints
│   │   ├── wallet.js          — 6 endpoints (+ admin adjust)
│   │   ├── wishlist.js        — 5 endpoints
│   │   ├── customers.js       — 3 endpoints
│   │   ├── addresses.js       — CRUD
│   │   ├── contacts.js        — Contact form
│   │   ├── crmTools.js        — 34 endpoints (automations)
│   │   └── productVariants.js — SKU variants
│   ├── erp/
│   │   ├── index.js           — ERP dashboard stats
│   │   ├── jobcards.js        — 17 endpoints (SLA, timer, photos, parts)
│   │   ├── crm.js             — 34 endpoints (leads, pipeline, scoring)
│   │   ├── billing.js         — 21 endpoints (GST invoices, credit notes)
│   │   ├── staff.js           — 18 endpoints (attendance, payroll, leaves, bank details)
│   │   ├── finance.js         — 24 endpoints (P&L, cash flow, reconciliation)
│   │   ├── reports.js         — Dashboard + GSTR-1 + forecasting
│   │   └── misc.js            — Branches CRUD, WA templates, loyalty, stock
│   ├── cms/
│   │   ├── blog.js            — Blog CRUD + markdown + views
│   │   ├── cms.js             — Pages, banners, FAQs, popups, menus, redirects
│   │   ├── media.js           — Upload + library
│   │   ├── social.js          — Social posts
│   │   └── reels.js           — Video reels
│   └── system/
│       ├── appSettings.js     — GET/PUT settings + test email/WA
│       ├── siteSettings.js    — Public feature flags
│       ├── notifications.js   — Notification list + test endpoints
│       ├── sitemap.js         — Auto XML sitemap (products + blogs + categories)
│       ├── robots.js          — Dynamic robots.txt (from settings)
│       ├── manifest.js        — PWA manifest (from settings)
│       ├── seo.js             — Meta tags + Schema.org JSON-LD
│       ├── menus.js           — Navigation CRUD + reorder
│       └── push.js            — Push notifications
├── settings/
│   └── index.js               — getSetting, setSetting, cache (30s TTL), isModuleEnabled
├── setup/
│   └── index.js               — seedDefaultSettings, createSuperAdmin
├── utils/
│   └── index.js               — uuid, slugify, formatINR, validators, paginate, hash
├── locale/
│   └── index.js               — Currency/date formatting (INR)
├── handlers/                   — Business logic (separated from routes)
├── models/                     — DB model documentation
├── pdf/                        — Invoice PDF generation
├── ai/
│   └── agent.js               — OpenRouter AI agent
├── evolution/                  — Evolution WhatsApp API client
├── whatsapp/
│   └── notifications.js       — Auto WA on order/ship/deliver/lead
└── public/uploads/             — File storage
```

---

## All Pages

### Public Pages (40)

| # | Page | Route | Dynamic From |
|---|------|-------|-------------|
| 1 | Home | `/` | Settings (hero, stats) + DB (products, banners) |
| 2 | Products | `/products` | DB (filters, search, pagination) |
| 3 | Product Detail | `/product/:slug` | DB + Schema.org JSON-LD |
| 4 | Cart | `/cart` | Zustand store |
| 5 | Checkout | `/checkout` | Settings (gateways) + DB (addresses, coupons) |
| 6 | Order Success | `/order-success` | DB |
| 7 | Account | `/account` | DB (orders, addresses, wishlist) |
| 8 | Login | `/login` | — |
| 9 | Register | `/register` | — |
| 10 | About | `/about` | Settings + DB branches |
| 11 | Contact | `/contact` | Settings (phone, email, WA) |
| 12 | Blog | `/blog` | DB |
| 13 | Blog Post | `/blog/:slug` | DB |
| 14 | Services | `/services` | DB + Settings (phone, WA) |
| 15 | Store Locator | `/store-locator` | DB branches (map_url) |
| 16 | Help Center | `/help` | DB FAQs + Settings |
| 17 | Deals | `/deals` | DB (discounted products) |
| 18 | New Arrivals | `/new-arrivals` | DB |
| 19 | Best Sellers | `/best-sellers` | DB |
| 20 | Categories | `/categories` | DB |
| 21 | Compare | `/compare` | Zustand store |
| 22 | Wishlist | `/wishlist` | Zustand store |
| 23 | EMI Calculator | `/emi-calculator` | — |
| 24 | Track Order | `/track-order` | DB |
| 25 | Repair Track | `/repair-track` | DB (job card status) |
| 26 | FAQ | `/faq` | DB |
| 27 | Privacy | `/privacy` | Static |
| 28 | Terms | `/terms` | Static |
| 29 | Refund | `/refund` | Static |
| 30 | Shipping | `/shipping` | Static |
| 31 | Sitemap | `/sitemap` | Auto-generated |
| 32 | Offers | `/offers` | DB |
| 33 | Bulk Order | `/bulk-order` | Settings (phone) |
| 34 | Brand Store | `/brand/:slug` | DB |
| 35 | CMS Page | `/page/:slug` | DB |
| 36 | Customer Portal | `/portal` | DB |
| 37 | Notifications | `/notifications` | DB |
| 38 | Links | `/links` | Settings (social) |
| 39 | 404 | `*` | — |
| 40 | Order Success | `/order-success` | DB |

### Admin Pages (50)

| # | Page | Route | Module Key |
|---|------|-------|-----------|
| 1 | Dashboard | `/admin` | — |
| 2 | Analytics | `/admin/analytics` | mod_analytics |
| 3 | Products | `/admin/products` | mod_ecommerce |
| 4 | Orders | `/admin/orders` | mod_ecommerce |
| 5 | Payments | `/admin/payments` | mod_ecommerce |
| 6 | Returns | `/admin/returns` | mod_ecommerce |
| 7 | Customers | `/admin/customers` | mod_ecommerce |
| 8 | Categories | `/admin/categories` | mod_ecommerce |
| 9 | Coupons | `/admin/coupons` | mod_loyalty |
| 10 | Abandoned Carts | `/admin/abandoned-carts` | mod_ecommerce |
| 11 | CRM / Leads | `/admin/erp/crm` | mod_crm |
| 12 | Customer 360 | `/admin/erp/customer360` | mod_crm |
| 13 | Automations | `/admin/automations` | mod_crm |
| 14 | Email Campaigns | `/admin/email-campaigns` | mod_crm |
| 15 | Job Cards | `/admin/erp/job-cards` | mod_erp |
| 16 | Services | `/admin/services` | mod_erp |
| 17 | Live Dashboard | `/admin/erp/live` | mod_erp |
| 18 | Billing | `/admin/erp/billing` | mod_billing |
| 19 | Recurring | `/admin/erp/recurring` | mod_billing |
| 20 | Expenses | `/admin/erp/expenses` | mod_billing |
| 21 | Inventory | `/admin/inventory` | mod_inventory |
| 22 | Branches | `/admin/erp/branches` | mod_inventory |
| 23 | Staff | `/admin/erp/staff` | mod_hr |
| 24 | Attendance | `/admin/erp/attendance` | mod_hr |
| 25 | Payroll | `/admin/erp/payroll` | mod_hr |
| 26 | Shifts | `/admin/erp/shifts` | mod_hr |
| 27 | Leaves | `/admin/erp/leaves` | mod_hr |
| 28 | WhatsApp | `/admin/whatsapp` | mod_whatsapp |
| 29 | Broadcast | `/admin/broadcast` | mod_whatsapp |
| 30 | Evolution API | `/admin/evolution` | mod_whatsapp |
| 31 | WA Templates | `/admin/erp/wa-templates` | mod_whatsapp |
| 32 | Blog | `/admin/blog` | mod_blog |
| 33 | CMS Pages | `/admin/cms` | mod_blog |
| 34 | Media Library | `/admin/media` | mod_blog |
| 35 | Social Media | `/admin/social` | mod_social |
| 36 | Reels | `/admin/reels` | mod_social |
| 37 | Reviews | `/admin/reviews` | mod_reviews |
| 38 | Reports | `/admin/reports` | mod_analytics |
| 39 | ERP Reports | `/admin/erp/reports` | mod_analytics |
| 40 | Report Builder | `/admin/erp/report-builder` | mod_analytics |
| 41 | KPI Alerts | `/admin/erp/kpi-alerts` | mod_analytics |
| 42 | Audit Log | `/admin/erp/audit-log` | mod_analytics |
| 43 | Loyalty | `/admin/erp/loyalty` | mod_loyalty |
| 44 | Users & Roles | `/admin/users` | — |
| 45 | Shipping Rules | `/admin/shipping-rules` | — |
| 46 | Contacts | `/admin/contacts` | — |
| 47 | Homepage Sections | `/admin/homepage-sections` | — |
| 48 | ERP Overview | `/admin/erp` | — |
| 49 | Super Admin | `/admin/super-admin` | superadmin only |
| 50 | All Settings | `/admin/settings` | — |

### Settings Pages (12)

| # | Page | Route | Sections |
|---|------|-------|----------|
| 1 | Site & General | `/admin/settings/site` | Store info, contact, hours, branding/SEO, URLs, social (8), E-Invoice, footer, feature toggles (8) |
| 2 | Appearance | `/admin/settings/appearance` | 4 theme presets, color pickers, fonts, border radius, dark mode, header/announcement, custom CSS/JS/head |
| 3 | Homepage | `/admin/settings/homepage` | Hero (title, subtitle, CTA, image), 10 section toggles, section counts |
| 4 | Menus | `/admin/settings/menus` | Header/footer/mobile nav CRUD + reorder + visibility |
| 5 | Ecommerce | `/admin/settings/ecommerce` | 6 payment gateways (toggle cards), shipping zones CRUD, order statuses, tax/GST, returns, cart |
| 6 | ERP & Branches | `/admin/settings/erp` | Job card SLA, billing/GST, inventory, branch CRUD (edit/delete/map), staff/HR, finance/bank |
| 7 | CRM | `/admin/settings/crm` | Pipeline stages (chips), sources (grid+presets), scoring (sliders), assignment, hours, duplicates, notifications, automations, WA templates (bubble preview) |
| 8 | CMS | `/admin/settings/cms` | Blog (sliders), banners, popups, homepage sections (8 toggles), testimonials, SEO/sitemap, redirects, media/uploads |
| 9 | Notifications | `/admin/settings/notifications` | Status overview (4 cards), SMTP (+ test), WhatsApp API (+ test), SMS, 8 email event toggles, push/VAPID |
| 10 | API Keys | `/admin/settings/api-keys` | 7 services: AI/OpenRouter, Razorpay, PhonePe, Paytm, Cashfree, Evolution, SMTP — eye/copy/test buttons |
| 11 | Security | `/admin/settings/security` | Security score bar, JWT (generate/copy), 2FA, rate limits, CORS, IP whitelist, sessions, maintenance, system |
| 12 | About Page | `/admin/settings/about-page` | Hero, stats (editable counters), 4 value propositions, founder/team, branches (from DB), SEO |

---

## Role-Based Access Control

```
superadmin (MLHK Infotech) — Level 100
  └── Full access + Super Admin panel + module on/off
admin (Shop Owner) — Level 90
  └── Full admin (enabled modules only)
owner — Level 90
  └── Same as admin
manager — Level 70
  └── Most features except settings/users
accountant — Level 60
  └── Billing, expenses, reports
sales — Level 50
  └── CRM, orders, customers
technician — Level 40
  └── Job cards, inventory
staff — Level 30
  └── Basic access (assigned tasks only)
customer — Public
  └── Shop, cart, account, orders
```

---

## Module System

16 modules controlled from Super Admin (`/admin/super-admin`):

| Module | Key | Controls | Disable Effect |
|--------|-----|----------|---------------|
| Ecommerce | mod_ecommerce | Products, Orders, Payments, Cart | Sidebar hidden + route blocked |
| CRM | mod_crm | Leads, Pipeline, Automations | Hidden + blocked |
| ERP | mod_erp | Job Cards, Services, Live | Hidden + blocked |
| Billing | mod_billing | Invoices, Expenses, Recurring | Hidden + blocked |
| Inventory | mod_inventory | Stock, Suppliers, POs, Branches | Hidden + blocked |
| HR | mod_hr | Staff, Attendance, Payroll, Leaves | Hidden + blocked |
| Blog/CMS | mod_blog | Blog, Pages, Media | Hidden + blocked |
| WhatsApp | mod_whatsapp | Chat, Broadcast, Templates | Hidden + blocked |
| Email | mod_email | Email Campaigns | Hidden + blocked |
| Social | mod_social | Social Media, Reels | Hidden + blocked |
| Analytics | mod_analytics | Reports, KPI, Audit Log | Hidden + blocked |
| Loyalty | mod_loyalty | Coupons, Wallet, Referral | Hidden + blocked |
| Reviews | mod_reviews | Product Reviews | Hidden + blocked |
| Multi-Branch | mod_multi_branch | Branch features | Hidden + blocked |
| AI Agent | mod_ai_agent | AI Chatbot | Hidden + blocked |
| Custom Code | mod_custom_code | CSS/JS injection | Hidden + blocked |

**Superadmin always bypasses module restrictions.**

---

## Dynamic System (Zero Hardcoded Data)

Everything reads from database. Admin changes → site updates instantly:

| Setting | Affects |
|---------|---------|
| store_name | Header, Footer, SEO, Schema, Manifest, About |
| store_phone / whatsapp_number | All pages (Services, Help, Contact, Widget) |
| color_primary | CSS variables on :root (live) |
| custom_css / custom_js | Injected in head/body |
| announcement_text | Header announcement bar |
| hero_title / hero_subtitle | Homepage hero section |
| show_announcement | Header bar visibility |
| dark_mode_toggle | Sun/Moon button in header |
| payment_razorpay | Checkout gateway visibility |
| rate_limit_per_min | API rate limiter |
| cors_origins | CORS whitelist |
| maintenance_mode | 503 for all public (admin still works) |
| robots_custom | robots.txt rules |
| active_theme | CSS variables (colors, fonts, radius) |

---

## SEO & Performance

| Feature | Implementation |
|---------|---------------|
| Prerender | 17 static HTML pages at build time |
| Code Splitting | 94 JS chunks (React.lazy + Suspense) |
| Sitemap | Auto-generated `/sitemap.xml` (products + blogs + categories) |
| Robots.txt | Dynamic `/robots.txt` (from settings) |
| Schema.org | Product JSON-LD + Organization LocalBusiness |
| Meta Tags | Dynamic per page (title, description, OG) |
| PWA | `/manifest.json` (dynamic from settings) |
| Compression | gzip on all responses |
| Lazy Loading | Images + admin pages |
| Settings Cache | 30s TTL (no DB hit per request) |
| Initial Bundle | 737KB (was 2MB+) |

---

## Security

| Feature | Status |
|---------|:------:|
| Helmet (security headers) | ✅ |
| CORS (dynamic from settings) | ✅ |
| Rate limiting (dynamic) | ✅ |
| JWT auth | ✅ |
| RBAC (8 levels) | ✅ |
| Module access control | ✅ |
| Parameterized SQL queries | ✅ |
| Password hashing (bcrypt) | ✅ |
| Graceful shutdown | ✅ |
| Maintenance mode | ✅ |
| 2FA ready (OTP) | ✅ |
| Error handling (global) | ✅ |
| Input validation (per-route) | ✅ |

---

## Deployment

```bash
# Production
cd /var/www/ailaptopwala
git pull origin main
npm run build              # Vite build + prerender 17 pages
cd backend && npm install
pm2 restart ailaptopwala-backend --update-env

# Environment
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=...
FRONTEND_URL=https://ailaptopwala.com
```

**Server:** Nginx → Express:5000  
**SSL:** Let's Encrypt (certbot auto-renew)  
**Process:** PM2 (cluster mode, auto-restart)  
**Domain:** ailaptopwala.com  

---

## Notifications (Auto-triggered)

| Event | Channel | Trigger |
|-------|---------|---------|
| Order placed | WhatsApp | Customer places order |
| Order shipped | WhatsApp | Admin updates status to 'shipped' |
| Order delivered | WhatsApp | Admin updates status to 'delivered' |
| New lead | WhatsApp | Lead created (to assigned staff) |
| SLA breach | System | Job card exceeds SLA hours |
| Low stock | System | Product stock below threshold |
| Abandoned cart | Email/WA | Cart inactive for X hours |

---

*Documentation auto-generated | MLHK Infotech | v2.1.0 | May 2026*

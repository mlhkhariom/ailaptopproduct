# MLHK ERP Platform — Complete Documentation

> **Developer:** MLHK Infotech
> **Product:** ERP/CRM/Ecommerce Platform
> **Client:** AI Laptop Wala (Indore)
> **Stack:** React + TypeScript + Vite | Node.js + Express + PostgreSQL
> **Version:** 2.0.0

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| State | Zustand (cart, wishlist, products, notifications) |
| Backend | Node.js, Express.js, ES Modules |
| Database | PostgreSQL (89 tables) |
| Auth | JWT + RBAC (superadmin/admin/manager/staff/customer) |
| Payments | Razorpay, PhonePe, Paytm, Cashfree, COD, UPI |
| WhatsApp | Evolution API (auto-reply, broadcast, templates) |
| AI | OpenRouter (chatbot, product descriptions) |
| SEO | Prerender, Sitemap, Schema.org, robots.txt |
| PWA | manifest.json, service worker ready |
| Hosting | VPS + Nginx + PM2 + Let's Encrypt SSL |

---

## File Structure

### Frontend (`src/`)

```
src/
├── App.tsx                    — Main router (101 routes, lazy loaded)
├── main.tsx                   — Entry point
├── index.css                  — Global styles
├── assets/                    — Images, logos
├── config/
│   └── index.ts              — APP_CONFIG, ROLES, MODULES constants
├── contexts/
│   ├── AuthContext.tsx        — Login/logout, user state, JWT
│   └── SiteSettingsContext.tsx — Global settings provider (fetches /api/app-settings)
├── hooks/
│   └── usePermissions.ts     — RBAC permission checker
├── lib/
│   ├── api.ts                — API client (getProducts, getOrders, etc.)
│   └── themes.ts             — Theme presets (default/ocean/forest/royal)
├── locale/
│   └── index.ts              — formatCurrency, formatDate, formatDateTime
├── store/
│   ├── cartStore.ts          — Shopping cart (add/remove/clear)
│   ├── wishlistStore.ts      — Wishlist (add/remove)
│   ├── productStore.ts       — Products list, filters, pagination
│   └── notificationStore.ts  — Admin notifications
├── types/                     — TypeScript interfaces
├── utils/
│   └── index.ts              — slugify, debounce, validators, timeAgo
├── components/
│   ├── ui/                   — shadcn/ui primitives (50+ components)
│   ├── layout/
│   │   ├── AdminLayout.tsx   — Admin page wrapper
│   │   ├── AdminSidebar.tsx  — Admin sidebar (module-filtered)
│   │   ├── CustomerLayout.tsx — Public page wrapper
│   │   ├── Header.tsx        — Public header (dynamic nav from DB)
│   │   ├── Footer.tsx        — Public footer (dynamic branches from DB)
│   │   └── CustomerBottomNav.tsx — Mobile bottom nav
│   ├── common/
│   │   ├── SEOHead.tsx       — Meta tags, JSON-LD schema
│   │   ├── Breadcrumbs.tsx   — Breadcrumb navigation
│   │   ├── ModuleGuard.tsx   — Block disabled modules
│   │   ├── PageSkeleton.tsx  — Loading skeletons
│   │   └── SiteFeatures.tsx  — WhatsApp widget, banners
│   ├── ecommerce/
│   │   ├── ProductCard.tsx   — Product grid card
│   │   └── GlobalSearch.tsx  — Search with autocomplete
│   ├── products/
│   │   └── ProductFormDialog.tsx — Add/edit product form
│   ├── settings/
│   │   ├── InvoiceSettingsTab.tsx
│   │   ├── FeaturesSettingsTab.tsx
│   │   └── FooterSettingsTab.tsx
│   └── ProtectedRoute.tsx    — Auth + module access guard
├── pages/
│   ├── (40 public pages)
│   ├── admin/ (50 admin pages)
│   └── admin/settings/ (12 settings pages)
└── modules/
    ├── erp/
    ├── crm/
    ├── ecommerce/
    ├── cms/
    └── hr/
```

### Backend (`backend/src/`)

```
backend/src/
├── index.js                   — Express app (helmet, cors, compression, rate limit)
├── db/
│   └── database.js           — PostgreSQL connection + 89 table schemas + migrations
├── middleware/
│   ├── auth.js               — JWT verification middleware
│   └── adminOnly.js          — RBAC: adminOnly, superAdminOnly, requireRole, canAccess
├── routes/
│   ├── registry.js           — Route auto-loader (38 modules)
│   ├── auth.js               — Login, register, forgot password, OTP
│   ├── categories.js         — Category CRUD (12 endpoints)
│   ├── reviews.js            — Review CRUD + approve/reply (9 endpoints)
│   ├── services.js           — Repair services (7 endpoints)
│   ├── inventory.js          — Stock, PO, suppliers, movements (18 endpoints)
│   ├── invoice.js            — PDF invoice generation
│   ├── reports.js            — Sales/revenue reports
│   ├── ai.js                 — AI chatbot, product descriptions (8 endpoints)
│   ├── evolution.js          — Evolution WhatsApp API (20 endpoints)
│   ├── whatsapp.js           — WhatsApp chat/messages (26 endpoints)
│   ├── ecommerce/
│   │   ├── products.js       — Product CRUD + variants (11 endpoints)
│   │   ├── orders.js         — Orders + abandoned carts (9 endpoints)
│   │   ├── payment.js        — All payment gateways (15 endpoints)
│   │   ├── returns.js        — Return/refund processing (4 endpoints)
│   │   ├── coupons.js        — Discount codes CRUD (6 endpoints)
│   │   ├── wallet.js         — Wallet + referral + admin adjust (6 endpoints)
│   │   ├── wishlist.js       — Wishlist CRUD (5 endpoints)
│   │   ├── customers.js      — Customer management (3 endpoints)
│   │   ├── addresses.js      — Saved addresses
│   │   ├── contacts.js       — Contact form queries
│   │   ├── crmTools.js       — CRM automations (34 endpoints)
│   │   └── productVariants.js — SKU variants
│   ├── erp/
│   │   ├── index.js          — ERP dashboard stats
│   │   ├── jobcards.js       — Job cards + SLA + timer (17 endpoints)
│   │   ├── crm.js            — Leads, pipeline, scoring (34 endpoints)
│   │   ├── billing.js        — Invoices, GST, credit notes (21 endpoints)
│   │   ├── staff.js          — Staff + attendance + payroll (18 endpoints)
│   │   ├── finance.js        — P&L, cash flow, bank reconciliation (24 endpoints)
│   │   ├── reports.js        — ERP reports + GSTR-1
│   │   └── misc.js           — Branches, WA templates, loyalty
│   ├── cms/
│   │   ├── blog.js           — Blog posts CRUD
│   │   ├── cms.js            — Pages, banners, FAQs, popups, menus
│   │   ├── media.js          — Media library upload
│   │   ├── social.js         — Social media posts
│   │   └── reels.js          — Video reels
│   └── system/
│       ├── appSettings.js    — GET/PUT app settings
│       ├── siteSettings.js   — Public site feature flags
│       ├── notifications.js  — Test email/WA + notification list
│       ├── sitemap.js        — Auto-generated XML sitemap
│       ├── robots.js         — Dynamic robots.txt
│       ├── manifest.js       — PWA manifest.json
│       ├── seo.js            — Meta tags + Schema.org JSON-LD
│       ├── menus.js          — Navigation menu CRUD
│       └── push.js           — Push notifications
├── settings/
│   └── index.js              — getSetting, setSetting, cache (30s TTL)
├── setup/
│   └── index.js              — Seed defaults, create superadmin
├── utils/
│   └── index.js              — uuid, slugify, validators, paginate
├── locale/
│   └── index.js              — Currency/date formatting
├── handlers/                  — Business logic (separated from routes)
├── models/                    — DB model documentation
├── pdf/                       — Invoice PDF generation
├── ai/
│   └── agent.js              — AI agent logic (OpenRouter)
├── evolution/                 — Evolution WhatsApp API client
├── whatsapp/
│   └── notifications.js      — Order/lead/alert WA notifications
└── public/uploads/            — File storage
```

---

## Pages

### Public Pages (40)

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, banners, featured products, categories |
| Products | `/products` | Grid with filters, search, pagination |
| Product Detail | `/product/:slug` | Images, specs, reviews, schema |
| Cart | `/cart` | Shopping cart with quantity |
| Checkout | `/checkout` | Address, payment, coupon |
| Order Success | `/order-success` | Confirmation page |
| Account | `/account` | Profile, orders, addresses, wishlist |
| Login | `/login` | Email/password login |
| Register | `/register` | Signup form |
| About | `/about` | Dynamic from settings + branches |
| Contact | `/contact` | Contact form + map |
| Blog | `/blog` | Blog listing |
| Blog Post | `/blog/:slug` | Single post |
| Services | `/services` | Repair services list |
| Store Locator | `/store-locator` | Branch locations + maps |
| Help Center | `/help` | FAQs + support contact |
| Deals | `/deals` | Discounted products |
| New Arrivals | `/new-arrivals` | Latest products |
| Best Sellers | `/best-sellers` | Top selling |
| Categories | `/categories` | All categories grid |
| Compare | `/compare` | Side-by-side comparison |
| Wishlist | `/wishlist` | Saved products |
| EMI Calculator | `/emi-calculator` | Loan EMI calc |
| Track Order | `/track-order` | Order tracking |
| Repair Track | `/repair-track` | Job card status |
| FAQ | `/faq` | Frequently asked questions |
| Privacy | `/privacy` | Privacy policy |
| Terms | `/terms` | Terms & conditions |
| Refund | `/refund` | Refund policy |
| Shipping | `/shipping` | Shipping policy |
| Sitemap | `/sitemap` | HTML sitemap |
| Offers | `/offers` | Current offers |
| Bulk Order | `/bulk-order` | B2B enquiry |
| Brand Store | `/brand/:slug` | Brand-specific products |
| CMS Page | `/page/:slug` | Dynamic CMS pages |
| Customer Portal | `/portal` | Customer self-service |
| Notifications | `/notifications` | User notifications |
| Links | `/links` | Social links page |
| 404 | `*` | Not found page |

### Admin Pages (50)

| Page | Route | Module |
|------|-------|--------|
| Dashboard | `/admin` | — |
| Analytics | `/admin/analytics` | mod_analytics |
| Products | `/admin/products` | mod_ecommerce |
| Orders | `/admin/orders` | mod_ecommerce |
| Payments | `/admin/payments` | mod_ecommerce |
| Returns | `/admin/returns` | mod_ecommerce |
| Customers | `/admin/customers` | mod_ecommerce |
| Categories | `/admin/categories` | mod_ecommerce |
| Coupons | `/admin/coupons` | mod_loyalty |
| Abandoned Carts | `/admin/abandoned-carts` | mod_ecommerce |
| CRM / Leads | `/admin/erp/crm` | mod_crm |
| Customer 360 | `/admin/erp/customer360` | mod_crm |
| Automations | `/admin/automations` | mod_crm |
| Email Campaigns | `/admin/email-campaigns` | mod_crm |
| Job Cards | `/admin/erp/job-cards` | mod_erp |
| Services | `/admin/services` | mod_erp |
| Live Dashboard | `/admin/erp/live` | mod_erp |
| Billing | `/admin/erp/billing` | mod_billing |
| Recurring | `/admin/erp/recurring` | mod_billing |
| Expenses | `/admin/erp/expenses` | mod_billing |
| Inventory | `/admin/inventory` | mod_inventory |
| Branches | `/admin/erp/branches` | mod_inventory |
| Staff | `/admin/erp/staff` | mod_hr |
| Attendance | `/admin/erp/attendance` | mod_hr |
| Payroll | `/admin/erp/payroll` | mod_hr |
| Shifts | `/admin/erp/shifts` | mod_hr |
| Leaves | `/admin/erp/leaves` | mod_hr |
| WhatsApp | `/admin/whatsapp` | mod_whatsapp |
| Broadcast | `/admin/broadcast` | mod_whatsapp |
| Evolution API | `/admin/evolution` | mod_whatsapp |
| WA Templates | `/admin/erp/wa-templates` | mod_whatsapp |
| Blog | `/admin/blog` | mod_blog |
| CMS Pages | `/admin/cms` | mod_blog |
| Media Library | `/admin/media` | mod_blog |
| Social Media | `/admin/social` | mod_social |
| Reels | `/admin/reels` | mod_social |
| Reviews | `/admin/reviews` | mod_reviews |
| Reports | `/admin/reports` | mod_analytics |
| ERP Reports | `/admin/erp/reports` | mod_analytics |
| Report Builder | `/admin/erp/report-builder` | mod_analytics |
| KPI Alerts | `/admin/erp/kpi-alerts` | mod_analytics |
| Audit Log | `/admin/erp/audit-log` | mod_analytics |
| Loyalty | `/admin/erp/loyalty` | mod_loyalty |
| Users & Roles | `/admin/users` | — |
| Shipping Rules | `/admin/shipping-rules` | — |
| Contacts | `/admin/contacts` | — |
| Homepage Sections | `/admin/homepage-sections` | — |
| ERP Overview | `/admin/erp` | — |
| Super Admin | `/admin/super-admin` | superadmin only |
| All Settings | `/admin/settings` | — |

### Settings Pages (12)

| Page | Route | Controls |
|------|-------|----------|
| Site & General | `/admin/settings/site` | Store info, contact, hours, branding, SEO, URLs, social, footer, features |
| Appearance | `/admin/settings/appearance` | Theme presets, colors, fonts, dark mode, header, announcement, custom CSS/JS |
| Homepage | `/admin/settings/homepage` | Hero text, CTA buttons, section toggles, counts |
| Menus | `/admin/settings/menus` | Header/footer/mobile nav items CRUD + reorder |
| Ecommerce | `/admin/settings/ecommerce` | Payment gateways, shipping zones, order statuses, tax, returns, cart |
| ERP & Branches | `/admin/settings/erp` | SLA, billing, inventory, branch CRUD, staff, finance |
| CRM | `/admin/settings/crm` | Pipeline stages, sources, scoring, automations, templates, notifications |
| CMS | `/admin/settings/cms` | Blog, banners, popups, homepage sections, testimonials, SEO, media |
| Notifications | `/admin/settings/notifications` | SMTP, WhatsApp API, SMS, email events, push — with test buttons |
| API Keys | `/admin/settings/api-keys` | AI, Razorpay, PhonePe, Paytm, Cashfree, Evolution, SMTP |
| Security | `/admin/settings/security` | JWT, 2FA, rate limits, CORS, sessions, maintenance, system |
| About Page | `/admin/settings/about-page` | Hero, stats, values, founder, team, branches, SEO |

---

## API Endpoints (482 total)

### Auth (`/api/auth`)
- POST `/register` — signup
- POST `/login` — login (returns JWT)
- POST `/forgot-password` — send reset email
- POST `/reset-password` — reset with token
- GET `/me` — current user profile

### Products (`/api/products`)
- GET `/` — list (filters, pagination, search)
- GET `/:id` — single product
- POST `/` — create (admin)
- PUT `/:id` — update (admin)
- DELETE `/:id` — delete (admin)
- GET `/slug/:slug` — by slug
- POST `/:id/variants` — add variant
- GET `/brands` — all brands
- GET `/search` — autocomplete search

### Orders (`/api/orders`)
- POST `/` — create order
- GET `/` — list (admin)
- GET `/my` — customer's orders
- GET `/:id` — single order
- PUT `/:id/status` — update status (triggers WhatsApp)
- GET `/:id/invoice-pdf` — download PDF
- POST `/abandoned-cart` — save abandoned cart
- GET `/abandoned-carts` — admin list
- POST `/abandoned-carts/:id/recover` — send recovery

### Payments (`/api/payment`)
- GET `/methods` — enabled gateways (from settings)
- POST `/razorpay/create-order` — Razorpay order
- POST `/razorpay/verify` — verify payment
- POST `/phonepe/initiate` — PhonePe payment
- POST `/phonepe/callback` — webhook
- POST `/paytm/initiate` — Paytm payment
- POST `/paytm/callback` — webhook
- POST `/cashfree/create-order` — Cashfree
- POST `/cashfree/verify` — verify

### CRM (`/api/crm-tools`)
- GET `/leads` — list leads
- POST `/leads` — create lead
- PUT `/leads/:id` — update lead
- DELETE `/leads/:id` — delete
- PUT `/leads/:id/stage` — move stage
- POST `/leads/:id/activity` — add activity
- GET `/automations` — list rules
- POST `/automations` — create rule
- PUT `/automations/:id` — toggle/edit
- GET `/pipeline-stats` — pipeline analytics
- POST `/leads/import` — CSV import

### Job Cards (`/api/erp/job-cards`)
- GET `/` — list
- POST `/` — create
- PUT `/:id` — update
- PUT `/:id/status` — change status
- POST `/:id/parts` — add parts
- POST `/:id/photos` — upload photos
- PUT `/:id/timer` — start/stop timer
- GET `/:id/timeline` — activity log

### Billing (`/api/erp/billing`)
- GET `/invoices` — list
- POST `/invoices` — create GST invoice
- GET `/invoices/:id` — single
- POST `/credit-notes` — create credit note
- GET `/quotations` — list quotations
- POST `/quotations` — create

### Staff (`/api/erp/staff`)
- GET `/` — list staff
- POST `/` — add staff
- POST `/attendance` — mark attendance
- GET `/attendance` — attendance report
- POST `/leaves` — apply leave
- GET `/payroll` — payroll data
- POST `/payroll/generate` — generate payslips

### Inventory (`/api/inventory`)
- GET `/` — stock list
- POST `/stock-entry` — add stock
- POST `/transfer` — branch transfer
- GET `/suppliers` — supplier list
- POST `/purchase-orders` — create PO
- GET `/movements` — stock movements log

### WhatsApp (`/api/whatsapp`)
- GET `/messages/:phone` — chat history
- POST `/send` — send message
- POST `/broadcast` — bulk send
- GET `/templates` — message templates
- POST `/templates` — create template

### System
- GET `/api/health` — server health
- GET `/api/app-settings` — all settings (public)
- PUT `/api/app-settings` — save settings (admin)
- GET `/api/menus/:location` — nav items
- GET `/sitemap.xml` — XML sitemap
- GET `/robots.txt` — robots file
- GET `/manifest.json` — PWA manifest
- GET `/api/seo/schema/product/:slug` — product JSON-LD
- GET `/api/seo/schema/organization` — business JSON-LD
- POST `/api/notifications/test-email` — test SMTP
- POST `/api/notifications/test-whatsapp` — test WA

---

## Role-Based Access Control

| Role | Level | Access |
|------|:-----:|--------|
| superadmin | 100 | Everything + Super Admin panel + module control |
| admin | 90 | Full admin panel (enabled modules only) |
| owner | 90 | Same as admin |
| manager | 70 | Most admin features |
| accountant | 60 | Billing, expenses, reports |
| sales | 50 | CRM, orders, customers |
| technician | 40 | Job cards, inventory |
| staff | 30 | Basic access |
| customer | — | Public site + account |

---

## Module System (Super Admin)

16 modules controllable from `/admin/super-admin`:

| Module Key | Controls |
|-----------|----------|
| mod_ecommerce | Products, Orders, Payments, Cart |
| mod_crm | Leads, Pipeline, Automations, Campaigns |
| mod_erp | Job Cards, Services, Live Dashboard |
| mod_billing | Invoices, Expenses, Recurring |
| mod_inventory | Stock, Suppliers, POs, Branches |
| mod_hr | Staff, Attendance, Payroll, Leaves |
| mod_blog | Blog, CMS Pages, Media |
| mod_whatsapp | Chat, Broadcast, Templates |
| mod_email | Email Campaigns |
| mod_social | Social Media, Reels |
| mod_analytics | Analytics, Reports, KPI |
| mod_loyalty | Coupons, Wallet, Referral |
| mod_reviews | Product Reviews |
| mod_multi_branch | Multi-branch features |
| mod_ai_agent | AI Chatbot |
| mod_custom_code | Custom CSS/JS injection |

Disabled module → hidden from sidebar + blocked at route level.

---

## Database (89 tables)

Key tables: users, products, orders, order_items, categories, reviews, coupons, leads, crm_automations, job_cards, invoices, expenses, staff, attendance, leaves, payroll, branches, branch_stock, inventory_movements, blog_posts, banners, faqs, popups, menu_items, app_settings, wallet, wallet_transactions, abandoned_carts, whatsapp_templates, services, addresses, notifications.

---

## Deployment

```bash
# Production server
cd /var/www/ailaptopwala
git pull origin main
npm run build          # Vite build + prerender 17 pages
cd backend && npm install
pm2 restart ailaptopwala-backend --update-env
```

**Server:** Nginx reverse proxy → Express (port 5000)
**SSL:** Let's Encrypt (auto-renew)
**Process:** PM2 (auto-restart, logs)
**Domain:** ailaptopwala.com

---

## Performance

- Code splitting: 94 JS chunks (lazy loaded)
- Prerender: 17 static HTML pages for SEO
- Compression: gzip on all responses
- Settings cache: 30s TTL (no DB hit per request)
- Images: lazy loading enabled
- Bundle: 737KB initial (was 2MB+)

---

*Generated: May 2026 | MLHK Infotech*

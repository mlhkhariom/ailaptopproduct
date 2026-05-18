# 🚀 Complete Codebase Exploration - AI Laptop Wala

**Repository:** mlhkhariom/ailaptopproduct  
**Language:** TypeScript + JavaScript  
**Last Updated:** May 18, 2026  
**Size:** 100 MB

---

## 📋 Project Overview

**AI Laptop Wala** is a comprehensive full-stack e-commerce and business management platform built for a laptop retail store in Indore. It combines:
- Customer-facing e-commerce platform
- Advanced admin dashboard with 20+ modules
- WhatsApp AI Agent integration
- Evolution API support for enterprise messaging
- Inventory management & ERP features
- Multi-branch support

### Key Features
✅ E-commerce (Products, Orders, Coupons, Reviews)  
✅ WhatsApp AI Agent (Auto-reply, Product search, Booking)  
✅ Evolution API WhatsApp module  
✅ Admin panel (20+ modules)  
✅ SEO optimized (Schema.org, Sitemap, Robots.txt)  
✅ Blog, FAQ, Services, Contact forms  
✅ Payment integration (Razorpay)  
✅ Media upload and management  
✅ Social media posting  
✅ Loyalty program  
✅ CRM/ERP features  

---

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend:** React 18.3 + Vite 8 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + PostgreSQL (with SQLite fallback)
- **Real-time:** Socket.IO for WhatsApp events
- **WhatsApp:** whatsapp-web.js + Evolution API
- **AI Agent:** OpenRouter / Gemini API
- **Deployment:** PM2 + Nginx + Cloudflare

---

## 📁 Directory Structure

```
ailaptopproduct/
├── src/                          # React Frontend (TypeScript)
│   ├── pages/                    # 30+ page components
│   │   ├── admin/               # Admin dashboard pages (20+ modules)
│   │   ├── Index.tsx            # Homepage
│   │   ├── Products.tsx         # Product listing
│   │   ├── ProductDetail.tsx    # Product page
│   │   ├── Cart.tsx             # Shopping cart
│   │   ├── Checkout.tsx         # Checkout flow
│   │   ├── Account.tsx          # User account
│   │   ├── Services.tsx         # Service bookings
│   │   └── ...
│   ├── components/              # React components
│   │   ├── common/              # Shared components
│   │   ├── layout/              # Layout components
│   │   ├── ecommerce/           # E-commerce components
│   │   ├── products/            # Product components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── billing/             # Billing components
│   │   └── settings/            # Settings components
│   ├── lib/                     # Utility functions
│   │   ├── api.ts              # Central API client
│   │   ├── exportUtils.ts      # Excel/CSV export
│   │   └── poPrint.ts          # Purchase order printing
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # Zustand stores
│   ├── types/                  # TypeScript types
│   ├── App.tsx                 # Main app with routing
│   └── main.tsx                # React entry point
│
├── backend/                     # Node.js Backend
│   ├── src/
│   │   ├── index.js            # Express server setup
│   │   ├── routes/             # API route handlers
│   │   │   ├── ai.js           # AI agent endpoints
│   │   │   ├── auth.js         # Authentication
│   │   │   ├── categories.js   # Product categories
│   │   │   ├── evolution.js    # Evolution API integration
│   │   │   ├── inventory.js    # Inventory management
│   │   │   ├── invoice.js      # Billing/invoices
│   │   │   ├── reports.js      # Analytics reports
│   │   │   ├── reviews.js      # Product reviews
│   │   │   ├── services.js     # Service management
│   │   │   ├── whatsapp.js     # WhatsApp endpoints
│   │   │   ├── registry.js     # Route registration
│   │   │   ├── cms/            # CMS routes
│   │   │   ├── ecommerce/      # E-commerce routes
│   │   │   ├── erp/            # ERP/business routes
│   │   │   └── system/         # System routes
│   │   │
│   │   ├── db/                 # Database layer
│   │   │   ├── database.js     # SQLite/PostgreSQL adapter
│   │   │   ├── database.pg.js  # PostgreSQL client
│   │   │   ├── seeder.js       # Database seeding
│   │   │   └── migrate_to_pg.js # Migration script
│   │   │
│   │   ├── ai/                 # AI agent logic
│   │   ├── evolution/          # Evolution API client
│   │   ├── whatsapp/           # WhatsApp handlers
│   │   │   ├── client.js       # whatsapp-web.js client
│   │   │   ├── notifications.js # Notification processor
│   │   │   ├── paymentReminders.js
│   │   │   ├── dailyReport.js
│   │   │   └── schedulers.js   # Scheduled tasks
│   │   ├── lib/                # Backend utilities
│   │   └── middleware/         # Express middleware
│   │
│   ├── db_schema.js            # Database schema viewer
│   ├── import_products.js      # Product importer
│   ├── seed-products.js        # Product seeder
│   └── package.json
│
├── public/                     # Static assets
├── supabase/                   # Supabase migrations
├── package.json               # Frontend dependencies
├── tailwind.config.ts        # Tailwind configuration
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
├── ecosystem.config.cjs      # PM2 configuration
├── nginx.conf                # Nginx reverse proxy config
└── README.md                 # Project documentation
```

---

## 🔌 Core API Architecture

### Frontend API Client (`src/lib/api.ts`)
Central hub for all backend communication. Features:
- Token-based authentication (Bearer token)
- Automatic error handling
- Typed endpoints
- Multipart form data support (file uploads)

**Key API Groups:**
```typescript
api.
├── AI Agent (settings, models, memory)
├── Payment (Razorpay integration, shipping)
├── Products (CRUD, reviews, export/import)
├── Orders (place, track, admin management)
├── Coupons (validate, create, update, delete)
├── CMS (pages, blog posts)
├── Blog (posts management)
├── Services (booking, management)
├── Invoice (billing, custom invoices)
├── WhatsApp (status, chats, rules, analytics)
├── Media (upload, delete, stats)
├── Categories (product categories)
├── Social (settings, posts, stats)
├── Reels (Instagram integration)
├── Customers (360 view, reports)
├── ERP (billing, transfers, forecasts, GST)
└── Notifications (real-time updates)
```

### Backend Express Server (`backend/src/index.js`)
**Features:**
- CORS enabled for development & production
- Rate limiting (200 req/15min general, 20 for auth)
- Helmet security headers
- Socket.IO for real-time WhatsApp events
- Static file serving (uploads, frontend dist)
- SEO support (OG meta tags, sitemap.xml, robots.txt)
- AI context file (llms.txt)
- Unhandled rejection prevention

**Route Registry Pattern:**
Routes are centrally registered via `registerRoutes()` function in `backend/src/routes/registry.js`. This allows clean, modular route organization.

---

## 📊 Frontend Pages (30+)

### Public Pages
| Page | Route | Purpose |
|------|-------|---------|
| Homepage | `/` | Hero, featured products, testimonials |
| Products | `/products` | Product catalog with filters |
| Product Detail | `/products/:id` | Single product page with reviews |
| Brand Store | `/brands/:brand` | Brand-specific product listing |
| Cart | `/cart` | Shopping cart management |
| Checkout | `/checkout` | Order placement (protected) |
| Blog | `/blog` | Blog post listing |
| Blog Post | `/blog/:id` | Individual blog post |
| About | `/about` | Company information |
| Services | `/services` | Service offerings |
| Contact | `/contact` | Contact form |
| FAQ | `/faq` | Frequently asked questions |
| EMI Calculator | `/emi-calculator` | EMI calculation tool |
| Offers | `/offers` | Active promotions |
| Bulk Order | `/bulk-order` | B2B ordering |
| Repair | `/repair` | Repair service page |
| Track Repair | `/track` | Repair status tracking |
| Track Order | `/track-order` | Order tracking |
| Wishlist | `/wishlist` | Saved products |
| Compare | `/compare` | Product comparison |
| Privacy | `/privacy` | Privacy policy |
| Terms | `/terms` | Terms of service |
| Shipping | `/shipping` | Shipping info |
| Refund | `/refund` | Refund policy |

### Protected Customer Pages
| Page | Route |
|------|-------|
| Account | `/account` |
| Checkout | `/checkout` |
| My Account Portal | `/my-account` |
| Order Success | `/order-success` |
| Notifications | `/notifications` |

### Admin Pages (20+)
| Module | Route | Purpose |
|--------|-------|---------|
| Dashboard | `/admin` | Overview & KPIs |
| Products | `/admin/products` | Product management |
| Orders | `/admin/orders` | Order management |
| Payments | `/admin/payments` | Payment tracking |
| Blog | `/admin/blog` | Blog management |
| Social | `/admin/social` | Social media posting |
| Media | `/admin/media` | Media library |
| WhatsApp | `/admin/whatsapp` | WhatsApp rules & templates |
| Services | `/admin/services` | Service management |
| Reviews | `/admin/reviews` | Review moderation |
| Reels | `/admin/reels` | Reel management |
| Inventory | `/admin/inventory` | Stock management |
| Returns | `/admin/returns` | Return processing |
| Coupons | `/admin/coupons` | Coupon management |
| CMS | `/admin/cms` | Content management |
| Categories | `/admin/categories` | Product categories |
| Customers | `/admin/customers` | Customer management |
| Reports | `/admin/reports` | Analytics & reports |
| Settings | `/admin/settings` | Site configuration |
| **ERP Module** | | |
| └─ Job Cards | `/admin/erp/job-cards` | Service job tracking |
| └─ Staff | `/admin/erp/staff` | Employee management |
| └─ Expenses | `/admin/erp/expenses` | Staff & operating expenses |
| └─ Billing | `/admin/erp/billing` | Unified billing system |
| └─ Reports | `/admin/erp/reports` | ERP analytics |
| └─ CRM | `/admin/erp/crm` | Lead & contact management |
| └─ Branches | `/admin/erp/branches` | Multi-branch support |
| └─ Attendance | `/admin/erp/attendance` | Staff attendance |
| └─ Leaves | `/admin/erp/leaves` | Leave management |
| └─ Shifts | `/admin/erp/shifts` | Shift scheduling |
| └─ Payroll | `/admin/erp/payroll` | Salary processing |
| └─ Loyalty | `/admin/erp/loyalty` | Loyalty program |
| └─ Customer 360 | `/admin/erp/customer360` | Unified customer view |
| └─ Live Dashboard | `/admin/erp/live` | Real-time metrics |
| └─ Report Builder | `/admin/erp/report-builder` | Custom reports |
| └─ KPI Alerts | `/admin/erp/kpi-alerts` | Performance alerts |
| └─ Audit Log | `/admin/erp/audit-log` | Activity tracking |
| └─ Evolution | `/admin/evolution` | Evolution API config |
| └─ Automations | `/admin/automations` | Workflow automation |
| └─ Email Campaigns | `/admin/email-campaigns` | Email marketing |
| └─ Shipping Rules | `/admin/shipping-rules` | Shipping configuration |
| └─ Broadcast | `/admin/broadcast` | Bulk messaging |
| └─ Analytics | `/admin/analytics` | Advanced analytics |
| └─ Contacts | `/admin/contacts` | Contact form submissions |
| └─ Users | `/admin/users` | Admin user management |
| └─ Abandoned Carts | `/admin/abandoned-carts` | Cart recovery |
| └─ Homepage Sections | `/admin/homepage-sections` | Homepage customization |
| └─ WA Templates | `/admin/erp/wa-templates` | WhatsApp message templates |

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. **Login/Register** (`src/pages/Login.tsx`, `src/pages/Register.tsx`)
   - Email + password credentials
   - JWT token issued from backend
   - Token stored in localStorage

2. **Token Management** (`src/lib/api.ts`)
   - Retrieved via `getToken()` from localStorage
   - Passed as `Authorization: Bearer {token}` header
   - Key: `ailaptopwala_token`

3. **Protected Routes** (`src/components/ProtectedRoute.tsx`)
   - `<ProtectedRoute>` wrapper for customer features
   - `<AdminRoute>` wrapper for admin pages
   - Redirects to login if not authenticated

### User Roles
- **Super Admin:** Full access (`admin@mlhk.in` / `HarioM9165`)
- **Admin:** Admin panel access (`admin@ailaptopwala.com` / `Laptop@9165`)
- **Customer:** E-commerce access only

---

## 💾 Database Schema

### Key Tables (39+ tables total)
**Authentication & Users:**
- users (id, email, password, role, phone, address)

**E-commerce:**
- products (id, name, slug, price, sku, category_id, image, stock, status)
- orders (id, user_id, order_number, items, total, status, payment_status)
- order_items (id, order_id, product_id, quantity, price)
- reviews (id, product_id, user_id, rating, comment, status)
- coupons (id, code, discount_type, discount_value, min_purchase, max_uses)

**Services & Repair:**
- services (id, name, category, price, description)
- service_bookings (id, user_id, service_id, date, status)
- repair_jobs (id, customer_id, device, issue, status, timeline)

**Inventory & ERP:**
- inventory (id, product_id, branch_id, stock_level, reorder_level)
- purchase_orders (id, supplier_id, items, total_amount, status)
- stock_transfers (id, from_branch, to_branch, items, status)

**Billing & Finance:**
- custom_invoices (id, customer_id, items, total, status)
- expenses (id, branch_id, category, amount, description)
- payroll (id, staff_id, salary, deductions, net_pay, period)

**CRM & Leads:**
- leads (id, phone, name, status, stage, source)
- crm_activities (id, lead_id, activity_type, notes, timestamp)

**Blog & CMS:**
- blog_posts (id, title, slug, content, author_id, status)
- cms_pages (id, slug, title, content)
- cms_settings (id, section, content)

**Communications:**
- whatsapp_rules (id, trigger_type, pattern, response, enabled)
- whatsapp_templates (id, name, content, variables)
- notifications (id, user_id, message, type, read_at)
- contacts (id, name, email, message, status)

**Media & Settings:**
- media (id, filename, url, type, size, folder)
- site_settings (id, key, value)
- app_settings (id, category, key, value)
- evolution_settings (id, api_url, api_key, default_instance)

**Multi-branch:**
- branches (id, name, address, phone, manager_id)
- staff (id, branch_id, name, role, email, phone, salary)
- attendance (id, staff_id, date, status, check_in, check_out)
- leaves (id, staff_id, type, from_date, to_date, status)
- shifts (id, branch_id, name, start_time, end_time)

**Advanced Features:**
- loyalty_programs (id, name, tier, points_multiplier, benefits)
- loyalty_transactions (id, customer_id, program_id, points, transaction_type)
- kpi_alerts (id, metric_name, threshold, action, enabled)
- audit_log (id, user_id, action, table_name, old_value, new_value, timestamp)

---

## 🤖 WhatsApp Integration

### Architecture
1. **whatsapp-web.js Client** (`backend/src/whatsapp/client.js`)
   - Chrome-based WhatsApp Web automation
   - QR code authentication
   - Message sending/receiving
   - Chat management

2. **Evolution API** (`backend/src/evolution/`)
   - Enterprise WhatsApp API
   - Webhook integration
   - Message templates
   - Bulk messaging

3. **Notification Processors** (`backend/src/whatsapp/`)
   - `notifications.js` - Real-time message processing
   - `paymentReminders.js` - Payment follow-ups
   - `dailyReport.js` - Daily business reports
   - `schedulers.js` - Recurring tasks

### WhatsApp Routes (`backend/src/routes/whatsapp.js`)
- `/api/whatsapp/status` - Connection status
- `/api/whatsapp/connect` - Initialize connection
- `/api/whatsapp/disconnect` - Close connection
- `/api/whatsapp/send` - Send message
- `/api/whatsapp/chats` - List chats
- `/api/whatsapp/messages/:phone` - Get messages
- `/api/whatsapp/rules` - Manage auto-reply rules
- `/api/whatsapp/simulate` - Test rules
- `/api/whatsapp/analytics` - Chat analytics

---

## 🚀 Deployment Configuration

### PM2 Ecosystem (`ecosystem.config.cjs`)
Manages Node.js processes in production.

### Nginx Configuration (`nginx.conf`)
- Reverse proxy for backend (port 5000)
- Static file serving (frontend dist)
- SSL/TLS termination
- Gzip compression

### Environment Variables
**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_EVOLUTION_URL=http://localhost:8081
VITE_EVOLUTION_KEY=ailaptopwala2026
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/ailaptopwala_db
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://ailaptopwala.com
BACKEND_URL=https://ailaptopwala.com
```

---

## 📦 Dependencies Overview

### Frontend (`package.json`)
**UI & Components:**
- react@18.3.1
- @radix-ui/* (20+ components)
- shadcn/ui (headless UI library)
- lucide-react (icons)

**Forms & Validation:**
- react-hook-form@7.61.1
- zod@3.25.76
- @hookform/resolvers@3.10.0

**Data Fetching & State:**
- @tanstack/react-query@5.83.0
- zustand@5.0.12
- socket.io-client@4.8.3

**Utilities:**
- date-fns@3.6.0
- recharts@2.15.4
- next-themes@0.3.0
- xlsx@0.18.5
- clsx@2.1.1
- tailwind-merge@2.6.0

### Backend (`backend/package.json`)
**Core:**
- express@4.19.2
- pg@8.20.0 (PostgreSQL)
- better-sqlite3@9.4.3 (SQLite fallback)

**Authentication & Security:**
- jsonwebtoken@9.0.2
- bcryptjs@2.4.3
- helmet@8.1.0
- express-rate-limit@8.3.2
- cors@2.8.5

**WhatsApp & Messaging:**
- whatsapp-web.js@1.34.6
- socket.io@4.8.3

**Payments & Utilities:**
- razorpay@2.9.6
- qrcode@1.5.4
- pdfkit@0.18.0
- multer@1.4.5-lts.1
- openai@6.34.0
- uuid@14.0.0

---

## 🔄 Request/Response Flow Example

### Product Listing Flow
1. **Frontend:** User visits `/products`
2. **React Component** (`src/pages/Products.tsx`)
   - Calls `api.getProducts({ category, sort, page })`
3. **API Client** (`src/lib/api.ts`)
   - Makes GET request to `http://localhost:5000/api/products`
   - Includes Bearer token in headers
4. **Express Route** (`backend/src/routes/ecommerce/products.js`)
   - Validates authentication
   - Queries database
   - Returns filtered products
5. **Frontend Rendering**
   - Maps products to UI components
   - Displays with images, prices, ratings
   - Handles filters and sorting

---

## 🔍 Security Features

✅ **Authentication:** JWT with token storage in localStorage  
✅ **Encryption:** bcryptjs for password hashing  
✅ **Rate Limiting:** 200 req/15min general, 20 for auth attempts  
✅ **CORS:** Configured for frontend domains  
✅ **Security Headers:** Helmet.js middleware  
✅ **Protected Routes:** Role-based access control  
✅ **SQL Injection Prevention:** Parameterized queries  
✅ **XSS Protection:** React's built-in escaping  

---

## 📱 Recent Open Issues (PRs)

**Open Pull Requests (Dependency Updates):**
- PR #11: Bump ip-address and express-rate-limit
- PR #10: Bump multer from 1.4.5-lts.2 to 2.1.1
- PR #6: Bump lodash from 4.17.21 to 4.18.1
- PR #4: Bump flatted from 3.3.1 to 3.4.2

All are Dependabot automated dependency updates. No critical bugs reported.

---

## 🎯 Next Steps for Development

1. **Merge Dependency PRs** - Update vulnerable packages
2. **Test WhatsApp Integration** - Evolution API webhook testing
3. **Database Optimization** - Index analysis for large tables
4. **Performance Optimization** - Image optimization, code splitting
5. **Mobile Responsiveness** - Mobile UI testing
6. **Accessibility Audit** - WCAG 2.1 compliance
7. **API Documentation** - Swagger/OpenAPI generation
8. **Test Coverage** - Unit and integration tests

---

## 📚 Useful Commands

```bash
# Frontend
npm install              # Install dependencies
npm run dev             # Start dev server (Vite)
npm run build           # Build for production
npm run lint            # Run ESLint
npm run preview         # Preview production build

# Backend
cd backend && npm install
npm run dev             # Watch mode
npm start               # Production
node db_schema.js       # View all tables
node seed-products.js   # Seed products

# Database
cd backend
node db_schema.js       # Display schema
node import_products.js # Import CSV products

# Deployment
pm2 start ecosystem.config.cjs
pm2 logs
pm2 save
pm2 startup
```

---

## 📞 Admin Credentials

- **Super Admin:** `admin@mlhk.in` / `HarioM9165`
- **Admin:** `admin@ailaptopwala.com` / `Laptop@9165`

---

**Last Updated:** May 18, 2026  
**Codebase Language:** TypeScript + JavaScript (ES6 Modules)  
**Total Pages:** 30+ frontend pages + 20+ admin modules  
**Database Tables:** 39+  
**API Endpoints:** 100+

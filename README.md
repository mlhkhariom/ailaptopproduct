# AI Laptop Wala — Complete ERP/CRM/Ecommerce Platform

> Production-grade platform for AI Laptop Wala (Asati Infotech), Indore's trusted laptop store since 2011.  
> Live: [ailaptopwala.com](https://ailaptopwala.com)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express + PostgreSQL |
| State | Zustand (cart, products, wishlist, notifications) |
| Auth | JWT + Google OAuth |
| WhatsApp | whatsapp-web.js + Evolution API |
| AI Agent | OpenRouter / Gemini / Groq (configurable) |
| Payments | Razorpay, PhonePe, Cashfree, Paytm, UPI, COD |
| Deploy | PM2 + Nginx + Ubuntu VPS |
| PWA | Service Worker + Install Prompt |

---

## 📦 Modules

### 🛒 Ecommerce (50+ features)
- Product variants (RAM/Storage/Color with price)
- Multi-image gallery with zoom + thumbnails
- Advanced filters (price range, brand, RAM, processor)
- Pagination (20/page, URL-based)
- 6 payment gateways (Razorpay, PhonePe, Cashfree, Paytm, UPI, COD)
- Cart with coupon, shipping progress bar, suggestions
- Saved addresses + auto-save after order
- Buy Now (skip cart)
- Order tracking (timeline UI)
- Returns/Refunds/Exchange
- Wallet + Store credit
- Referral program (₹500/₹250)
- Wishlist with price drop alerts
- Product Q&A + Photo reviews
- Compare products (side-by-side)
- EMI Calculator page
- Offers/Coupons page
- Brand store pages (/brands/:brand)
- Bulk/Corporate orders
- Abandoned cart recovery (WhatsApp auto-reminder)
- Google Login (One Tap)
- PWA (installable, offline support)
- Push notifications
- Mobile bottom navigation
- Deal of the Day (countdown timer)
- Recently viewed + Best sellers + New arrivals
- Delivery estimate (pincode-based)
- Notify me (out of stock)
- Social share (WhatsApp/Facebook/Twitter)
- Quick view modal
- Branch availability display
- Invoice PDF download (GST)
- Order cancellation + Reorder

### 🔧 ERP (45+ features)
- **Job Cards**: Create, assign tech, status workflow, timer (start/stop), parts tracking, photos, warranty check, SLA auto-set, escalation (48h overdue → WhatsApp)
- **Billing**: Invoices, partial payments, GST PDF, recurring, overdue reminders, credit notes, quotations, convert quote→invoice, HSN codes
- **Inventory**: Multi-branch stock, transfer, PO workflow (create→approve→receive→stock), suppliers, serial numbers, stock aging, barcode labels, physical audit, dead stock report, auto-reorder, stock count sheet
- **Staff**: Management, attendance, leaves, shifts, payroll, expenses (approval workflow), performance dashboard, documents (ID/contract/PAN/Aadhar)
- **Finance**: Expense approval, supplier payment ledger, P&L statement, cash flow, bank reconciliation, GSTR-1 export, KPI alerts

### 👥 CRM (25+ features)
- Leads + Pipeline + Kanban board
- Auto-scoring (status + budget + followups)
- Activities timeline
- Follow-up reminders (2h scheduler)
- Tags + Bulk actions
- Import CSV/Excel + Export
- WhatsApp integration (send from CRM)
- Automations (auto-assign, auto-tag, notify)
- Email campaigns (bulk send)
- WhatsApp broadcast
- Customer 360 view
- Customer segments (VIP, Active, New, Inactive)
- Source analytics (conversion by source)
- Pipeline forecast (weighted)
- Duplicate detection + merge
- Round-robin assignment
- Conversion funnel report
- Time-to-close report
- WhatsApp message templates

### 📝 CMS (20+ features)
- Blog (markdown editor with toolbar)
- Blog categories + tags
- Views counter + reading time
- Related posts
- Banners (scheduled start/end)
- FAQs (categories, DB-managed)
- Popups/Announcements (delay/scroll/exit-intent triggers)
- Menu manager (header/footer/mobile)
- Homepage sections manager
- Testimonials (with video support)
- Media library (folder organization)
- CMS pages (custom)
- Sitemap.xml (auto-generated)
- Robots.txt (dynamic)

---

## 🤖 AI & Automation

### WhatsApp AI Agent
- Auto-replies to customer queries
- Product search from DB (real prices/stock)
- Order creation + Razorpay payment link
- Service booking
- Multi-model support (OpenRouter/Gemini/Groq)
- Conversation memory
- Business hours + daily limits
- Human handoff detection

### 7 Automated Schedulers
| Scheduler | Frequency | Action |
|-----------|-----------|--------|
| Abandoned cart recovery | 2 hours | WhatsApp reminder to customers |
| Low stock alerts | 1 hour | WhatsApp to admin |
| Job card escalation | 1 hour | Alert if repair overdue 48h |
| CRM follow-up reminders | 2 hours | Notify assigned staff |
| Daily sales report | 9 PM | WhatsApp + Email to owner |
| Recurring invoices | 6 hours | Auto-generate invoices |
| Overdue payment reminders | 6 hours | WhatsApp to customers |

---

## 📁 Project Structure

```
backend/src/
├── ai/              → AI agent (WhatsApp sales bot)
├── db/              → Database (PostgreSQL), migrations, seeder
├── evolution/       → Evolution API (WhatsApp Business)
├── lib/             → Config, email, invoicePdf, validation
├── middleware/      → Auth, adminOnly
├── routes/
│   ├── ecommerce/   → Products, orders, payment, coupons, returns, wallet, wishlist, addresses
│   ├── cms/         → CMS pages, blog, reels, media, social
│   ├── erp/         → Billing, CRM, finance, jobcards, staff, reports
│   ├── system/      → Push, notifications, settings
│   └── registry.js  → Auto-loader (registers all routes)
├── whatsapp/        → Client, notifications, schedulers, daily report
└── index.js         → Express app entry

src/
├── components/
│   ├── layout/      → Header, Footer, CustomerLayout, AdminLayout, Sidebar, BottomNav
│   ├── ecommerce/   → ProductCard, GlobalSearch, Reviews, QuickView, CompareBar
│   ├── common/      → SEOHead, WhatsApp, PWA, Popup, ErrorBoundary
│   ├── billing/     → Invoice forms, tables
│   ├── products/    → ProductFormDialog, VariantManager
│   ├── settings/    → Settings tabs
│   └── ui/          → shadcn components
├── contexts/        → Auth, SiteSettings
├── lib/             → API client, utils
├── pages/
│   ├── admin/       → 20+ admin pages
│   └── *.tsx        → Customer pages
├── store/           → Zustand stores (cart, products, wishlist)
└── types/           → TypeScript interfaces
```

---

## 🚀 Setup & Deploy

### Local Development
```bash
# Frontend
cd Final
npm install
npm run dev          # http://localhost:5173

# Backend
cd Final/backend
npm install
cp .env.example .env  # Configure DB + keys
node src/index.js    # http://localhost:5000
```

### Environment Variables
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/ailaptopwala
JWT_SECRET=your-secret
FRONTEND_URL=https://ailaptopwala.com
SMTP_HOST=smtp.gmail.com
SMTP_USER=your@email.com
SMTP_PASS=app-password
```

### Production Deploy
```bash
cd /var/www/ailaptopwala
git pull origin main
npm run build
cd backend && npm install
pm2 restart ailaptopwala-backend --update-env
```

### Seed Products
```bash
cd backend
node seed-products.js   # Seeds 63 products to Silver Mall branch
```

---

## 🔐 Security

- JWT authentication (30-day expiry)
- Rate limiting (200 req/15min, 20 for auth)
- Helmet security headers
- CORS configured
- 2FA PIN for admin
- Input validation helpers
- Audit log (staff + job cards)
- bcrypt password hashing

---

## 📊 Admin Panel Features

- Analytics dashboard (charts — revenue, orders, categories)
- Products (CRUD, variants, images, bulk edit, barcode labels)
- Orders (status update, tracking, WhatsApp notify, export CSV)
- Returns manager (approve/reject)
- Abandoned carts dashboard
- Homepage sections manager
- Shipping rules
- WhatsApp broadcast
- CRM automations
- Email campaigns
- Settings (9 tabs: General, API, Shipping, Payments, Invoice, SEO, Notifications, Security, Features)
- Dark mode toggle

---

## 🏪 Business Info

- **Company**: Asati Infotech (AI Laptop Wala)
- **Founded**: 2011
- **Branches**: Silver Mall (RNT Marg) + Bangali Chouraha (Ashish Nagar)
- **Phone**: +91 98934 96163
- **Services**: Refurbished laptops, MacBooks, gaming laptops, desktops, repair, home service

---

## 📈 Stats

- 150+ API endpoints
- 20+ database tables
- 50+ frontend pages
- 7 automated schedulers
- 6 payment gateways
- 145+ features total

---

## 📄 License

Private — All rights reserved. Asati Infotech / AI Laptop Wala.

# 🌿 Apsoncure PHC – Enterprise Ayurvedic E-Commerce Platform

> **Prachi Homeo Clinic** – A fully dynamic, enterprise-grade Ayurvedic e-commerce platform built with modern web technologies. Complete admin panel, social media automation, CMS, WhatsApp integration, and more.

**Developed by:** [MLHK Infotech](https://mlhk.in) (Hariom Vishwkarma)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Module Details](#-module-details)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Demo Credentials](#-demo-credentials)
- [API Integrations](#-api-integrations)
- [Live Data Modules](#-live-data-modules)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

Apsoncure PHC is a comprehensive e-commerce solution designed specifically for Ayurvedic and wellness businesses in India. It features:

- 🛒 **Customer-facing storefront** with product catalog, cart, checkout, blog, and all legal pages
- 🔐 **Authentication system** with login, register, user accounts, and role-based access control
- 📊 **Admin dashboard** with 15+ management modules
- 📱 **Social media automation** with cross-platform publishing
- 💬 **WhatsApp Web-style** business messaging interface
- 📝 **Full CMS** for managing homepage content, FAQs, testimonials, and site settings
- 📈 **Analytics & reporting** with comprehensive sales, product, customer, and traffic insights

### Brand Details
- **Brand Name:** Apsoncure PHC
- **Clinic:** Prachi Homeo Clinic
- **Founder:** Dr. Prachi
- **Industry:** Ayurvedic & Homeopathic Healthcare Products
- **Target Market:** Indian consumers seeking authentic Ayurvedic solutions

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18 + TypeScript 5 |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 + shadcn/ui |
| **State Management** | Zustand (CMS Store) + React Context (Auth) |
| **Routing** | React Router DOM 6 |
| **Data Fetching** | TanStack React Query 5 |
| **Charts** | Recharts 2 |
| **Forms** | React Hook Form + Zod validation |
| **Backend (Ready)** | Lovable Cloud (Supabase) |
| **Icons** | Lucide React |
| **Notifications** | Sonner toast |
| **Testing** | Vitest + Testing Library |

---

## ✨ Features

### 🌐 Public / Customer-Facing Pages

| Page | Route | Description |
|------|-------|-------------|
| **Homepage** | `/` | Hero banner (CMS-managed), featured products, benefits, testimonials, CTA sections |
| **Products** | `/products` | Full product catalog with search, category filters, sorting |
| **Product Detail** | `/products/:id` | Product info, ingredients, benefits, usage, reels/videos, related products |
| **Cart** | `/cart` | Shopping cart with quantity management, price summary |
| **Checkout** | `/checkout` | Multi-step checkout with address, payment method selection |
| **Blog** | `/blog` | Blog listing with categories and featured posts |
| **Blog Post** | `/blog/:id` | Full article with buy widgets and related articles |
| **About** | `/about` | Company story, team, mission, values |
| **Contact** | `/contact` | Contact form, store info, WhatsApp direct link |
| **FAQ** | `/faq` | Searchable FAQ with category filters and accordion UI |
| **Privacy Policy** | `/privacy` | GDPR-compliant privacy policy |
| **Terms & Conditions** | `/terms` | Legal terms of service |
| **Refund Policy** | `/refund` | Return and refund information |
| **Shipping Policy** | `/shipping` | Delivery timelines, charges, courier details |

### 🔐 Authentication System

| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/login` | Email + password login with demo credentials panel |
| **Register** | `/register` | New user registration with full validation |
| **My Account** | `/account` | User profile, order history, wishlist, profile editing |

- **Role-based access:** Admin users see "Admin Panel" button; customers see account page
- **Header integration:** Dynamic user avatar menu with dropdown (account, cart, logout)
- **Protected routes:** Admin panel accessible only to admin-role users

### 🛡 Admin Panel (15+ Modules)

| Module | Route | Description |
|--------|-------|-------------|
| **Dashboard** | `/admin` | KPI cards (revenue, orders, customers, conversion), recent orders, top products |
| **Products** | `/admin/products` | Full CRUD, stock management, Ayurvedic-specific fields, SEO, status toggle |
| **Orders** | `/admin/orders` | Order list with filters, status management, tracking, invoice |
| **Payments** | `/admin/payments` | Payment tracking, Razorpay integration, transaction history |
| **Customers** | `/admin/customers` | Customer database, LTV tracking, order history, segmentation |
| **Categories** | `/admin/categories` | Product category management with Hindi/English names, SEO |
| **Social Automation** | `/admin/social` | Cross-platform reel publishing, content calendar, auto-link to products |
| **Blog / Content** | `/admin/blog` | Rich text editor, buy widget insertion, SEO fields |
| **Media Library** | `/admin/media` | Centralized image/video management |
| **WhatsApp** | `/admin/whatsapp` | WhatsApp Web-style UI, contact list, chat, templates, QR linking |
| **CMS / Pages** | `/admin/cms` | Hero banners, benefits, testimonials, FAQs, site settings management |
| **Contact Queries** | `/admin/contacts` | Customer inquiry management with reply, priority & status tracking |
| **User & Roles** | `/admin/users` | User management, role assignment, permissions matrix |
| **Reports** | `/admin/reports` | Sales analytics, product performance, customer insights, traffic sources |
| **Settings** | `/admin/settings` | 7-tab settings: General, API Keys, Shipping, Payments, SEO, Alerts, Security |

---

## 📂 Module Details

### 1. 🛒 Product Management
- **Fields:** Name (EN + Hindi), Price, MRP, Category, Stock, SKU, Slug, Status
- **Ayurvedic-specific:** Ingredients, Benefits, Usage instructions, Precautions
- **SEO:** Meta title, description, focus keywords per product
- **Media:** Product images + linked social reels
- **Working Type:** Currently uses mock data in `src/data/mockData.ts`. Connect Lovable Cloud for persistent database storage.

### 2. 📦 Order Management
- **Status Flow:** Pending → Processing → Shipped → Delivered
- **Payment Status:** Pending → Paid / Failed / Refunded
- **Features:** Tracking ID, courier partner, invoice generation, WhatsApp notifications
- **Filters:** By status, payment status, date range, search
- **Working Type:** Mock data. Ready for Lovable Cloud integration with real-time order tracking.

### 3. 💰 Payment Tracking
- **Gateway:** Razorpay (UPI, Card, Net Banking, COD)
- **Tracking:** Transaction ID, payment method, status
- **Features:** Refund management, payment failure alerts
- **Working Type:** UI ready. Requires Razorpay API key configuration in Settings.

### 4. 📱 Social Media Automation
- **Platforms:** Instagram, Facebook, YouTube
- **Features:**
  - Upload video/reel and cross-post to all platforms
  - Auto-generate caption from product data
  - Hashtag suggestions
  - Content calendar with monthly view
  - Product linking — reels auto-embed on product detail pages
  - Publishing history with engagement metrics (views, likes, comments, shares)
  - Retry failed posts
- **Working Type:** UI complete. Requires Meta Graph API keys for actual posting.

### 5. 💬 WhatsApp Business Module
- **UI:** WhatsApp Web replica with chat bubbles, status ticks, typing indicators
- **Features:**
  - Contact list with search, unread/pinned filters
  - Chat history with message bubbles
  - Quick reply templates with dynamic variables (`{{customer_name}}`, `{{product_name}}`)
  - QR code device linking dialog
  - Connection status indicator
- **Working Type:** UI complete. Requires `whatsapp-web.js` backend integration.

### 6. 📝 CMS (Content Management System)
- **Manages:** Hero banners, benefit cards, testimonials, FAQs, site settings
- **Live Integration:** Changes in CMS reflect immediately on homepage, header, and footer
- **State:** Zustand store (`src/store/cmsStore.ts`)
- **Working Type:** Fully functional with Zustand state. Connect Lovable Cloud for persistence across sessions.

### 7. 📧 Contact Query Management
- **Features:**
  - View all customer inquiries with priority levels (High/Medium/Low)
  - Status tracking (New → Read → Replied → Resolved → Archived)
  - Reply directly from admin panel
  - WhatsApp quick reply link
  - Star/favorite important queries
  - Search and filter by status, priority
- **Working Type:** Mock data. Ready for database integration.

### 8. 👥 User & Role Management
- **Roles:** Admin, Manager, Editor, Customer
- **Features:**
  - Assign/change roles via dropdown
  - Activate/deactivate/ban users
  - Role permissions matrix (visual table)
  - User search and filtering
- **Working Type:** Mock data with localStorage auth. Ready for Lovable Cloud auth integration.

### 9. 📊 Reports & Analytics
- **Tabs:** Sales, Products, Customers, Traffic
- **Charts:** Revenue trends (AreaChart), payment methods (PieChart), daily revenue (BarChart), city-wise orders
- **KPIs:** Total revenue, orders, AOV, net profit with growth indicators
- **Export:** PDF and CSV download buttons
- **Working Type:** Mock data visualization. Connect database for real analytics.

### 10. ⚙️ Settings (7 Tabs)
- **General:** Store info, display toggles (dark mode, maintenance, reviews, stock count, Hindi names, reels, cookie consent)
- **API Keys:** Meta Graph API, Razorpay, WhatsApp Business API, Google Analytics
- **Shipping:** Flat rate, free shipping threshold, COD charge, courier partner, delivery estimates by zone
- **Payments:** Enable/disable payment methods (UPI, Card, Net Banking, Wallet, COD, EMI), currency, min/max amounts
- **SEO:** Global meta tags, OG tags, Twitter cards, robots.txt, sitemap, JSON-LD schema
- **Notifications:** Admin alerts (new order, low stock, payment failure) + customer notifications (order confirm, shipping, abandoned cart, birthday)
- **Security:** 2FA, rate limiting, CSRF, SSL redirect, IP whitelist, session timeout, backup/restore, danger zone

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui primitives (50+ components)
│   ├── AdminLayout.tsx   # Admin panel wrapper with sidebar
│   ├── AdminSidebar.tsx  # Admin navigation sidebar (3 sections: Main, Tools, System)
│   ├── CustomerLayout.tsx # Public page wrapper (header + footer)
│   ├── Header.tsx        # Public header with auth-aware user menu
│   ├── Footer.tsx        # Public footer with developer credit
│   ├── ProductCard.tsx   # Product listing card with reel indicator
│   ├── NavLink.tsx       # Active route-aware navigation link
│   └── StatCard.tsx      # Dashboard KPI card
├── contexts/
│   └── AuthContext.tsx   # Authentication provider (login, register, logout, roles)
├── data/
│   └── mockData.ts      # All mock data & TypeScript interfaces (Product, Order, Customer, Blog, Category)
├── hooks/
│   ├── use-mobile.tsx    # Responsive breakpoint detection hook
│   └── use-toast.ts     # Toast notification hook
├── integrations/
│   └── supabase/        # Lovable Cloud client & types (auto-generated)
├── lib/
│   └── utils.ts         # Tailwind merge utility (cn function)
├── pages/
│   ├── Index.tsx         # Homepage (CMS-driven)
│   ├── Products.tsx      # Product listing with filters
│   ├── ProductDetail.tsx # Product detail with reels section
│   ├── Cart.tsx          # Shopping cart
│   ├── Checkout.tsx      # Checkout flow
│   ├── Blog.tsx          # Blog listing
│   ├── BlogPost.tsx      # Blog article with buy widgets
│   ├── About.tsx         # About page
│   ├── Contact.tsx       # Contact form + info
│   ├── FAQ.tsx           # FAQ with search & categories
│   ├── Login.tsx         # User login page
│   ├── Register.tsx      # User registration page
│   ├── Account.tsx       # User account (orders, profile, wishlist)
│   ├── Privacy.tsx       # Privacy policy
│   ├── Terms.tsx         # Terms & conditions
│   ├── Refund.tsx        # Refund policy
│   ├── Shipping.tsx      # Shipping policy
│   ├── NotFound.tsx      # 404 page
│   └── admin/
│       ├── Dashboard.tsx      # Admin dashboard with KPIs
│       ├── AdminProducts.tsx  # Product CRUD
│       ├── AdminOrders.tsx    # Order management
│       ├── AdminPayments.tsx  # Payment tracking
│       ├── AdminCustomers.tsx # Customer database
│       ├── AdminCategories.tsx# Category management
│       ├── AdminSocial.tsx    # Social media automation (4 tabs)
│       ├── AdminBlog.tsx      # Blog content management
│       ├── AdminMedia.tsx     # Media library
│       ├── AdminWhatsApp.tsx  # WhatsApp business (full chat UI)
│       ├── AdminCMS.tsx       # CMS content management (5 tabs)
│       ├── AdminContacts.tsx  # Contact query management
│       ├── AdminUsers.tsx     # User & role management
│       ├── AdminReports.tsx   # Reports & analytics (4 tabs)
│       └── AdminSettings.tsx  # Store settings (7 tabs)
├── store/
│   └── cmsStore.ts      # Zustand CMS state (banners, benefits, testimonials, FAQs, settings)
├── App.tsx              # Route configuration (30+ routes)
├── main.tsx             # React entry point
└── index.css            # Global styles & design tokens
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun runtime
- npm, yarn, pnpm, or bun package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd apsoncure-phc

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

### Run Tests

```bash
npm test
# or watch mode
npm run test:watch
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | `admin@apsoncure.com` | `admin123` | Full admin panel + public pages |
| **Customer** | `priya@email.com` | `user123` | Account page + public pages |

> Login page has quick-fill buttons for both credentials. Admin login unlocks the full admin panel from the user dropdown menu.

---

## 🔌 API Integrations (Ready for Connection)

| Service | Purpose | Status | Configuration |
|---------|---------|--------|---------------|
| **Lovable Cloud** | Database, Auth, Storage, Edge Functions | ✅ Connected | Auto-configured |
| **Meta Graph API** | Instagram/Facebook auto-posting | 🟡 UI Ready | Settings → API Keys |
| **Razorpay** | Payment gateway (UPI, Card, Net Banking) | 🟡 UI Ready | Settings → API Keys |
| **WhatsApp Web.js** | WhatsApp Business messaging | 🟡 UI Ready | Requires Node.js backend |
| **Google Analytics** | Traffic & conversion tracking | 🟡 UI Ready | Settings → API Keys |
| **Google Search Console** | SEO monitoring | 🟡 UI Ready | Settings → SEO tab |

---

## 📊 Live Data Modules

### Currently Using Mock Data (localStorage)
These modules work with demo data and are ready for database migration:

| Module | Current Storage | Migration Target |
|--------|----------------|-----------------|
| Products | `src/data/mockData.ts` | `products` table |
| Orders | `src/data/mockData.ts` | `orders` table |
| Customers | `src/data/mockData.ts` | `customers` table |
| Blog Posts | `src/data/mockData.ts` | `blog_posts` table |
| Categories | `src/data/mockData.ts` | `categories` table |
| Auth/Users | `AuthContext` (localStorage) | Lovable Cloud Auth + `profiles` table |
| CMS Content | `cmsStore.ts` (Zustand) | `cms_content` table |
| Contact Queries | `AdminContacts.tsx` (state) | `contact_queries` table |
| Social Posts | `AdminSocial.tsx` (state) | `social_posts` table |
| WhatsApp | `AdminWhatsApp.tsx` (state) | `whatsapp_messages` table |

### Steps to Make Fully Dynamic:
1. **Create database tables** via Lovable Cloud migrations
2. **Add RLS policies** for secure data access
3. **Replace mock data** with Supabase client queries
4. **Add Edge Functions** for server-side logic (payments, emails, social posting)
5. **Configure secrets** for API keys (Razorpay, Meta, WhatsApp)

---

## 🏗 Recommended Database Schema

```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_hi TEXT,
  price DECIMAL NOT NULL,
  original_price DECIMAL,
  image TEXT,
  category TEXT,
  rating DECIMAL DEFAULT 0,
  reviews INT DEFAULT 0,
  description TEXT,
  ingredients TEXT[],
  benefits TEXT[],
  usage TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock INT DEFAULT 0,
  sku TEXT UNIQUE,
  slug TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  customer_id UUID REFERENCES auth.users(id),
  items JSONB NOT NULL,
  total DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  razorpay_id TEXT,
  address TEXT,
  tracking_id TEXT,
  courier_partner TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contact queries table
CREATE TABLE contact_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'medium',
  starred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User roles (separate table — CRITICAL for security)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  UNIQUE(user_id, role)
);
```

---

## 🌍 Deployment

### Lovable (Recommended)
1. Click **Share → Publish** in Lovable editor
2. Get instant deployment URL
3. Connect custom domain in project settings

### Manual Deployment
```bash
npm run build
# Deploy the dist/ folder to any static host:
# Vercel, Netlify, Cloudflare Pages, AWS S3, Firebase Hosting
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software developed by **MLHK Infotech** for **Apsoncure PHC – Prachi Homeo Clinic**.

---

## 📞 Support & Contact

| | |
|---|---|
| **Developer** | [MLHK Infotech](https://mlhk.in) – Hariom Vishwkarma |
| **Website** | [apsoncure.com](https://apsoncure.com) |
| **WhatsApp** | +91 98765 43210 |
| **Email** | hello@apsoncure.com |

---

> Built with ❤️ by [MLHK Infotech](https://mlhk.in) using React, TypeScript, Tailwind CSS & Lovable

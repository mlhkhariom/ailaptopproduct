# 🌿 Apsoncure PHC – Enterprise Ayurvedic E-Commerce Platform

> **Prachi Homeo Clinic** – A fully dynamic, enterprise-grade Ayurvedic e-commerce platform with 35+ routes, 17 admin modules, persistent state management, WhatsApp automation, social media tools, CMS, analytics, and complete role-based access control.

**Developed by:** [MLHK Infotech](https://mlhk.in) (Hariom Vishwkarma)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Features Overview](#-features-overview)
- [Public Pages (20 Routes)](#-public-pages-20-routes)
- [Admin Panel (17 Modules)](#-admin-panel-17-modules)
- [State Management](#-state-management)
- [Authentication & RBAC](#-authentication--rbac)
- [WhatsApp Business Module](#-whatsapp-business-module)
- [Product Management System](#-product-management-system)
- [Order & Payment System](#-order--payment-system)
- [Social Media Automation](#-social-media-automation)
- [CMS System](#-cms-system)
- [Coupon & Discount Engine](#-coupon--discount-engine)
- [Notification Center](#-notification-center)
- [Wishlist System](#-wishlist-system)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Demo Credentials](#-demo-credentials)
- [API Integration Guide](#-api-integration-guide)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License & Credits](#-license--credits)

---

## 🎯 Overview

Apsoncure PHC is a production-ready e-commerce solution designed for Ayurvedic and wellness businesses in India. Built entirely with React and Zustand, it features **persistent local storage** acting as a client-side database — every change made in admin reflects instantly on public pages and survives page refreshes.

### Key Highlights
- 🛒 **20 public pages** — Full storefront with products, cart, checkout, blog, legal pages
- 🔐 **Role-based access** — Admin, Manager, Editor, Customer roles with route protection
- 📊 **17 admin modules** — Complete business management suite
- 💬 **WhatsApp Automation** — Auto-reply bot with keyword matching, product lookup, message simulator, analytics dashboard
- 📱 **Social Media Tools** — Cross-platform reel publishing with content calendar
- 📝 **Live CMS** — Manage homepage content, FAQs, testimonials without code
- 🎟️ **Coupon Engine** — Percentage/flat discounts with usage limits and expiry
- 💾 **Persistent State** — All data stored in localStorage via Zustand persist middleware
- 📱 **Fully Responsive** — Mobile-first design across all pages and admin modules

### Brand Details
| | |
|---|---|
| **Brand Name** | Apsoncure PHC |
| **Clinic** | Prachi Homeo Clinic |
| **Founder** | Dr. Prachi |
| **Industry** | Ayurvedic & Homeopathic Healthcare Products |
| **Target Market** | Indian consumers seeking authentic Ayurvedic solutions |

---

## 🛠 Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React 18 + TypeScript 5 | UI rendering & type safety |
| **Build Tool** | Vite 5 | Fast dev server & bundling |
| **Styling** | Tailwind CSS 3 + shadcn/ui | Utility-first CSS + component library |
| **State Management** | Zustand 5 (with persist) | Persistent client-side state |
| **Auth** | React Context + localStorage | Authentication & role management |
| **Routing** | React Router DOM 6 | Client-side routing with guards |
| **Data Fetching** | TanStack React Query 5 | Server state management (ready) |
| **Charts** | Recharts 2 | Admin analytics visualizations |
| **Forms** | React Hook Form + Zod | Form validation |
| **Icons** | Lucide React | 200+ SVG icons |
| **Notifications** | Sonner | Toast notifications |
| **Testing** | Vitest + Testing Library | Unit & component testing |
| **Backend (Ready)** | Lovable Cloud | Database, Auth, Storage, Edge Functions |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    APSONCURE PHC PLATFORM                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  PUBLIC UI   │  │  ADMIN PANEL │  │  AUTH SYSTEM       │  │
│  │  20 pages    │  │  17 modules  │  │  RBAC + Guards     │  │
│  │  Responsive  │  │  Full CRUD   │  │  ProtectedRoute    │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬──────────┘  │
│         │                │                    │              │
│  ┌──────▼────────────────▼────────────────────▼──────────┐  │
│  │              ZUSTAND STATE LAYER (Persistent)         │  │
│  │  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌───────────┐  │  │
│  │  │productStr│ │cartStr │ │whatsappSt│ │ cmsStore  │  │  │
│  │  │ CRUD     │ │ Items  │ │ Rules    │ │ Banners   │  │  │
│  │  │ Stock    │ │ Coupons│ │ Simulate │ │ FAQ       │  │  │
│  │  │ Filters  │ │ Total  │ │ Bot      │ │ Settings  │  │  │
│  │  └──────────┘ └────────┘ └──────────┘ └───────────┘  │  │
│  │  ┌──────────┐ ┌──────────────┐ ┌───────────────────┐  │  │
│  │  │wishlistSt│ │notificationSt│ │  AuthContext       │  │  │
│  │  │ Favorites│ │ Orders/Stock │ │  Login/Register    │  │  │
│  │  │ Toggle   │ │ Alerts/Read  │ │  Roles/Sessions    │  │  │
│  │  └──────────┘ └──────────────┘ └───────────────────┘  │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │              localStorage (Browser)                    │  │
│  │  Persists: products, cart, wishlist, CMS, WhatsApp,   │  │
│  │  notifications, auth sessions                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           LOVABLE CLOUD (Ready for Migration)          │  │
│  │  Database │ Auth │ Storage │ Edge Functions │ Realtime │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Admin Action (Add/Edit/Delete Product)
    │
    ▼
Zustand Store (productStore.ts)
    │
    ├──► localStorage (automatic via persist middleware)
    │
    ├──► Public Products Page (instant reactivity)
    ├──► Product Detail Page
    ├──► Home Page (featured products)
    ├──► Cart/Checkout (price updates)
    └──► WhatsApp Bot (product lookup replies)
```

---

## ✨ Features Overview

| Feature | Status | Storage | Description |
|---------|--------|---------|-------------|
| Product CRUD | ✅ Working | productStore (localStorage) | Add/Edit/Delete/Duplicate products from admin |
| Cart System | ✅ Working | cartStore (localStorage) | Add to cart, quantity, coupons, checkout |
| Wishlist | ✅ Working | wishlistStore (localStorage) | Heart icon on products, wishlist page |
| CMS | ✅ Working | cmsStore (localStorage) | Manage homepage banners, FAQs, testimonials |
| WhatsApp Bot | ✅ Working | whatsappStore (localStorage) | Auto-reply rules, simulator, product lookup |
| Auth & Roles | ✅ Working | AuthContext (localStorage) | Login, Register, Admin/Customer roles |
| Coupons | ✅ Working | cartStore (localStorage) | AYUR10 (10% off), FLAT100 (₹100 off) |
| Notifications | ✅ Working | notificationStore (localStorage) | Admin alerts for orders, stock, contacts |
| Order Tracking | ✅ UI Ready | mockData | Track order status by order ID |
| Payments | ✅ UI Ready | mockData | Razorpay integration ready |
| Social Media | ✅ UI Ready | Component state | Content calendar, reel publishing |
| Reports | ✅ UI Ready | mockData | Charts, KPIs, export options |

---

## 🌐 Public Pages (20 Routes)

| # | Page | Route | Key Features |
|---|------|-------|-------------|
| 1 | **Homepage** | `/` | CMS-driven hero banners, featured products from productStore, benefits, testimonials, newsletter |
| 2 | **Products** | `/products` | Grid/list toggle, category checkboxes, price range slider, in-stock filter, sorting, search — reads from productStore |
| 3 | **Product Detail** | `/products/:id` | Image gallery with thumbnails, zoom on hover, ingredients/benefits/usage tabs, reviews section, sticky mobile bar, related products, reel carousel |
| 4 | **Cart** | `/cart` | Dynamic items from cartStore, quantity +/-, remove items, subtotal, coupon code field, "You may also like" |
| 5 | **Checkout** | `/checkout` | Connected to cartStore, address form, payment method selection, coupon application, order summary |
| 6 | **Blog** | `/blog` | Blog listing with categories, featured posts, reading time |
| 7 | **Blog Post** | `/blog/:id` | Full article with buy widgets, author card, share buttons, related articles |
| 8 | **About** | `/about` | Company story, team section, mission & values, certifications |
| 9 | **Contact** | `/contact` | Contact form (name, email, phone, message), store info, WhatsApp direct link, map placeholder |
| 10 | **FAQ** | `/faq` | Searchable accordion FAQ, category filters, CMS-managed content |
| 11 | **Track Order** | `/track-order` | Enter order ID → see status timeline (Placed → Processing → Shipped → Delivered) |
| 12 | **Login** | `/login` | Email + password, demo credential quick-fill buttons, forgot password link |
| 13 | **Register** | `/register` | Full registration form with validation, auto-redirect after signup |
| 14 | **My Account** | `/account` | Profile editing, order history, wishlist items, password change (protected route) |
| 15 | **Privacy Policy** | `/privacy` | GDPR-compliant privacy policy with table of contents |
| 16 | **Terms** | `/terms` | Terms of service |
| 17 | **Refund Policy** | `/refund` | Return & refund information |
| 18 | **Shipping** | `/shipping` | Delivery timelines, charges, courier details |
| 19 | **404 Page** | `*` | Custom not-found page with navigation links |
| 20 | **All routes** | — | Responsive header with auth-aware user menu, cart badge, wishlist, footer with developer credit |

---

## 🛡 Admin Panel (17 Modules)

All admin routes are protected by `AdminRoute` component — requires authentication + admin role.

| # | Module | Route | Features | Data Source |
|---|--------|-------|----------|-------------|
| 1 | **Dashboard** | `/admin` | Revenue/Orders/Customers/Conversion KPIs, recent orders, top products, growth indicators | mockData |
| 2 | **Products** | `/admin/products` | ✅ **Full CRUD**: Add/Edit/Delete/Duplicate, stock management, image URL preview, bulk delete, bulk stock update, search, category filter | productStore |
| 3 | **Orders** | `/admin/orders` | Order list with status badges, date range filter, payment status filter, order detail modal, status update, tracking ID, invoice generation | mockData |
| 4 | **Payments** | `/admin/payments` | Transaction list, payment method breakdown, refund management, daily settlement summary, Razorpay integration ready | mockData |
| 5 | **Customers** | `/admin/customers` | Customer database, LTV tracking, order count, segmentation, search | mockData |
| 6 | **Categories** | `/admin/categories` | Category CRUD with Hindi/English names, product count, SEO fields | mockData |
| 7 | **Social Media** | `/admin/social` | 4 tabs: Publish (cross-platform reel upload), Calendar (monthly view), History (engagement metrics), Settings (API config) | Component state |
| 8 | **Blog** | `/admin/blog` | Blog post CRUD, rich text editing, buy widget insertion, SEO fields, publish/draft toggle | mockData |
| 9 | **Media Library** | `/admin/media` | Centralized image/video management, upload, organize, search | Component state |
| 10 | **WhatsApp** | `/admin/whatsapp` | ✅ **3 tabs**: Chats (WhatsApp Web UI), Automation (rule builder + simulator), Analytics (stats dashboard) — fully responsive | whatsappStore |
| 11 | **CMS** | `/admin/cms` | ✅ **5 tabs**: Banners, Benefits, Testimonials, FAQs, Settings — changes reflect instantly on homepage | cmsStore |
| 12 | **Contact Queries** | `/admin/contacts` | Customer inquiry management, status pipeline (New → Read → Replied → Resolved), priority levels, reply, WhatsApp quick reply, star/favorite | mockData |
| 13 | **Users & Roles** | `/admin/users` | User management, role assignment (Admin/Manager/Editor/Customer), activate/deactivate, permissions matrix | mockData |
| 14 | **Coupons** | `/admin/coupons` | ✅ Coupon CRUD: code, type (percentage/flat), value, expiry, usage limits, active/inactive toggle | cartStore |
| 15 | **Reports** | `/admin/reports` | 4 tabs: Sales (AreaChart), Products (performance), Customers (insights), Traffic (sources). PDF/CSV export buttons | mockData |
| 16 | **Settings** | `/admin/settings` | 7 tabs: General, API Keys, Shipping, Payments, SEO, Notifications, Security. Full configuration UI | Component state |
| 17 | **Sidebar** | — | 3 sections: Main (Dashboard, Products, Orders, Payments), Tools (Social, Blog, Media, WhatsApp, CMS, Contacts), System (Users, Coupons, Reports, Settings) | — |

---

## 💾 State Management

### Zustand Stores (Persistent via localStorage)

| Store | File | Keys | Purpose |
|-------|------|------|---------|
| **productStore** | `src/store/productStore.ts` | `apsoncure-products` | Product CRUD, categories, stock management. Admin edits → public pages update instantly |
| **cartStore** | `src/store/cartStore.ts` | `apsoncure-cart` | Cart items, quantities, coupon application, subtotal calculation |
| **wishlistStore** | `src/store/wishlistStore.ts` | `apsoncure-wishlist` | Product favorites, toggle add/remove |
| **cmsStore** | `src/store/cmsStore.ts` | `apsoncure-cms` | Hero banners, benefits, testimonials, FAQs, site settings |
| **whatsappStore** | `src/store/whatsappStore.ts` | `apsoncure-whatsapp` | Auto-reply rules, simulated messages, keyword matching, match counts |
| **notificationStore** | `src/store/notificationStore.ts` | `apsoncure-notifications` | Admin alerts (new orders, low stock, contacts), read/unread state |

### React Context

| Context | File | Purpose |
|---------|------|---------|
| **AuthContext** | `src/contexts/AuthContext.tsx` | Login, Register, Logout, Current user, isAdmin check, role management |

---

## 🔐 Authentication & RBAC

### How It Works
1. Users register with name, email, password → stored in localStorage
2. Login checks credentials → sets `currentUser` in AuthContext
3. `ProtectedRoute` wrapper checks if user is logged in → redirects to `/login`
4. `AdminRoute` wrapper checks if user has `isAdmin: true` → redirects to `/login` with error toast
5. Header shows dynamic menu: logged in → avatar dropdown (Account, Admin Panel if admin, Logout)

### Demo Accounts

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| Admin | `admin@apsoncure.com` | `admin123` | All public pages + full admin panel |
| Customer | `priya@email.com` | `user123` | Public pages + account page only |

### Route Protection

```typescript
// Protected route (requires login)
<Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

// Admin route (requires login + admin role)
<Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
```

---

## 💬 WhatsApp Business Module

### Three Tabs — Fully Responsive

#### 1. Chats Tab (WhatsApp Web Replica)
- **Contact sidebar**: 8 demo contacts with avatars, labels (VIP/Customer/New), online status, unread badges, typing indicators
- **Filters**: All / Unread / Pinned
- **Search**: By name or phone number
- **Chat window**: Message bubbles with delivery ticks (sent/delivered/read), timestamps, WhatsApp-style background pattern
- **Message input**: Send button (when typing) / Mic button (when empty), emoji button
- **Mobile**: Full-width contact list → tap to open chat → back arrow to return (native app feel)
- **Connection**: QR code dialog to simulate linking WhatsApp device

#### 2. Automation Tab
- **Auto-Reply Rules Engine**: 5 default rules covering greetings, price inquiries, order status, stock checks, thank you messages
- **Rule Builder**: Add/Edit/Delete rules with name, type (greeting/product/order/custom), keywords, response template
- **Smart Variables**: `{{product_name}}`, `{{price}}`, `{{original_price_info}}`, `{{slug}}`, `{{stock_status}}`, `{{stock_info}}`, `{{order_id}}`, `{{tracking_id}}`
- **Product Lookup**: When message contains a product name, bot fetches real data from productStore and fills variables
- **Message Simulator**: Type a test message → bot matches keywords → shows auto-reply with product data in chat-style UI
- **Quick Test Buttons**: Pre-filled messages (Hello, Ashwagandha price, Order status, Stock?, Thanks)

#### 3. Analytics Tab
- **KPI Cards**: Total Contacts, Active Rules, Bot Replies (total matches), Unread Messages
- **Rule Performance Chart**: Ranked bar chart showing which rules match most frequently
- **Contact Labels Breakdown**: VIP, Customer, New, Unlabeled counts with color-coded cards

### Auto-Reply Data Flow

```
Incoming Message: "Ashwagandha ka price kya hai?"
    │
    ▼
Keyword Matching: "price" matches rule "Price Inquiry"
    │
    ▼
Product Lookup: "Ashwagandha" found in productStore
    │
    ▼
Template Fill: "{{product_name}} की कीमत ₹{{price}} है..."
    │
    ▼
Response: "Ashwagandha की कीमत ₹499 है. (MRP: ₹699) 🌿
          ऑर्डर करने के लिए: apsoncure.com/products/ashwagandha"
```

---

## 🛒 Product Management System

### Admin CRUD Operations

| Operation | How It Works |
|-----------|-------------|
| **Add Product** | Form with 12+ fields → saves to productStore → appears on /products instantly |
| **Edit Product** | Pre-filled dialog → updates store → all pages reflect changes |
| **Delete Product** | Confirmation dialog → removes from store → disappears everywhere |
| **Duplicate** | Clones product with "(Copy)" suffix and new SKU |
| **Bulk Delete** | Select multiple → delete all selected |
| **Stock Update** | Change stock number → auto-toggles inStock boolean |
| **Bulk Stock** | Select multiple → mark all in-stock or out-of-stock |

### Product Fields

```typescript
interface Product {
  id: string;
  name: string;          // English name
  nameHi?: string;       // Hindi name (optional)
  price: number;         // Selling price
  originalPrice?: number; // MRP (for showing discount)
  image: string;         // Product image URL
  category: string;      // Category name
  rating: number;        // 0-5 stars
  reviews: number;       // Review count
  description: string;   // Full description
  ingredients: string[]; // List of ingredients
  benefits: string[];    // List of benefits
  usage: string;         // Usage instructions
  inStock: boolean;      // Availability
  stock: number;         // Stock quantity
  sku: string;           // Unique SKU code
  slug: string;          // URL-friendly slug
  badge?: string;        // "Best Seller", "New", etc.
  reels?: Reel[];        // Linked social reels
}
```

### Public Product Pages

- **Products listing** (`/products`): Grid/list view, category filter (checkboxes), price range slider (₹0-₹2000), in-stock toggle, sort by price/name/rating, search
- **Product detail** (`/products/:id`): Image gallery with thumbnails, hover zoom, ingredients/benefits/usage tabs, star ratings, reviews section, related products, sticky mobile add-to-cart bar

---

## 📦 Order & Payment System

### Order Status Flow
```
Placed → Processing → Shipped → Delivered
                         │
                    Tracking ID assigned
                    Courier partner set
```

### Payment Methods (UI Ready)
- UPI (Google Pay, PhonePe, Paytm)
- Credit/Debit Card
- Net Banking
- Cash on Delivery (COD)
- Wallet
- EMI

### Order Tracking (`/track-order`)
Customer enters Order ID → sees visual timeline with status, date, and description for each step.

---

## 📱 Social Media Automation

### Features (4 Tabs)
1. **Publish**: Upload video/reel → select platforms (Instagram, Facebook, YouTube) → auto-generate caption from product data → hashtag suggestions → publish
2. **Calendar**: Monthly content calendar → drag schedule → view planned posts
3. **History**: Published content with engagement metrics (views, likes, comments, shares) → retry failed posts
4. **Settings**: API configuration for Meta Graph API, YouTube Data API

### Product ↔ Reel Linking
When a reel is published and linked to a product, it appears in the Reels section on the product detail page.

---

## 📝 CMS System

### Managed Content (5 Tabs)
| Tab | Content | Live On |
|-----|---------|---------|
| **Banners** | Hero slides (title, subtitle, image, CTA) | Homepage hero section |
| **Benefits** | Benefit cards (icon, title, description) | Homepage benefits grid |
| **Testimonials** | Customer reviews (name, rating, text, avatar) | Homepage testimonials |
| **FAQs** | Question + answer pairs with categories | FAQ page + Homepage |
| **Settings** | Site name, tagline, contact info, social links | Header, Footer, Contact page |

### How It Works
Admin edits CMS content → Zustand store updates → Homepage re-renders instantly with new content. All changes persist in localStorage.

---

## 🎟️ Coupon & Discount Engine

### Built-in Coupons

| Code | Type | Value | Min Order |
|------|------|-------|-----------|
| `AYUR10` | Percentage | 10% off | ₹0 |
| `FLAT100` | Flat | ₹100 off | ₹500 |
| `WELCOME20` | Percentage | 20% off | ₹0 |

### Admin Coupon Management (`/admin/coupons`)
- Create new coupons with code, type, value, expiry date, usage limit
- Toggle active/inactive
- Track usage count
- Delete expired coupons

### Checkout Integration
Customer enters coupon code at checkout → validates against cartStore → applies discount → shows savings in order summary.

---

## 🔔 Notification Center

### Admin Notifications (Bell icon in admin header)
- **New Order**: When a new order is placed
- **Low Stock**: When product stock falls below threshold
- **New Contact**: When customer submits contact form
- **Payment Alert**: Payment failures

### Features
- Unread badge count on bell icon
- Mark individual as read
- Mark all as read
- Click notification to navigate to relevant module

---

## ❤️ Wishlist System

### How It Works
1. Heart icon on every product card (Products page, Home page)
2. Click to toggle → saves to wishlistStore (persistent)
3. View all wishlisted items on Account page → Wishlist tab
4. "Move to Cart" button on each wishlist item
5. Wishlist count badge in header

---

## 📁 Project Structure

```
src/
├── components/                # Reusable UI components
│   ├── ui/                    # 50+ shadcn/ui primitives
│   ├── AdminLayout.tsx        # Admin wrapper with sidebar
│   ├── AdminSidebar.tsx       # Admin navigation (3 sections, 17 links)
│   ├── CustomerLayout.tsx     # Public wrapper (header + footer)
│   ├── Header.tsx             # Auth-aware header with cart/wishlist/user menu
│   ├── Footer.tsx             # Footer with dev credit (MLHK Infotech)
│   ├── ProductCard.tsx        # Product card with wishlist heart, add-to-cart
│   ├── ProtectedRoute.tsx     # Auth guard + Admin guard components
│   ├── NavLink.tsx            # Active route-aware nav link
│   └── StatCard.tsx           # Dashboard KPI card
│
├── contexts/
│   └── AuthContext.tsx        # Auth provider (login, register, logout, roles)
│
├── data/
│   └── mockData.ts            # TypeScript interfaces + demo data (Products, Orders, Customers, Blog, Categories, Templates)
│
├── hooks/
│   ├── use-mobile.tsx         # Responsive breakpoint hook (isMobile)
│   └── use-toast.ts           # Toast notification hook
│
├── integrations/
│   └── supabase/              # Lovable Cloud client & types (auto-generated)
│
├── lib/
│   └── utils.ts               # cn() Tailwind merge utility
│
├── store/                     # Zustand persistent stores
│   ├── productStore.ts        # Product CRUD + categories
│   ├── cartStore.ts           # Cart items + coupons
│   ├── wishlistStore.ts       # Product favorites
│   ├── cmsStore.ts            # Homepage CMS content
│   ├── whatsappStore.ts       # Auto-reply rules + simulator
│   └── notificationStore.ts   # Admin alerts
│
├── pages/                     # Route pages
│   ├── Index.tsx              # Homepage (CMS-driven)
│   ├── Products.tsx           # Product listing (productStore)
│   ├── ProductDetail.tsx      # Product detail (productStore)
│   ├── Cart.tsx               # Shopping cart (cartStore)
│   ├── Checkout.tsx           # Checkout (cartStore + coupons)
│   ├── Blog.tsx               # Blog listing
│   ├── BlogPost.tsx           # Blog article
│   ├── About.tsx              # About page
│   ├── Contact.tsx            # Contact form
│   ├── FAQ.tsx                # Searchable FAQ (cmsStore)
│   ├── TrackOrder.tsx         # Order tracking by ID
│   ├── Login.tsx              # Login page
│   ├── Register.tsx           # Registration page
│   ├── Account.tsx            # User account (orders, wishlist, profile)
│   ├── Privacy.tsx            # Privacy policy
│   ├── Terms.tsx              # Terms & conditions
│   ├── Refund.tsx             # Refund policy
│   ├── Shipping.tsx           # Shipping policy
│   ├── NotFound.tsx           # 404 page
│   └── admin/                 # Admin modules (17 files)
│       ├── Dashboard.tsx
│       ├── AdminProducts.tsx  # ✅ Full CRUD (productStore)
│       ├── AdminOrders.tsx
│       ├── AdminPayments.tsx
│       ├── AdminCustomers.tsx
│       ├── AdminCategories.tsx
│       ├── AdminSocial.tsx    # 4 tabs
│       ├── AdminBlog.tsx
│       ├── AdminMedia.tsx
│       ├── AdminWhatsApp.tsx  # ✅ 3 tabs: Chats, Automation, Analytics
│       ├── AdminCMS.tsx       # ✅ 5 tabs (cmsStore)
│       ├── AdminContacts.tsx
│       ├── AdminUsers.tsx
│       ├── AdminCoupons.tsx   # ✅ Coupon CRUD
│       ├── AdminReports.tsx   # 4 tabs with charts
│       └── AdminSettings.tsx  # 7 tabs
│
├── App.tsx                    # 35+ route definitions
├── main.tsx                   # React entry point
└── index.css                  # Design tokens & global styles
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

App available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

### Run Tests

```bash
npm test
npx vitest --watch  # watch mode
```

---

## 🔑 Demo Credentials

| Role | Email | Password | What You Can Access |
|------|-------|----------|---------------------|
| **Admin** | `admin@apsoncure.com` | `admin123` | Full admin panel (17 modules) + all public pages |
| **Customer** | `priya@email.com` | `user123` | Account page + all public pages (no admin) |

> 💡 Login page has quick-fill buttons for both credentials.

### Testing Checklist
1. Login as admin → Go to Admin Products → Add a product → Check `/products` page
2. Admin WhatsApp → Automation tab → Simulate "Ashwagandha price" → See auto-reply
3. Admin CMS → Edit hero banner → Check homepage
4. Add products to cart → Apply coupon `AYUR10` → Checkout
5. Track order at `/track-order` with order ID `APC-001`

---

## 🔌 API Integration Guide

### Ready for Connection

| Service | Purpose | Status | How to Connect |
|---------|---------|--------|----------------|
| **Lovable Cloud** | Database, Auth, Storage | ✅ Connected | Auto-configured (Supabase) |
| **Razorpay** | Payment gateway | 🟡 UI Ready | Add API key in Admin → Settings → API Keys |
| **Meta Graph API** | Instagram/Facebook posting | 🟡 UI Ready | Add App ID + Secret in Settings → API Keys |
| **WhatsApp Business** | Real messaging | 🟡 UI Ready | Requires Node.js backend with whatsapp-web.js |
| **Google Analytics** | Traffic tracking | 🟡 UI Ready | Add GA4 Measurement ID in Settings |
| **Google Search Console** | SEO monitoring | 🟡 UI Ready | Verify domain in Settings → SEO |

### Migration Steps (Mock → Database)

```
1. Create database tables via Lovable Cloud migrations
2. Add RLS policies for secure access
3. Replace Zustand stores with Supabase queries
4. Add Edge Functions for payments, emails, social posting
5. Configure API secrets
```

---

## 🏗 Database Schema

### Recommended Tables for Cloud Migration

```sql
-- Products
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

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id),
  items JSONB NOT NULL,
  total DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  razorpay_id TEXT,
  address JSONB,
  tracking_id TEXT,
  courier_partner TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contact Queries
CREATE TABLE contact_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'medium',
  reply TEXT,
  replied_at TIMESTAMPTZ,
  starred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Blog Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  content TEXT,
  excerpt TEXT,
  image TEXT,
  category TEXT,
  author TEXT,
  status TEXT DEFAULT 'draft',
  tags TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Coupons
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'percentage' or 'flat'
  value DECIMAL NOT NULL,
  min_order DECIMAL DEFAULT 0,
  max_uses INT,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- WhatsApp Auto-Reply Rules
CREATE TABLE whatsapp_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  response_template TEXT NOT NULL,
  type TEXT DEFAULT 'custom',
  is_active BOOLEAN DEFAULT true,
  match_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Roles (CRITICAL: separate table for security)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  UNIQUE(user_id, role)
);

-- CMS Content
CREATE TABLE cms_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL, -- 'banner', 'benefit', 'testimonial', 'faq', 'setting'
  content JSONB NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles (public user info)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  address JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
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
# Deploy dist/ folder to:
# Vercel, Netlify, Cloudflare Pages, AWS S3, Firebase Hosting
```

### Environment Variables
```env
VITE_SUPABASE_URL=<auto-configured>
VITE_SUPABASE_PUBLISHABLE_KEY=<auto-configured>
VITE_SUPABASE_PROJECT_ID=<auto-configured>
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License & Credits

This project is proprietary software developed by **MLHK Infotech** for **Apsoncure PHC – Prachi Homeo Clinic**.

| | |
|---|---|
| **Developer** | [MLHK Infotech](https://mlhk.in) – Hariom Vishwkarma |
| **Website** | [apsoncure.com](https://apsoncure.com) |
| **WhatsApp** | +91 98765 43210 |
| **Email** | hello@apsoncure.com |
| **Tech Stack** | React 18, TypeScript 5, Vite 5, Tailwind CSS, Zustand, shadcn/ui |
| **Total Routes** | 35+ |
| **Admin Modules** | 17 |
| **Zustand Stores** | 6 (persistent) |
| **Components** | 50+ UI + 30+ custom |

---

> Built with ❤️ by [MLHK Infotech](https://mlhk.in) using React, TypeScript, Tailwind CSS & Lovable

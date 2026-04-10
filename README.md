# Apsoncure PHC – Ayurvedic E-commerce & Social Media Management System

> A comprehensive, enterprise-grade e-commerce platform for **Prachi Homeo Clinic** brand **Apsoncure**, built with React, TypeScript, and Tailwind CSS.

---

## 🌿 Project Overview

Apsoncure PHC is an all-in-one platform for managing an Ayurvedic products business — from product listing and order management to social media automation and WhatsApp customer engagement.

### Brand Details
- **Brand Name:** Apsoncure PHC
- **Clinic:** Prachi Homeo Clinic
- **Founder:** Dr. Prachi
- **Industry:** Ayurvedic & Homeopathic Healthcare Products
- **Target Market:** Indian consumers seeking authentic Ayurvedic solutions

---

## 📦 Features

### Customer-Facing (Public Pages)
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero section, bestsellers, video reels, testimonials, WhatsApp CTA |
| Products | `/products` | Category filter, sort by price/rating, product cards with reel indicators |
| Product Detail | `/products/:id` | Image gallery, embedded reels/videos, ingredients, benefits, usage, related products |
| Blog | `/blog` | Ayurvedic articles with SEO |
| Blog Post | `/blog/:id` | Full article with linked product widgets |
| Cart | `/cart` | Shopping cart with quantity controls |
| Checkout | `/checkout` | Shipping + payment form |
| About | `/about` | Company story, values, team |
| Contact | `/contact` | Contact form, WhatsApp, phone, email |
| Privacy Policy | `/privacy` | GDPR-compliant privacy policy |
| Terms & Conditions | `/terms` | Legal terms |
| Refund & Returns | `/refund` | Return/refund policy |
| Shipping Policy | `/shipping` | Delivery timelines, COD info |

### Admin Panel (Dashboard)
| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/admin` | Revenue analytics (Recharts), order stats, low stock alerts, activity feed |
| Products | `/admin/products` | CRUD with Ayurvedic fields (ingredients, benefits, usage), SEO, media, reel linking |
| Orders | `/admin/orders` | Status filters (Pending/Processing/Shipped/Delivered), search, bulk actions, tracking |
| Payments | `/admin/payments` | Transaction tracking — Razorpay, UPI, COD, refund status |
| Customers | `/admin/customers` | Customer database with LTV, order history, city |
| Categories | `/admin/categories` | Category management with SEO metadata |
| Social Automation | `/admin/social` | Upload reels → cross-post to Instagram/Facebook/YouTube, scheduling, analytics |
| Blog / Content | `/admin/blog` | Rich text editor, SEO settings, product widget linking |
| Media Library | `/admin/media` | Image/video management with type filters |
| WhatsApp | `/admin/whatsapp` | Message templates, chat history, auto-reply, QR code connection (whatsapp-web.js ready) |
| Settings | `/admin/settings` | API keys (Meta, Razorpay), shipping rules, tax settings |

---

## 🔧 Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| TypeScript 5 | Type safety |
| Vite 5 | Build tool |
| Tailwind CSS 3 | Styling |
| shadcn/ui | Component library |
| Recharts | Dashboard analytics charts |
| React Router 6 | Client-side routing |
| React Query | Data fetching & caching |
| Lucide React | Icons |

---

## 🔌 Modules Ready for Live Data (Backend Integration)

To make this application production-ready with real data, connect **Lovable Cloud** (Supabase-powered backend):

| Module | What It Needs |
|--------|--------------|
| **Authentication** | User login/signup, admin roles (RLS) |
| **Products** | `products` table with all fields (name, price, stock, ingredients, reels, SEO) |
| **Orders** | `orders` table with items, status tracking, payment info |
| **Payments** | Razorpay integration via Edge Functions |
| **Customers** | `customers` table with order history, LTV calculation |
| **Categories** | `categories` table with SEO metadata |
| **Blog** | `blog_posts` table with content, SEO, linked products |
| **Social Posts** | `social_posts` table with platform, status, analytics |
| **WhatsApp** | `whatsapp_templates` table + whatsapp-web.js Node.js service |
| **Media** | Supabase Storage for images/videos |
| **Settings** | Supabase Secrets for API keys (Meta Graph API, Razorpay) |

### Payment Integration (Razorpay)
- Create Edge Function for order creation & payment verification
- Store `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` as secrets
- Webhook for payment status updates

### Social Media Automation (Meta Graph API)
- Create Edge Function for posting to Instagram/Facebook
- Store `META_APP_ID` and `META_APP_SECRET` as secrets
- YouTube Data API v3 for YouTube uploads

### WhatsApp Integration
- whatsapp-web.js requires a Node.js server (cannot run in browser)
- Use Supabase Edge Functions or external service for WhatsApp Business API
- QR code authentication flow

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # shadcn/ui components
│   ├── Header.tsx     # Customer site header
│   ├── Footer.tsx     # Customer site footer
│   ├── ProductCard.tsx # Product display card
│   ├── AdminLayout.tsx # Admin panel wrapper
│   └── AdminSidebar.tsx # Admin navigation
├── pages/              # Route pages
│   ├── Index.tsx      # Homepage
│   ├── Products.tsx   # Product listing
│   ├── ProductDetail.tsx # Product detail + reels
│   ├── About.tsx      # About page
│   ├── Contact.tsx    # Contact page
│   ├── Privacy.tsx    # Privacy policy
│   ├── Terms.tsx      # Terms & conditions
│   ├── Refund.tsx     # Refund policy
│   ├── Shipping.tsx   # Shipping policy
│   └── admin/         # Admin panel pages
├── data/
│   └── mockData.ts    # All mock data & TypeScript interfaces
└── hooks/             # Custom React hooks
```

---

## 📄 License

© 2024 Apsoncure PHC – Prachi Homeo Clinic. All rights reserved.

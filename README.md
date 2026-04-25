# AI Laptop Wala — Full Stack Platform

## Tech Stack
- **Frontend:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + PostgreSQL
- **WhatsApp:** whatsapp-web.js + Evolution API
- **AI Agent:** OpenRouter / Gemini API
- **Deployment:** PM2 + Nginx + Cloudflare

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Google Chrome (for WhatsApp Web.js)

### Setup

```bash
# Clone
git clone https://github.com/mlhkhariom/ailaptopproduct.git
cd ailaptopproduct

# Frontend dependencies
npm install

# Backend dependencies
cd backend && npm install

# Environment
cp .env.example .env
# Edit .env with your values

# Run backend
cd backend && node src/index.js

# Run frontend (dev)
cd .. && npm run dev
```

### Environment Variables

```env
# Backend (.env in /backend)
DATABASE_URL=postgresql://user:pass@localhost:5432/ailaptopwala_db
JWT_SECRET=your_jwt_secret
PORT=5000

# Frontend (.env in root)
VITE_API_URL=http://localhost:5000/api
VITE_EVOLUTION_URL=http://localhost:8081
VITE_EVOLUTION_KEY=your_evolution_key
```

## Production Deployment

```bash
# Build frontend
npm run build

# Start with PM2
pm2 start ecosystem.config.cjs

# Nginx config
sudo cp nginx.conf /etc/nginx/sites-available/ailaptopwala
sudo ln -s /etc/nginx/sites-available/ailaptopwala /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Admin Credentials
- Super Admin: `admin@mlhk.in` / `HarioM9165`
- Admin: `admin@ailaptopwala.com` / `Laptop@9165`

## Features
- E-commerce (products, orders, coupons, reviews)
- WhatsApp AI Agent (auto-reply, product search, booking)
- Evolution API WhatsApp module
- Admin panel (20+ modules)
- SEO optimized (Schema.org, sitemap, robots.txt)
- Blog, FAQ, Services, Contact
- Payment integration (Razorpay)
- Media upload
- Social media posting

## Database
See `backend/src/db/database.js` for all table schemas.
Run `node backend/db_schema.js` to view all tables and columns.

## API Routes
- `GET /api/products` — Products list
- `POST /api/auth/login` — Login
- `GET /api/orders` — Orders (admin)
- `GET /api/whatsapp/status` — WhatsApp status
- `GET /sitemap.xml` — Dynamic sitemap
- `GET /robots.txt` — Robots.txt
- `GET /llms.txt` — AI context file

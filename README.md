# 💻 AI Laptop Wala — Enterprise Laptop E-Commerce Platform

> **AI Laptop Wala** — Buy, Sell & Repair Laptops in Indore. A full-stack enterprise e-commerce platform with AI-powered WhatsApp agent, real-time chat, admin panel, and complete business management suite.

**Developed by:** [MLHK Infotech](https://mlhk.in) (Hariom Vishwkarma)

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Backend** | Node.js + Express |
| **Database** | SQLite (better-sqlite3) |
| **WhatsApp** | whatsapp-web.js + Socket.IO |
| **AI Agent** | OpenRouter / Google Gemini |
| **State** | Zustand + React Context |
| **Charts** | Recharts |

---

## ✨ Key Features

### 🛒 E-Commerce
- Product catalog — Laptops, MacBooks, Gaming, Accessories, Repair Services
- Cart, Checkout, Order tracking
- Coupon & discount engine
- Razorpay + Paytm + COD payments
- Invoice generation

### 🤖 AI WhatsApp Agent
- OpenRouter (GPT-4, Claude, Llama) or Google Gemini
- Last 20 messages memory
- Product DB search — auto answers price/stock queries
- Order status lookup
- Human handoff detection
- Per-contact ON/OFF toggle
- Custom bubble color
- Typing indicator + random delay

### 📱 WhatsApp Module
- Real-time chat (Socket.IO)
- Auto-reply rules engine
- Message reactions, star, delete, forward
- Contact info panel
- Chat clear feature

### 🏪 Admin Panel (16 Modules)
- Dashboard with real-time KPIs
- Products CRUD
- Orders management + tracking
- Customers + Users & Roles
- Blog management
- Social Media (Instagram/Facebook publish)
- Media Library
- CMS (Banners, FAQs, Testimonials)
- Coupons management
- Contact queries pipeline
- Reports & Analytics
- Settings (8 tabs)

### ⚙️ Settings
- Site features toggle (Maintenance mode, Cookie consent, etc.)
- Razorpay + Paytm API keys
- Meta Graph API (Instagram/Facebook)
- Google Analytics + GTM
- Shipping rates
- SEO settings

---

## 🏗 Project Structure

```
├── src/                    # React Frontend
│   ├── pages/              # 20+ public pages
│   ├── pages/admin/        # 16 admin modules
│   ├── components/         # Reusable components
│   ├── contexts/           # Auth, SiteSettings
│   ├── store/              # Zustand stores
│   └── lib/api.ts          # API client
│
├── backend/
│   ├── src/
│   │   ├── routes/         # 18+ API routes
│   │   ├── ai/             # AI Agent engine
│   │   ├── whatsapp/       # WhatsApp client
│   │   ├── middleware/     # Auth, AdminOnly
│   │   └── db/             # SQLite + seed data
│   └── data/               # SQLite database
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Google Chrome (for WhatsApp)

### Installation

```bash
# Clone
git clone https://github.com/mlhkhariom/ailaptopproduct.git
cd ailaptopproduct

# Frontend
npm install
npm run dev

# Backend
cd backend
npm install
node src/index.js
```

### Environment
```env
# backend/.env
PORT=5000
JWT_SECRET=your_secret_key
DB_PATH=./data/apsoncure.db
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `admin@mlhk.in` | `HarioM9165` |
| **Admin** | `admin@ailaptopwala.com` | `admin123` |
| **Customer** | `priya@email.com` | `user123` |

---

## 📦 Products Seeded

| Product | Price |
|---------|-------|
| Dell Latitude E7470 Refurbished | ₹18,999 |
| HP EliteBook 840 G5 | ₹24,999 |
| Apple MacBook Pro 2019 | ₹54,999 |
| Lenovo ThinkPad T480 | ₹21,999 |
| ASUS ROG Strix G15 Gaming | ₹65,999 |
| Dell OptiPlex 7050 Desktop | ₹14,999 |
| Laptop Cooling Pad | ₹799 |
| Screen Replacement Service | ₹2,499 |

---

## 🤖 AI Agent Setup

1. Get free API key from [OpenRouter](https://openrouter.ai) or [Google AI Studio](https://aistudio.google.com)
2. Admin Panel → WhatsApp → Agent tab
3. Select provider, paste API key, click **Load** to fetch models
4. Select model (free: `meta-llama/llama-3.1-8b-instruct:free`)
5. Edit system prompt, toggle features, **Save**

---

## 📄 License

Proprietary software developed by **MLHK Infotech** for **AI Laptop Wala**.

| | |
|---|---|
| **Developer** | [MLHK Infotech](https://mlhk.in) — Hariom Vishwkarma |
| **Business** | AI Laptop Wala, Indore |
| **WhatsApp** | +91 98765 43210 |
| **Email** | info@ailaptopwala.com |

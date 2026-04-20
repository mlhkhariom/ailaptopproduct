# AI Laptop Wala — Production Deployment Guide

**Complete e-commerce + admin platform for AI Laptop Wala, Indore**

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Server Setup](#server-setup)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [WhatsApp Setup](#whatsapp-setup)
8. [Evolution API Setup](#evolution-api-setup)
9. [SSL Certificate](#ssl-certificate)
10. [Environment Variables](#environment-variables)
11. [PM2 Process Manager](#pm2-process-manager)
12. [Nginx Configuration](#nginx-configuration)
13. [Post-Deployment](#post-deployment)
14. [Monitoring & Maintenance](#monitoring--maintenance)
15. [Troubleshooting](#troubleshooting)

---

## 🖥️ System Requirements

**Minimum:**
- Ubuntu 20.04+ / Debian 11+
- 2 CPU cores
- 4GB RAM
- 40GB SSD storage
- Node.js 20.x
- PostgreSQL 14+ (for Evolution API)
- Redis (for Evolution API)

**Recommended:**
- 4 CPU cores
- 8GB RAM
- 80GB SSD
- Nginx
- PM2

---

## ✅ Pre-Deployment Checklist

### 1. Domain & DNS
- [ ] Domain registered: `ailaptopwala.com`
- [ ] DNS A record pointing to server IP
- [ ] Wait for DNS propagation (24-48 hours)

### 2. API Keys & Credentials
- [ ] Razorpay Key ID + Secret (https://dashboard.razorpay.com)
- [ ] OpenRouter API Key (https://openrouter.ai/keys) OR Gemini API Key
- [ ] Meta/Facebook credentials (optional, for social media)
- [ ] SMTP credentials (optional, for emails)

### 3. Server Access
- [ ] SSH access to server
- [ ] Sudo privileges
- [ ] Firewall ports open: 80, 443, 5000, 8081

---

## 🚀 Server Setup

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should be v20.x
```

### 3. Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start
```

### 4. Install Redis
```bash
sudo apt install -y redis-server
sudo service redis-server start
```

### 5. Install Nginx
```bash
sudo apt install -y nginx
sudo service nginx start
```

### 6. Install PM2
```bash
sudo npm install -g pm2
```

### 7. Install Git
```bash
sudo apt install -y git
```

---

## 💾 Database Setup

### PostgreSQL (for Evolution API)
```bash
sudo -u postgres psql

CREATE USER evolution WITH PASSWORD 'your_strong_password';
CREATE DATABASE evolution_db OWNER evolution;
GRANT ALL PRIVILEGES ON DATABASE evolution_db TO evolution;
\q
```

### SQLite (for main backend)
- Auto-created on first run
- Location: `/var/www/ailaptopwala/backend/data/ailaptopwala.db`

---

## 🔧 Backend Deployment

### 1. Clone Repository
```bash
sudo mkdir -p /var/www/ailaptopwala
cd /var/www/ailaptopwala
sudo git clone https://github.com/mlhkhariom/ailaptopproduct.git .
sudo chown -R $USER:$USER /var/www/ailaptopwala
```

### 2. Install Dependencies
```bash
cd /var/www/ailaptopwala/backend
npm install --production
```

### 3. Configure Environment
```bash
cp .env.production.example .env
nano .env
```

**Edit `.env`:**
```env
PORT=5000
NODE_ENV=production
DB_PATH=./data/ailaptopwala.db
JWT_SECRET=GENERATE_STRONG_SECRET_HERE
FRONTEND_URL=https://ailaptopwala.com

# Razorpay
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXXXXXXX

# AI Agent (optional)
OPENROUTER_API_KEY=sk-or-XXXXXXXXXX
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Create Data Directory
```bash
mkdir -p /var/www/ailaptopwala/backend/data
mkdir -p /var/www/ailaptopwala/backend/uploads
chmod 755 /var/www/ailaptopwala/backend/data
```

### 5. Test Backend
```bash
cd /var/www/ailaptopwala/backend
node src/index.js
# Should see: ✅ AI Laptop Wala Backend running on http://localhost:5000
# Ctrl+C to stop
```

---

## 🎨 Frontend Deployment

### 1. Install Dependencies
```bash
cd /var/www/ailaptopwala
npm install
```

### 2. Configure Environment
```bash
nano .env
```

**Edit `.env`:**
```env
VITE_API_URL=https://ailaptopwala.com/api
VITE_EVOLUTION_URL=http://localhost:8081
VITE_EVOLUTION_KEY=ailaptopwala2026
```

### 3. Build Frontend
```bash
npm run build
# Creates /var/www/ailaptopwala/dist folder
```

### 4. Test Build
```bash
ls -lh dist/
# Should see index.html, assets/, etc.
```

---

## 📱 WhatsApp Setup (whatsapp-web.js)

### 1. First Run (Generate QR)
```bash
cd /var/www/ailaptopwala/backend
node src/index.js
```

### 2. Scan QR Code
- Open WhatsApp on phone
- Go to: Settings → Linked Devices → Link a Device
- Scan QR from terminal

### 3. Session Saved
- Session stored in: `backend/data/whatsapp-session/`
- Persists across restarts

### 4. Configure AI Agent
- Login: `https://ailaptopwala.com/admin`
- Email: `admin@mlhk.in` / Password: `HarioM9165`
- Go to: WhatsApp → AI Agent tab
- Enter OpenRouter API Key
- Enable AI Agent
- Save

---

## ⚡ Evolution API Setup (Optional - Advanced)

### 1. Clone Evolution API
```bash
cd /var/www
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api
npm install
```

### 2. Configure
```bash
cp env.example .env
nano .env
```

**Edit `.env`:**
```env
SERVER_PORT=8081
SERVER_URL=http://localhost:8081
AUTHENTICATION_API_KEY=ailaptopwala2026
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://evolution:your_password@localhost:5432/evolution_db
CACHE_REDIS_ENABLED=true
WEBSOCKET_ENABLED=true
WEBSOCKET_GLOBAL_EVENTS=true
WEBHOOK_EVENTS_MESSAGES_UPSERT=true
WEBHOOK_EVENTS_MESSAGES_UPDATE=true
WEBHOOK_EVENTS_PRESENCE_UPDATE=true
```

### 3. Generate Prisma Client
```bash
npx prisma generate --schema=prisma/postgresql-schema.prisma
npx prisma db push --schema=prisma/postgresql-schema.prisma
```

### 4. Start Evolution API
```bash
npx tsx ./src/main.ts
# Should see: HTTP - ON: 8081
```

### 5. Configure in Admin Panel
- Login as Super Admin: `admin@mlhk.in`
- Go to: Evolution API → Settings
- API URL: `http://localhost:8081`
- API Key: `ailaptopwala2026`
- Test Connection
- Create Instance → Scan QR

---

## 🔒 SSL Certificate (Let's Encrypt)

### 1. Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Get Certificate
```bash
sudo certbot --nginx -d ailaptopwala.com -d www.ailaptopwala.com
```

### 3. Auto-Renewal
```bash
sudo certbot renew --dry-run
# Cron job auto-created
```

---

## 🔐 Environment Variables

### Backend `.env` (Production)
```env
PORT=5000
NODE_ENV=production
DB_PATH=./data/ailaptopwala.db
JWT_SECRET=<64_char_random_hex>
FRONTEND_URL=https://ailaptopwala.com

# Payment
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXXXXXXX

# AI Agent
OPENROUTER_API_KEY=sk-or-XXXXXXXXXX
```

### Frontend `.env`
```env
VITE_API_URL=https://ailaptopwala.com/api
VITE_EVOLUTION_URL=http://localhost:8081
VITE_EVOLUTION_KEY=ailaptopwala2026
```

---

## 🔄 PM2 Process Manager

### 1. Start Backend
```bash
cd /var/www/ailaptopwala
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
# Follow instructions to enable auto-start on boot
```

### 2. Start Evolution API (if using)
```bash
cd /var/www/evolution-api
pm2 start "npx tsx ./src/main.ts" --name evolution-api
pm2 save
```

### 3. PM2 Commands
```bash
pm2 list                    # List all processes
pm2 logs ailaptopwala-backend  # View logs
pm2 restart ailaptopwala-backend
pm2 stop ailaptopwala-backend
pm2 delete ailaptopwala-backend
pm2 monit                   # Live monitoring
```

---

## 🌐 Nginx Configuration

### 1. Copy Config
```bash
sudo cp /var/www/ailaptopwala/nginx.conf /etc/nginx/sites-available/ailaptopwala.com
sudo ln -s /etc/nginx/sites-available/ailaptopwala.com /etc/nginx/sites-enabled/
```

### 2. Test Config
```bash
sudo nginx -t
```

### 3. Reload Nginx
```bash
sudo systemctl reload nginx
```

### 4. Key Nginx Routes
```
ailaptopwala.com/           → /var/www/ailaptopwala/dist (React SPA)
ailaptopwala.com/api/*      → http://localhost:5000/api/* (Backend)
ailaptopwala.com/sitemap.xml → http://localhost:5000/sitemap.xml (Dynamic)
ailaptopwala.com/robots.txt  → http://localhost:5000/robots.txt (Dynamic)
```

---

## 🎯 Post-Deployment

### 1. Admin Login
- URL: `https://ailaptopwala.com/admin`
- Super Admin: `admin@mlhk.in` / `HarioM9165`
- Admin: `admin@ailaptopwala.com` / `Laptop@9165`

### 2. Configure Settings
**Admin → Settings:**
- Store name, phone, email, address
- Razorpay keys
- Shipping rates
- Logo URL

**Admin → WhatsApp → AI Agent:**
- Enable AI Agent
- Enter API Key (OpenRouter or Gemini)
- Configure system prompt
- Set business hours

**Admin → CMS:**
- Update banners, benefits, testimonials, FAQs

**Admin → Products:**
- Add real product images
- Update prices, stock
- Add SEO meta tags

### 3. Test Features
- [ ] User registration/login
- [ ] Product browsing
- [ ] Add to cart → Checkout
- [ ] Razorpay payment
- [ ] Order tracking
- [ ] WhatsApp AI Agent replies
- [ ] Service booking
- [ ] Contact form
- [ ] Blog posts
- [ ] Admin panel access

### 4. SEO Setup
- Submit sitemap: `https://ailaptopwala.com/sitemap.xml` to Google Search Console
- Verify domain ownership
- Submit to Bing Webmaster Tools
- Update social media links

### 5. Razorpay Webhook
- Razorpay Dashboard → Webhooks
- Add: `https://ailaptopwala.com/api/payment/razorpay/webhook`
- Events: `payment.captured`, `payment_link.paid`
- Secret: (from `.env`)

---

## 📊 Monitoring & Maintenance

### Daily Checks
```bash
pm2 status                  # Check processes
pm2 logs --lines 50         # Check logs
df -h                       # Disk space
free -h                     # Memory usage
```

### Weekly Tasks
- [ ] Database backup
- [ ] Check error logs
- [ ] Update products/prices
- [ ] Review AI agent conversations

### Database Backup
```bash
# Automated backup script
cat > /var/www/ailaptopwala/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /var/www/ailaptopwala/backend/data/ailaptopwala.db \
   /var/www/ailaptopwala/backups/ailaptopwala_$DATE.db
# Keep last 30 days
find /var/www/ailaptopwala/backups/ -name "*.db" -mtime +30 -delete
EOF

chmod +x /var/www/ailaptopwala/backup.sh

# Add to crontab (daily 2 AM)
crontab -e
# Add: 0 2 * * * /var/www/ailaptopwala/backup.sh
```

### Update Code
```bash
cd /var/www/ailaptopwala
git pull origin main
cd backend && npm install
cd .. && npm install && npm run build
pm2 restart ailaptopwala-backend
```

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
pm2 logs ailaptopwala-backend --lines 50
# Check for:
# - Port 5000 already in use → kill process
# - DB file permissions → chmod 755
# - Missing .env → copy from .env.production.example
```

### WhatsApp Disconnected
```bash
cd /var/www/ailaptopwala/backend
rm -rf data/whatsapp-session
pm2 restart ailaptopwala-backend
# Scan QR again
```

### AI Agent Not Replying
- Check: Admin → WhatsApp → AI Agent → Enabled = ON
- Check: API Key entered and valid
- Check: Business hours (if enabled)
- Check: Daily limit not exceeded
- Test: Send "hello" from WhatsApp

### Evolution API Not Working
```bash
pm2 logs evolution-api --lines 50
# Check:
# - PostgreSQL running: sudo service postgresql status
# - Redis running: redis-cli ping
# - Port 8081 open: ss -tlnp | grep 8081
```

### 502 Bad Gateway
```bash
# Backend not running
pm2 restart ailaptopwala-backend
sudo systemctl reload nginx
```

### Database Locked
```bash
# SQLite WAL mode issue
cd /var/www/ailaptopwala/backend/data
rm -f ailaptopwala.db-shm ailaptopwala.db-wal
pm2 restart ailaptopwala-backend
```

---

## 📞 Support Contacts

**Developer:** Hariom Vishwkarma (MLHK Infotech)
- Website: https://mlhk.in
- GitHub: https://github.com/mlhkhariom

**AI Laptop Wala:**
- Phone: +91 98934 96163
- Email: contact@ailaptopwala.com
- Address: LB-21, Block-B, Silver Mall, RNT Marg, Indore, MP 452001

---

## 📝 Important Files

| File | Purpose |
|------|---------|
| `backend/.env` | Backend environment variables |
| `.env` | Frontend environment variables |
| `backend/data/ailaptopwala.db` | Main SQLite database |
| `backend/data/whatsapp-session/` | WhatsApp session data |
| `ecosystem.config.cjs` | PM2 configuration |
| `nginx.conf` | Nginx reverse proxy config |
| `AI_AGENT_PROMPT.md` | AI agent system prompt documentation |

---

## 🔑 Default Credentials

**Super Admin:**
- Email: `admin@mlhk.in`
- Password: `HarioM9165`
- Access: Full system access

**Admin:**
- Email: `admin@ailaptopwala.com`
- Password: `Laptop@9165`
- Access: Admin panel only

**⚠️ CHANGE THESE PASSWORDS IMMEDIATELY AFTER FIRST LOGIN**

---

## 🚦 Health Check URLs

- Backend: `https://ailaptopwala.com/api/health`
- Frontend: `https://ailaptopwala.com/`
- Sitemap: `https://ailaptopwala.com/sitemap.xml`
- Robots: `https://ailaptopwala.com/robots.txt`

---

## 📈 Performance Optimization

### 1. Enable Gzip (already in nginx.conf)
### 2. Cache Static Assets (already configured)
### 3. Database Optimization
```bash
# SQLite VACUUM (monthly)
cd /var/www/ailaptopwala/backend
node -e "import('./src/db/database.js').then(({default:db})=>{db.pragma('vacuum');console.log('Done')})"
```

### 4. PM2 Cluster Mode (if needed)
```javascript
// ecosystem.config.cjs
instances: 2,  // Change from 1 to 2
exec_mode: 'cluster',
```

---

## 🔄 Backup & Restore

### Backup
```bash
# Full backup
tar -czf ailaptopwala_backup_$(date +%Y%m%d).tar.gz \
  /var/www/ailaptopwala/backend/data/ \
  /var/www/ailaptopwala/backend/.env \
  /var/www/ailaptopwala/.env
```

### Restore
```bash
tar -xzf ailaptopwala_backup_YYYYMMDD.tar.gz -C /
pm2 restart all
```

---

*Last updated: April 2026 | AI Laptop Wala — Asati Infotech, Indore*

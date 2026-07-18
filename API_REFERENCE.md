# AI Laptop Wala — Mobile App API Reference

> Base URL: `https://ailaptopwala.com`  
> All API endpoints start with `/api`  
> Auth: `Authorization: Bearer <JWT_TOKEN>` header  
> Content-Type: `application/json`

---

## 🔐 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT token |
| POST | `/api/auth/google` | ❌ | Google OAuth login |
| POST | `/api/auth/forgot-password` | ❌ | Send reset password email |
| POST | `/api/auth/reset-password` | ❌ | Reset password with token |
| PUT | `/api/auth/change-password` | ✅ | Change password |
| GET | `/api/auth/me` | ✅ | Get current user profile |
| PUT | `/api/auth/me` | ✅ | Update profile |
| POST | `/api/auth/2fa/setup` | ✅ | Setup 2FA PIN |
| POST | `/api/auth/2fa/verify` | ✅ | Verify 2FA PIN |

### Login Request
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "name": "...", "email": "...", "role": "customer" }
}
```

---

## 🛍️ Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | ❌ | List products (with filters) |
| GET | `/api/products/:productId` | ❌ | Single product detail |
| GET | `/api/products/search/all` | ❌ | Global search |
| GET | `/api/products/search/suggestions` | ❌ | Search suggestions |
| GET | `/api/products/featured/list` | ❌ | Featured products |
| GET | `/api/products/trending/list` | ❌ | Trending products |
| GET | `/api/products/:productId/variants` | ❌ | Product variants |
| GET | `/api/products/:productId/images` | ❌ | Product images |
| GET | `/api/products/:productId/questions` | ❌ | Product Q&A |
| POST | `/api/products/:productId/questions` | ✅ | Ask a question |
| POST | `/api/products/:productId/questions/:qId/vote` | ✅ | Vote on question |
| PUT | `/api/products/:product_id/notify` | ✅ | Notify when back in stock |
| POST | `/api/products` | 🔒Admin | Create product |
| PUT | `/api/products/:productId` | 🔒Admin | Update product |
| DELETE | `/api/products/:product_id` | 🔒Admin | Delete product |

### Product List Query Params
```
GET /api/products?category=laptops&brand=Dell&minPrice=20000&maxPrice=80000&ram=8GB&page=1&limit=20&sort=price_asc
```

---

## 📦 Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | ❌ | All categories (tree) |
| GET | `/api/categories/:slug` | ❌ | Single category |
| GET | `/api/categories/brands/all` | ❌ | All brands list |
| POST | `/api/categories` | 🔒Admin | Create category |
| PUT | `/api/categories/:id` | 🔒Admin | Update category |
| DELETE | `/api/categories/:id` | 🔒Admin | Delete category |

---

## 🛒 Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/orders` | ✅ | My orders list |
| GET | `/api/orders/:id` | ✅ | Order detail |
| GET | `/api/orders/track/:orderNumber` | ❌ | Track order by number |
| POST | `/api/orders` | ✅ | Place new order |
| POST | `/api/orders/:id/cancel` | ✅ | Cancel order |
| GET | `/api/orders/admin/all` | 🔒Admin | All orders |
| PUT | `/api/orders/:id/status` | 🔒Admin | Update order status |
| GET | `/api/orders/:id/invoice-pdf` | ✅ | Download invoice PDF |

### Place Order Request
```json
POST /api/orders
{
  "items": [{ "product_id": "abc", "quantity": 1, "price": 45000 }],
  "address": { "name": "Ravi", "phone": "9876543210", "line1": "123 Main St", "city": "Indore", "state": "MP", "pincode": "452001" },
  "payment_method": "razorpay",
  "coupon_code": "SAVE10",
  "wallet_used": 500
}
```

---

## 💳 Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payment/razorpay/create-order` | ✅ | Create Razorpay order |
| POST | `/api/payment/razorpay/verify` | ✅ | Verify payment |
| POST | `/api/payment/razorpay/webhook` | ❌ | Razorpay webhook |
| POST | `/api/payment/phonepe/initiate` | ✅ | Initiate PhonePe |
| POST | `/api/payment/phonepe/verify` | ✅ | Verify PhonePe |
| POST | `/api/payment/phonepe/callback` | ❌ | PhonePe callback |
| POST | `/api/payment/cashfree/create-order` | ✅ | Create Cashfree order |
| POST | `/api/payment/cashfree/verify` | ✅ | Verify Cashfree |
| POST | `/api/payment/paytm/initiate` | ✅ | Initiate Paytm |
| POST | `/api/payment/paytm/verify` | ✅ | Verify Paytm |
| POST | `/api/payment/create-link` | 🔒Admin | Create payment link |
| GET | `/api/payment/methods` | ❌ | Available payment methods |

---

## 🎟️ Coupons

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/coupons/active` | ❌ | Active coupons (public) |
| POST | `/api/coupons/validate` | ❌ | Validate coupon code |
| GET | `/api/coupons` | 🔒Admin | All coupons |
| POST | `/api/coupons` | 🔒Admin | Create coupon |
| PUT | `/api/coupons/:id` | 🔒Admin | Update coupon |
| DELETE | `/api/coupons/:id` | 🔒Admin | Delete coupon |

### Validate Coupon Request
```json
POST /api/coupons/validate
{ "code": "SAVE10", "subtotal": 50000 }
```

---

## ↩️ Returns

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/returns` | ✅ | My return requests |
| POST | `/api/returns` | ✅ | Create return request |
| GET | `/api/returns/admin` | 🔒Admin | All returns |
| PUT | `/api/returns/:id/status` | 🔒Admin | Approve/Reject return |

---

## 💰 Wallet

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wallet` | ✅ | Wallet balance + history |
| POST | `/api/wallet/use` | ✅ | Use wallet balance |
| POST | `/api/wallet/referral/apply` | ✅ | Apply referral code |
| GET | `/api/wallet/referral` | ✅ | My referral info |

---

## ❤️ Wishlist

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wishlist` | ✅ | Get wishlist |
| POST | `/api/wishlist` | ✅ | Add to wishlist |
| DELETE | `/api/wishlist/:id` | ✅ | Remove from wishlist |

---

## 🏠 Addresses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/addresses` | ✅ | My saved addresses |
| POST | `/api/addresses` | ✅ | Add address |
| PUT | `/api/addresses/:id` | ✅ | Update address |
| PUT | `/api/addresses/:id/default` | ✅ | Set default address |
| DELETE | `/api/addresses/:id` | ✅ | Delete address |

---

## ⭐ Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reviews/:productId` | ❌ | Product reviews |
| POST | `/api/reviews/:productId` | ✅ | Add review |
| PUT | `/api/reviews/:id` | ✅ | Update review |
| DELETE | `/api/reviews/:id` | ✅ | Delete review |

---

## 🔔 Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | ✅ | My notifications |
| PUT | `/api/notifications/:id/read` | ✅ | Mark as read |
| PUT | `/api/notifications/read-all` | ✅ | Mark all as read |
| POST | `/api/push` | ✅ | Subscribe push notifications |

---

## 🔧 Services (Repair Booking)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/services` | ❌ | All services list |
| GET | `/api/services/:slug` | ❌ | Service detail |
| POST | `/api/services/book` | ✅ | Book a service |
| GET | `/api/services/bookings` | ✅ | My bookings |
| PUT | `/api/services/bookings/:id` | ✅ | Update booking |

---

## 📝 Blog

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/blog/posts` | ❌ | All blog posts |
| GET | `/api/blog/posts/:slug` | ❌ | Single post |
| GET | `/api/blog/meta/categories` | ❌ | Blog categories |
| GET | `/api/blog/meta/tags` | ❌ | Blog tags |

---

## 🏪 CMS (Content)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cms/:section` | ❌ | Get CMS section content |
| GET | `/api/cms/homepage-sections` | ❌ | Homepage sections |
| GET | `/api/cms/banners` | ❌ | Active banners |
| GET | `/api/cms/faqs` | ❌ | FAQs (public) |
| GET | `/api/cms/testimonials` | ❌ | Testimonials |
| GET | `/api/cms/popups/active` | ❌ | Active popups |
| GET | `/api/cms/page/:slug` | ❌ | CMS page by slug |

---

## ⚙️ Site Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/site-settings` | ❌ | Site settings (logo, name, etc.) |
| GET | `/api/app-settings` | ❌ | App feature flags |
| GET | `/api/menus/:location` | ❌ | Menu (header/footer/mobile) |

---

## 🔴 Reels / Social

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reels` | ❌ | All reels |
| GET | `/api/social/settings` | ❌ | Social media links |

---

## 📊 Reports (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reports/dashboard` | 🔒Admin | Dashboard stats |
| GET | `/api/reports/sales` | 🔒Admin | Sales report |
| GET | `/api/reports/analytics` | 🔒Admin | Analytics |
| GET | `/api/reports/export/csv` | 🔒Admin | Export CSV |

---

## 🏭 ERP — Job Cards

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/erp/job-cards` | 🔒Admin | All job cards |
| POST | `/api/erp/job-cards` | 🔒Admin | Create job card |
| PUT | `/api/erp/job-cards/:id` | 🔒Admin | Update job card |
| DELETE | `/api/erp/job-cards/:id` | 🔒Admin | Delete job card |
| GET | `/api/erp/job-cards/:id/timeline` | 🔒Admin | Job card timeline |
| POST | `/api/erp/job-cards/:id/timeline` | 🔒Admin | Add timeline entry |
| POST | `/api/erp/job-cards/:id/timer/start` | 🔒Admin | Start work timer |
| POST | `/api/erp/job-cards/:id/timer/stop` | 🔒Admin | Stop work timer |
| GET | `/api/erp/job-cards/track/:query` | ❌ | Customer job tracking |

---

## 👥 ERP — CRM / Leads

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/erp/leads` | 🔒Admin | All leads |
| POST | `/api/erp/leads` | 🔒Admin | Create lead |
| PUT | `/api/erp/leads/:id` | 🔒Admin | Update lead |
| DELETE | `/api/erp/leads/:id` | 🔒Admin | Delete lead |
| PATCH | `/api/erp/leads/:id/status` | 🔒Admin | Update lead status |
| GET | `/api/erp/leads/:id/activities` | 🔒Admin | Lead activities |
| POST | `/api/erp/leads/:id/followups` | 🔒Admin | Add followup |
| POST | `/api/erp/leads/:id/whatsapp` | 🔒Admin | Send WhatsApp to lead |
| GET | `/api/erp/leads/analytics` | 🔒Admin | Lead analytics |
| GET | `/api/erp/leads/pipeline-forecast` | 🔒Admin | Pipeline forecast |
| POST | `/api/erp/leads/merge` | 🔒Admin | Merge duplicate leads |

---

## 👨‍💼 ERP — Staff

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/erp/staff` | 🔒Admin | All staff |
| POST | `/api/erp/staff` | 🔒Admin | Add staff |
| PUT | `/api/erp/staff/:id` | 🔒Admin | Update staff |
| DELETE | `/api/erp/staff/:id` | 🔒Admin | Delete staff |
| GET | `/api/erp/attendance` | 🔒Admin | Attendance records |
| POST | `/api/erp/attendance` | 🔒Admin | Mark attendance |
| GET | `/api/erp/leaves` | 🔒Admin | Leave requests |
| POST | `/api/erp/leaves` | 🔒Admin | Apply leave |
| GET | `/api/erp/payroll` | 🔒Admin | Payroll list |
| POST | `/api/erp/payroll/generate` | 🔒Admin | Generate payroll |
| GET | `/api/erp/payroll/:id/slip` | 🔒Admin | Payslip PDF |
| GET | `/api/erp/expenses` | 🔒Admin | Expenses |
| POST | `/api/erp/expenses` | 🔒Admin | Add expense |
| PUT | `/api/erp/expenses/:id/approve` | 🔒Admin | Approve expense |

---

## 🧾 ERP — Billing / Invoices

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/invoice` | 🔒Admin | All invoices |
| POST | `/api/invoice` | 🔒Admin | Create invoice |
| PUT | `/api/invoice/:id` | 🔒Admin | Update invoice |
| GET | `/api/invoice/:id/invoice-pdf` | 🔒Admin | Download invoice PDF |
| POST | `/api/invoice/quotations` | 🔒Admin | Create quotation |
| POST | `/api/invoice/quotations/:id/convert` | 🔒Admin | Convert quote to invoice |
| POST | `/api/invoice/recurring` | 🔒Admin | Create recurring invoice |
| GET | `/api/erp/billing/credit-notes` | 🔒Admin | Credit notes |
| POST | `/api/erp/billing/credit-note` | 🔒Admin | Issue credit note |
| PATCH | `/api/erp/billing/:type/:id/payment` | 🔒Admin | Record payment |

---

## 📦 Inventory

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/inventory/products` | 🔒Admin | Inventory list |
| GET | `/api/inventory/branches` | ❌ | Branch list |
| GET | `/api/inventory/branches/public` | ❌ | Public branch info |
| GET | `/api/inventory/branch-stock` | 🔒Admin | Branch-wise stock |
| POST | `/api/inventory/branch-stock/transfer` | 🔒Admin | Transfer stock |
| GET | `/api/inventory/suppliers` | 🔒Admin | Suppliers |
| POST | `/api/inventory/suppliers` | 🔒Admin | Add supplier |
| GET | `/api/inventory/purchase-orders` | 🔒Admin | Purchase orders |
| POST | `/api/inventory/purchase-orders` | 🔒Admin | Create PO |
| GET | `/api/inventory/serials` | 🔒Admin | Serial numbers |
| GET | `/api/inventory/dead-stock` | 🔒Admin | Dead stock report |
| GET | `/api/inventory/stock-aging` | 🔒Admin | Stock aging |
| GET | `/api/inventory/reorder-suggestions` | 🔒Admin | Auto reorder list |

---

## 💰 Finance

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/erp/reports/pnl` | 🔒Admin | P&L Statement |
| GET | `/api/erp/reports/cashflow` | 🔒Admin | Cash flow |
| GET | `/api/erp/gstr1-export` | 🔒Admin | GSTR-1 export |
| GET | `/api/erp/bank-reconciliation` | 🔒Admin | Bank reconciliation |
| GET | `/api/erp/gst-report` | 🔒Admin | GST report |

---

## 📱 WhatsApp

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/whatsapp/status` | 🔒Admin | WhatsApp connection status |
| POST | `/api/whatsapp/connect` | 🔒Admin | Connect WhatsApp |
| POST | `/api/whatsapp/disconnect` | 🔒Admin | Disconnect |
| GET | `/api/whatsapp/chats` | 🔒Admin | All chats |
| GET | `/api/whatsapp/chats/:chatId/messages` | 🔒Admin | Chat messages |
| POST | `/api/whatsapp/send` | 🔒Admin | Send message |
| POST | `/api/whatsapp/broadcast` | 🔒Admin | Broadcast message |
| GET | `/api/whatsapp/messages/:phone` | 🔒Admin | Messages by phone |

---

## 🤖 AI Agent

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/ai/settings` | 🔒Admin | AI agent settings |
| PUT | `/api/ai/settings` | 🔒Admin | Update AI settings |
| GET | `/api/ai/models` | 🔒Admin | Available LLM models |
| POST | `/api/ai/test` | 🔒Admin | Test AI response |
| GET | `/api/ai/memory/:contactId` | 🔒Admin | Conversation memory |
| DELETE | `/api/ai/memory/:contactId` | 🔒Admin | Clear memory |

---

## 📡 SEO / System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/sitemap.xml` | ❌ | Auto-generated sitemap |
| GET | `/robots.txt` | ❌ | Robots.txt |
| GET | `/manifest.json` | ❌ | PWA manifest |
| GET | `/api/seo/meta/:type/:slug` | ❌ | SEO meta for page |
| GET | `/api/seo/schema/product/:slug` | ❌ | Product JSON-LD schema |

---

## 📋 Response Formats

### Success
```json
{ "data": {...} }
// or direct object/array
```

### Error
```json
{ "error": "Error message here" }
```

### Paginated List
```json
{
  "products": [...],
  "total": 150,
  "page": 1,
  "pages": 8
}
```

---

## 🔑 Auth Levels

| Symbol | Meaning |
|--------|---------|
| ❌ | Public — no auth needed |
| ✅ | Customer auth required (JWT) |
| 🔒Admin | Admin JWT required |

---

## 📲 Mobile App ke liye Recommended Endpoints

### Customer App
1. Auth: login, register, Google OAuth, me
2. Products: list, detail, search, variants
3. Cart/Orders: create order, my orders, track
4. Payment: Razorpay/PhonePe initiate + verify
5. Wishlist, Addresses, Wallet, Returns
6. Reviews, Notifications, Blog
7. Services booking, Job card tracking
8. CMS: banners, FAQs, homepage sections

### Admin App
1. Dashboard stats
2. Orders management
3. Job cards (create/update/timer)
4. Leads/CRM pipeline
5. Inventory & stock
6. Staff & attendance
7. WhatsApp chats
8. Reports

---

*Base URL: `https://ailaptopwala.com` | Backend Port: `5000` (local) | Total Endpoints: 150+*

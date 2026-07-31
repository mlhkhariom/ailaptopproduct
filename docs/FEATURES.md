# AI Laptop Wala — Complete Feature Map & Connections

> Last Updated: 2026-05-18  
> Total Features: 160+ | API Endpoints: 170+ | DB Tables: 30+

---

## 🏗️ CORE ENGINES (System Layer)

### 1. Approval Engine (`backend/src/lib/approvalEngine.js`)
| Feature | Connected To |
|---------|-------------|
| Universal approval requests | Expenses, POs, Refunds, Leaves, Discounts |
| Auto-execute on approve | Updates status in respective module |
| Role-based approvers | RBAC middleware |
| Notification on request | Notification Service |

### 2. Accounting Engine (`backend/src/lib/accountingEngine.js`)
| Feature | Connected To |
|---------|-------------|
| Double-entry ledger | Orders (auto-record sale), Expenses, Payroll |
| Trial balance | Finance reports |
| Account ledger | Bank reconciliation |
| Record sale/expense/salary | Orders.js, Expenses, Payroll |

### 3. Audit Engine (`backend/src/lib/auditEngine.js`)
| Feature | Connected To |
|---------|-------------|
| Deep change tracking (before/after) | All modules via middleware |
| Rollback (undo changes) | Products, Orders, Leads, Staff, Billing |
| Audit trail per record | Admin Audit Log page |
| Auto-audit middleware | Any route can use `auditMiddleware('module')` |

### 4. Notification Service (`backend/src/lib/notifications.js`)
| Feature | Connected To |
|---------|-------------|
| In-app notifications | Bell icon (Admin + Customer) |
| Email notifications | SMTP (email.js) |
| WhatsApp notifications | whatsapp-web.js client |
| Role-based notify | RBAC roles |
| Customer notify (all channels) | Orders, Returns, Promotions |

### 5. RBAC Permission Matrix (`backend/src/middleware/rbac.js`)
| Feature | Connected To |
|---------|-------------|
| 11 roles, 72 permissions | All API routes |
| `hasPermission()` middleware | Products, Orders, Billing, CRM, etc. |
| `/api/auth/me` returns permissions | Frontend UI show/hide |

---

## 🛒 ECOMMERCE MODULE

### Products (`backend/src/routes/ecommerce/products.js`)
| Feature | Connected To |
|---------|-------------|
| CRUD (create/read/update/delete) | Admin Products page |
| Variants (RAM/Storage/Color) | `productVariants.js`, ProductDetail page |
| Multiple images | `product_images` table, Gallery UI |
| Advanced filters (price/brand/RAM/processor) | Products page sidebar |
| Pagination (20/page) | URL params, productStore |
| Sort (newest/popular/price/discount) | Backend sortMap |
| Brand field | Brand Store pages, filters |
| Specifications JSON | Specs tab on product page |
| Show/Hide (show_public) | Admin toggle, public API filter |
| Stock management | `branch_stock` table, ERP Inventory |
| Barcode labels | `/api/products/barcode/:id` |
| Bulk update (price/category/stock) | Admin bulk actions |
| Price drop alerts | Wishlist notify, WhatsApp |
| SEO (slug, meta_title, meta_description) | Sitemap, SEOHead component |

### Product Variants (`backend/src/routes/ecommerce/productVariants.js`)
| Feature | Connected To |
|---------|-------------|
| Variant CRUD | Admin VariantManager dialog |
| Variant options (option_name + values) | Product Detail selector UI |
| Per-variant price/stock | Cart uses variant price |

### Orders (`backend/src/routes/ecommerce/orders.js`)
| Feature | Connected To |
|---------|-------------|
| Place order (6 gateways) | Checkout page |
| Stock deduction (products + branch_stock) | Inventory auto-sync |
| Order status workflow | Admin Orders page |
| Tracking (tracking_id + courier) | Track Order page |
| Cancel order (restore stock) | Account page |
| Invoice PDF (GST) | `invoicePdf.js`, Account download |
| Export CSV | Admin Orders export button |
| Order confirmation email | `email.js` |
| WhatsApp notification | `notifications.js` |
| Abandoned cart save | `abandoned_carts` table |
| Coupon usage tracking | `coupons` table used_count++ |

### Payments (`backend/src/routes/ecommerce/payment.js`)
| Feature | Connected To |
|---------|-------------|
| Razorpay | Checkout page |
| PhonePe | Checkout page |
| Cashfree | Checkout page |
| Paytm | Checkout page |
| UPI Direct | Checkout page |
| COD (with limit) | Checkout page |
| Shipping calculation | Cart + Checkout |
| Free shipping threshold | Settings |

### Cart (Frontend: `src/store/cartStore.ts`)
| Feature | Connected To |
|---------|-------------|
| Add/Remove/Update qty | ProductCard, ProductDetail, QuickView |
| Stock limit (max qty) | Product stock field |
| Coupon apply/remove | Coupons API |
| Persist (localStorage) | Zustand persist middleware |
| Abandoned cart beacon | `CustomerLayout.tsx` → orders API |

### Checkout (`src/pages/Checkout.tsx`)
| Feature | Connected To |
|---------|-------------|
| Saved addresses (select/add) | Addresses API |
| Auto-save address after order | Addresses API |
| Wallet balance usage | Wallet API |
| Available coupons display | Coupons API |
| Delivery date estimate | Pincode-based |
| Order notes | Order data |
| 6 payment methods | Payment API |

### Customer Account (`src/pages/Account.tsx`)
| Feature | Connected To |
|---------|-------------|
| Order history | Orders API |
| Track + Invoice + PDF + Cancel + Reorder | Orders API |
| Addresses tab (CRUD) | Addresses API |
| Returns tab (request + track) | Returns API |
| Wallet tab (balance + transactions + referral) | Wallet API |
| Wishlist (price drop toggle) | Wishlist API |
| Loyalty points | Calculated from orders |
| Profile + Password | Auth API |

### Other Ecommerce
| Feature | File | Connected To |
|---------|------|-------------|
| Wishlist | `wishlist.js` | ProductCard, Account, Price drop alerts |
| Addresses | `addresses.js` | Checkout, Account |
| Returns/Refunds | `returns.js` | Account, Admin Returns, Approval Engine |
| Wallet + Referral | `wallet.js` | Account, Checkout, Referral program |
| Coupons | `coupons.js` | Cart, Checkout, Product page, Admin |
| Reviews + Q&A | `reviews.js` | ProductDetail tabs, Admin Reviews |

---

## 🔧 ERP MODULE

### Job Cards (`backend/src/routes/erp/jobcards.js`)
| Feature | Connected To |
|---------|-------------|
| Create job card (auto-number JC-YYYY-NNNN) | Admin Job Cards page |
| Status workflow (pending→diagnosed→in-progress→completed→delivered) | Timeline UI |
| Assign technician | Staff module |
| Parts used (auto-deduct stock) | Inventory/branch_stock |
| Before/After photos | Media upload |
| Timer (start/stop, time_spent) | Job card detail |
| Warranty check | Orders history |
| SLA auto-set (priority-based: 24-96h) | Escalation scheduler |
| Escalation (48h overdue → WhatsApp) | Scheduler, Notification Service |
| Quotation (before invoice) | Billing module |
| Convert quote → invoice | Billing module |

### Billing (`backend/src/routes/erp/billing.js`)
| Feature | Connected To |
|---------|-------------|
| Create invoice (product + service) | Admin Billing page |
| Partial payments (collected/due/history) | Payment tracking |
| GST Invoice PDF | `invoicePdf.js` |
| Recurring invoices (auto-generate) | Scheduler (6h) |
| Overdue reminders (WhatsApp) | Scheduler (6h) |
| Credit notes | Against invoices |
| HSN codes | GST compliance |
| Proforma → Invoice conversion | Workflow |
| WhatsApp send invoice | Notification Service |

### Inventory (`backend/src/routes/inventory.js`)
| Feature | Connected To |
|---------|-------------|
| Branch-wise stock (Silver Mall + Bangali) | Products, Orders |
| Stock transfer between branches | Admin Inventory |
| Stock movements log | Audit trail |
| Purchase Orders (create→approve→receive→stock) | Suppliers, Approval Engine |
| Supplier management | PO workflow |
| Serial numbers | Product tracking |
| Stock aging report | Dead stock |
| Physical stock audit | Stock count sheet |
| Dead stock report | Products older than 60 days |
| Auto-reorder (generate PO) | Low stock threshold |
| Low stock WhatsApp alerts | Scheduler (hourly) |
| Stock count sheet (printable) | Physical audit |
| Barcode labels | Product labels |

### Staff & HR (`backend/src/routes/erp/staff.js`)
| Feature | Connected To |
|---------|-------------|
| Staff CRUD | Admin Staff page |
| Attendance tracking | Admin Attendance |
| Leave management | Admin Leaves, Approval Engine |
| Shift scheduling | Admin Shifts |
| Payroll | Admin Payroll, Accounting Engine |
| Staff expenses (with approval) | Approval Engine |
| Performance dashboard | Job cards + Leads + Attendance |
| Documents (ID/contract/PAN/Aadhar) | Staff profile |

### Finance (`backend/src/routes/erp/finance.js`)
| Feature | Connected To |
|---------|-------------|
| Expense approval workflow | Approval Engine |
| Supplier payment ledger | PO + Expenses |
| P&L Statement | Accounting Engine |
| Cash flow report | Orders + Expenses |
| Bank reconciliation | All payment records |
| GSTR-1 export | Billing data |
| KPI alerts | Scheduler (hourly) |

### Reports (`backend/src/routes/erp/reports.js`)
| Feature | Connected To |
|---------|-------------|
| Sales reports (daily/weekly/monthly) | Orders data |
| Revenue by category/product | Products + Orders |
| Staff performance | Job cards + Leads |
| P&L statement | Accounting Engine |
| Cash flow | Finance module |
| Custom report builder | Admin Report Builder page |

---

## 👥 CRM MODULE (`backend/src/routes/erp/crm.js`)

| Feature | Connected To |
|---------|-------------|
| Leads CRUD | Admin CRM page |
| Pipeline (new→contacted→interested→negotiation→won/lost) | Kanban board |
| Kanban board (drag-drop) | Admin CRM Kanban tab |
| Auto-scoring (status + budget + followups) | Lead update |
| Activities timeline | Lead detail panel |
| Follow-up reminders | Scheduler (2h) |
| Tags + Bulk actions | Admin CRM list |
| Import CSV/Excel | LeadImportCSV component |
| Export CSV | Admin CRM export button |
| WhatsApp integration (send from CRM) | WhatsApp client |
| Automations (auto-assign, auto-tag, notify) | `crmTools.js`, contacts.js hook |
| Email campaigns (bulk send) | `crmTools.js` |
| WhatsApp broadcast | `whatsapp.js` /broadcast |
| Customer 360 view | Admin Customer360 page |
| Customer segments (VIP/Active/New/Inactive) | Customers API |
| Source analytics (conversion by source) | CRM reports |
| Pipeline forecast (weighted) | Deal values |
| Duplicate detection + merge | Phone matching |
| Round-robin assignment | Staff rotation |
| Conversion funnel report | Stage analysis |
| Time-to-close report | Lead dates |
| WhatsApp templates | App settings |
| Tasks/Calendar | `crm_tasks` table |
| Call log | Lead activities |
| Scoring rules editor | App settings |
| Campaign attribution | Source + revenue |
| Stage analysis + lost reasons | Lead status data |
| Customer complaint linkage | Lead activities + notifications |

---

## 📝 CMS MODULE (`backend/src/routes/cms/cms.js`)

| Feature | Connected To |
|---------|-------------|
| CMS Pages (CRUD) | Admin CMS page, Public /page/:slug |
| Blog (markdown + toolbar) | Admin Blog, Public /blog |
| Blog categories + tags | Blog meta endpoints |
| Blog views + reading time | Auto-increment on read |
| Related posts | Same category |
| Banners (scheduled start/end) | Homepage carousel |
| FAQs (categories, DB-managed) | FAQ page, Admin CMS |
| Popups (delay/scroll/exit-intent) | PromoPopup component |
| Menu manager (header/footer/mobile) | Admin CMS Menus tab |
| Homepage sections manager | Admin Homepage Sections |
| Testimonials (with video) | Homepage |
| Media library (folders) | Admin Media page |
| SEO meta manager (per page) | All pages/products/blogs |
| Schema markup manager | Custom JSON-LD |
| Redirect manager (301/302) | Middleware in index.js |
| Version history / draft-publish | Page versions, revert |

---

## 🤖 AI & WHATSAPP

### AI Agent (`backend/src/ai/agent.js`)
| Feature | Connected To |
|---------|-------------|
| Auto-reply to WhatsApp messages | WhatsApp client |
| Product search (real DB data) | Products table |
| Order creation + payment link | Orders + Razorpay |
| Service booking | Service bookings |
| Conversation memory | `ai_conversation_memory` table |
| Multi-model (OpenRouter/Gemini/Groq) | Admin AI settings |
| Business hours + daily limits | Settings |
| Human handoff detection | Keywords |
| Product images send | Media |

### WhatsApp (`backend/src/whatsapp/`)
| Feature | Connected To |
|---------|-------------|
| Client (connect/disconnect/QR) | Admin WhatsApp page |
| Auto-create CRM lead | Leads table |
| Notification queue (30s processor) | All modules |
| Broadcast (bulk send) | Admin Broadcast page |
| Chat panel (real-time) | Admin WhatsApp page |

---

## ⚡ AUTOMATED SCHEDULERS

| Scheduler | Frequency | Module | Action |
|-----------|-----------|--------|--------|
| Abandoned cart recovery | 2h | Ecommerce | WhatsApp reminder |
| Low stock alerts | 1h | Inventory | WhatsApp to admin |
| Job card escalation | 1h | ERP | WhatsApp if overdue 48h |
| CRM follow-up reminders | 2h | CRM | Notify assigned staff |
| Daily sales report | 9 PM | Reports | WhatsApp + Email |
| Recurring invoices | 6h | Billing | Auto-generate |
| Overdue payment reminders | 6h | Billing | WhatsApp to customers |

---

## 🖥️ FRONTEND PAGES

### Customer Pages
| Page | Route | Features |
|------|-------|----------|
| Homepage | `/` | Hero, Banners, Deal timer, Best sellers, New arrivals, Categories, Testimonials, FAQ, WhatsApp CTA |
| Products | `/products` | Filters, Pagination, Sort, Grid/List, Quick view |
| Product Detail | `/products/:slug` | Gallery, Variants, EMI, Coupons, Q&A, Reviews, Related, Also bought, Share, Compare |
| Cart | `/cart` | Qty, Coupon, Shipping bar, Suggestions |
| Checkout | `/checkout` | Addresses, Wallet, Coupons, Payment, Notes, Delivery estimate |
| Account | `/account` | Orders, Addresses, Returns, Wallet, Wishlist, Profile, Password |
| Compare | `/compare` | Side-by-side table |
| Wishlist | `/wishlist` | Price drop toggle, Move to cart |
| Track Order | `/track-order` | Timeline UI |
| Offers | `/offers` | Active coupons, Permanent offers, Referral CTA |
| EMI Calculator | `/emi-calculator` | Interactive calculator |
| Brand Store | `/brands/:brand` | Filtered products |
| Bulk Order | `/bulk-order` | Corporate form |
| Notifications | `/notifications` | All notifications list |
| Blog | `/blog` | Posts list |
| Blog Post | `/blog/:slug` | Content, Related, Views |
| FAQ | `/faq` | Categories, Search |
| Services | `/services` | Repair services |
| Contact | `/contact` | Form, Map, Info |
| Links | `/links` | Linktree + Enquiry form |

### Admin Pages
| Page | Route | Module |
|------|-------|--------|
| Dashboard | `/admin` | Overview KPIs |
| Analytics | `/admin/analytics` | Charts (revenue, orders, categories) |
| Products | `/admin/products` | CRUD, Variants, Bulk, Import/Export |
| Orders | `/admin/orders` | Status, Tracking, WhatsApp, Export |
| Returns | `/admin/returns` | Approve/Reject |
| Abandoned Carts | `/admin/abandoned-carts` | Recovery stats |
| Customers | `/admin/customers` | List, Segments |
| Users | `/admin/users` | RBAC, Roles, Permissions |
| CRM | `/admin/erp/crm` | Leads, Kanban, Pipeline |
| Automations | `/admin/automations` | CRM rules |
| Email Campaigns | `/admin/email-campaigns` | Bulk email |
| Job Cards | `/admin/erp/job-cards` | Repairs |
| Billing | `/admin/erp/billing` | Invoices |
| Inventory | `/admin/inventory` | Stock, PO, Suppliers |
| Staff | `/admin/erp/staff` | HR |
| Reports | `/admin/erp/reports` | Finance |
| WhatsApp | `/admin/whatsapp` | Chat, QR |
| Broadcast | `/admin/broadcast` | Bulk WhatsApp |
| Blog | `/admin/blog` | Markdown editor |
| CMS | `/admin/cms` | Banners, FAQs, Popups, Menus, Pages |
| Homepage Sections | `/admin/homepage-sections` | Dynamic sections |
| Shipping Rules | `/admin/shipping-rules` | Delivery config |
| Settings | `/admin/settings` | 9 tabs |
| Reviews | `/admin/reviews` | Reviews + Q&A |

---

## 🔗 KEY CONNECTIONS MAP

```
Customer places order
  → Cart → Checkout → Orders API
    → Stock deducted (products + branch_stock)
    → Coupon used_count++
    → Email confirmation sent
    → WhatsApp notification queued
    → Accounting Engine: recordSale()
    → CRM: auto-create lead (if new customer)
    → Address auto-saved

Admin creates job card
  → SLA auto-set (priority-based)
  → Technician assigned
  → Notification to technician
  → Timer available (start/stop)
  → Parts used → stock deducted
  → If overdue 48h → escalation WhatsApp
  → On complete → invoice auto-created

Lead comes in (WhatsApp/Enquiry/Order)
  → CRM lead created
  → Automations run (auto-assign, auto-tag)
  → Notification to assigned staff
  → Scoring calculated
  → Follow-up reminder scheduled

Admin approves expense
  → Approval Engine processes
  → Expense status → approved
  → Accounting Engine: recordExpense()
  → Notification to requester

Product price reduced
  → Wishlist users with notify_price_drop=1
  → WhatsApp sent: "Price dropped!"
  → Audit log: old_price → new_price (rollback available)
```

---

## 📊 DATABASE TABLES (30+)

| Table | Module | Purpose |
|-------|--------|---------|
| users | Auth | All users (customers + staff) |
| products | Ecommerce | Product catalog |
| product_images | Ecommerce | Gallery images |
| product_variants | Ecommerce | RAM/Storage options |
| product_variant_options | Ecommerce | Option definitions |
| orders | Ecommerce | Customer orders |
| categories | Ecommerce | Product categories |
| coupons | Ecommerce | Discount codes |
| user_addresses | Ecommerce | Saved addresses |
| returns | Ecommerce | Return requests |
| wallet | Ecommerce | Store credit |
| wallet_transactions | Ecommerce | Credit/Debit history |
| referrals | Ecommerce | Referral program |
| wishlists | Ecommerce | With notify flags |
| abandoned_carts | Ecommerce | Recovery system |
| product_reviews | Ecommerce | Reviews + photos |
| product_questions | Ecommerce | Q&A |
| push_subscriptions | System | Browser push |
| notifications | System | In-app notifications |
| app_settings | System | All config (key-value) |
| audit_log | System | Change tracking |
| approvals | System | Universal approvals |
| journal_entries | Accounting | Double-entry header |
| ledger | Accounting | Debit/Credit lines |
| leads | CRM | Sales leads |
| lead_activities | CRM | Timeline events |
| followups | CRM | Follow-up records |
| crm_automations | CRM | Automation rules |
| crm_tasks | CRM | Tasks/Calendar |
| email_campaigns | CRM | Bulk email |
| service_bookings / job_cards | ERP | Repair jobs |
| billing | ERP | Invoices |
| expenses | ERP | Company expenses |
| recurring_expenses | ERP | Auto-recurring |
| staff | ERP | Employees |
| attendance | ERP | Daily attendance |
| leaves | ERP | Leave requests |
| payroll | ERP | Monthly salary |
| branches | ERP | Store locations |
| branch_stock | ERP | Per-branch inventory |
| branch_stock_movements | ERP | Stock movement log |
| purchase_orders | ERP | PO workflow |
| suppliers | ERP | Vendor management |
| blog_posts | CMS | Blog articles |
| cms_pages | CMS | Custom pages |
| cms_content | CMS | Banners/Testimonials |
| homepage_sections | CMS | Dynamic homepage |
| menus | CMS | Navigation menus |
| banners | CMS | Scheduled banners |
| faqs | CMS | FAQ entries |
| popups | CMS | Promo popups |
| media | CMS | Uploaded files |
| whatsapp_messages | WhatsApp | Chat history |
| ai_agent_settings | AI | Bot config |
| ai_conversation_memory | AI | Chat memory |

---

## 🔐 SECURITY LAYERS

| Layer | Implementation |
|-------|---------------|
| Authentication | JWT (30-day expiry) |
| Authorization | RBAC (11 roles, 72 permissions) |
| Rate Limiting | 200 req/15min (20 for auth) |
| 2FA | PIN-based for admin |
| Password | bcrypt hashing |
| Headers | Helmet (CSP, HSTS, etc.) |
| CORS | Configured origins |
| Input Validation | `validate.js` helpers |
| Audit Trail | Every change logged |
| Rollback | Undo any change |

---

*Generated: 2026-05-18 | Platform Version: 2.0*

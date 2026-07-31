# AI Laptop Wala — CRM & ERP Complete Feature Roadmap

> Research-based gap analysis comparing current implementation against
> industry leaders: Zoho CRM, Salesforce, HubSpot, RepairDaddy, BytePhase, CRMJIO
> 
> **Business Context:** Laptop repair + sales shop (Indore) — 2 branches, WhatsApp-first, GST billing

---

## Current Status — What We Have

### CRM
- [x] Lead list with status pipeline (new → won/lost)
- [x] Kanban board (drag-drop)
- [x] Lead detail drawer with activity timeline
- [x] Follow-up tracking with history
- [x] Lead → Job Card conversion
- [x] Staff assignment
- [x] Source tracking (WhatsApp/Walk-in/Website etc.)
- [x] Won revenue KPI
- [x] Overdue follow-up alerts
- [x] Source performance analytics
- [x] Staff leaderboard
- [x] Export CSV
- [x] Auto-lead from Contact Us form
- [x] Auto-lead from WhatsApp first message

### ERP
- [x] Job Cards (repair tracking, parts, technician, GST)
- [x] Unified Billing (orders + service + custom invoices)
- [x] Expenses tracking
- [x] Staff management + salary slip
- [x] Branches (multi-branch)
- [x] Inventory (stock, suppliers, POs, movements)
- [x] ERP Reports (P&L, expense breakdown, charts)
- [x] ERP Dashboard with live stats
- [x] WhatsApp notifications (job status, invoice link)

---

## GAP ANALYSIS — What's Missing

---

## MODULE 1: CRM — Missing Features

### 1.1 Lead Scoring (Auto)
**What:** Automatic score based on behavior — source, budget, followup count, response time
**Industry:** Zoho CRM, HubSpot, Salesforce all have AI lead scoring
**Current:** Manual score only (increments on followup)
**Build:** Score formula: source weight + budget range + followup count + days since created

### 1.2 Email Integration
**What:** Send emails directly from CRM, track opens/clicks
**Industry:** All major CRMs have email sync
**Current:** Only WhatsApp + phone call
**Build:** SMTP send from lead detail, log as activity type 'email'

### 1.3 Bulk Actions
**What:** Select multiple leads → bulk assign, bulk status change, bulk delete, bulk WhatsApp
**Industry:** Standard in all CRMs
**Current:** One-by-one only
**Build:** Checkbox column + bulk action toolbar

### 1.4 Lead Import (CSV)
**What:** Upload CSV of leads from JustDial, IndiaMart, Google Sheets
**Industry:** Standard feature
**Current:** Manual entry only
**Build:** CSV upload → parse → preview → import

### 1.5 Custom Fields
**What:** Add custom fields to leads (e.g., "Device Type", "Warranty Status")
**Industry:** Zoho, Salesforce, HubSpot all support custom fields
**Current:** Fixed fields only
**Build:** custom_fields JSONB column + dynamic form renderer

### 1.6 Deal/Opportunity Value Tracking
**What:** Separate "Deal Value" from "Budget" — track expected vs actual close value
**Industry:** Salesforce Opportunities, Zoho Deals
**Current:** Single budget field
**Build:** deal_value + expected_revenue + actual_revenue columns

### 1.7 Sales Forecasting
**What:** Predict monthly revenue based on pipeline stage × probability
**Industry:** Zoho, Salesforce, HubSpot
**Current:** No forecasting
**Build:** Stage probability table × deal values = forecast

### 1.8 Duplicate Detection
**What:** Warn when adding lead with same phone/email
**Industry:** Zoho CRM, HubSpot
**Current:** No duplicate check on frontend
**Build:** Check phone/email before save, show merge option

### 1.9 Lead Aging
**What:** Show how many days a lead has been in current stage
**Industry:** Pipedrive, Zoho
**Current:** Not shown
**Build:** Calculate days since last status change

### 1.10 WhatsApp Template Messages
**What:** Pre-defined message templates for different stages (follow-up, quote, reminder)
**Industry:** RepairDaddy, CRMJIO
**Current:** Hardcoded single message
**Build:** Template library with variables ({{name}}, {{interest}}, {{price}})

### 1.11 Reminder / Task System
**What:** Set reminders for specific leads — "Call Rahul at 3pm tomorrow"
**Industry:** All CRMs
**Current:** Only next_followup date, no time/reminder
**Build:** tasks table with lead_id, due_datetime, type, reminder_sent

### 1.12 Customer 360 View
**What:** When a lead converts, show their full history — orders, job cards, invoices, conversations
**Industry:** Salesforce, Zoho
**Current:** Lead and customer are separate, no link
**Build:** Link leads → customers → orders → job cards by phone number

---

## MODULE 2: JOB CARDS — Missing Features

### 2.1 Job Card Timeline
**What:** Visual timeline of job progress — received → diagnosed → repaired → ready → delivered
**Industry:** RepairDaddy, BytePhase
**Current:** Status badge only
**Build:** Timeline component with timestamps per status change

### 2.2 Customer Signature / Acceptance
**What:** Digital signature on job card before handover
**Industry:** RepairDaddy, CRMJIO
**Current:** Not available
**Build:** Canvas signature pad in job card form

### 2.3 Before/After Photos
**What:** Upload device photos at intake and after repair
**Industry:** RepairDaddy, BytePhase
**Current:** No photo attachment
**Build:** Multiple image upload per job card, stored in media library

### 2.4 Warranty Tracking
**What:** Set warranty period on completed jobs, alert when warranty expires
**Industry:** RepairDaddy, CRMJIO
**Current:** No warranty tracking
**Build:** warranty_days + warranty_expires_at columns, alert system

### 2.5 Parts Inventory Auto-Deduction
**What:** When parts are added to job card, auto-deduct from inventory
**Industry:** RepairDaddy, BytePhase
**Current:** Parts charge tracked but no inventory link
**Build:** Link parts_used items to product_id, deduct on save

### 2.6 Technician Performance Dashboard
**What:** Jobs completed per technician, avg repair time, revenue generated
**Industry:** RepairDaddy analytics
**Current:** Staff list only, no performance data
**Build:** Aggregate job cards by technician

### 2.7 Job Card Barcode/QR
**What:** Print QR code on job card for quick lookup
**Industry:** RepairDaddy, BytePhase
**Current:** No QR
**Build:** Generate QR from booking_number, include in print

### 2.8 Customer Portal
**What:** Customer can track their repair status via link/SMS
**Industry:** RepairDaddy
**Current:** No customer-facing tracking
**Build:** Public URL `/track/JC-XXXXXX` with status timeline

---

## MODULE 3: BILLING — Missing Features

### 3.1 Recurring Invoices
**What:** Auto-generate invoice monthly for AMC/maintenance contracts
**Industry:** Zoho Books, QuickBooks
**Current:** Manual only
**Build:** recurring_invoices table with frequency + next_date

### 3.2 Payment Reminders
**What:** Auto WhatsApp/SMS reminder for pending invoices after X days
**Industry:** Zoho Books
**Current:** Manual WhatsApp send only
**Build:** Scheduled job checks pending invoices > 3 days, queues reminder

### 3.3 Partial Payment Tracking
**What:** Record multiple payments against one invoice (advance + balance)
**Industry:** Zoho Books, Tally
**Current:** Single payment_status field
**Build:** invoice_payments table with amount + date + method

### 3.4 Credit Notes
**What:** Issue credit note against returned/cancelled invoice
**Industry:** Zoho Books, Tally
**Current:** No credit notes
**Build:** credit_notes table linked to invoice

### 3.5 GST Reports
**What:** GSTR-1, GSTR-3B summary for filing
**Industry:** Zoho Books, CaptainBiz
**Current:** No GST reports
**Build:** Aggregate invoices by GST rate, generate GSTR-1 format

### 3.6 Tally Export
**What:** Export invoices in Tally-compatible format
**Industry:** CaptainBiz, Vyapar
**Current:** CSV export only
**Build:** Generate Tally XML/CSV format

---

## MODULE 4: INVENTORY — Missing Features

### 4.1 Barcode Scanning
**What:** Scan barcode to add/find products
**Industry:** All inventory systems
**Current:** Manual search only
**Build:** Camera barcode scanner using browser API

### 4.2 Reorder Alerts
**What:** Auto-alert when stock falls below reorder level
**Industry:** All ERP systems
**Current:** Low stock alert (≤5) but no reorder level per product
**Build:** reorder_level column per product, alert when stock < reorder_level

### 4.3 Product Variants
**What:** Same product in different RAM/storage/color variants
**Industry:** All inventory systems
**Current:** Separate products only
**Build:** product_variants table with parent_product_id

### 4.4 Batch/Serial Number Tracking
**What:** Track individual serial numbers for laptops
**Industry:** RepairDaddy, all electronics ERP
**Current:** Serial number on job card only
**Build:** serial_numbers table linked to products + job cards

### 4.5 Inter-Branch Transfer
**What:** Transfer stock from Branch 1 to Branch 2
**Industry:** Multi-branch ERP
**Current:** No transfer feature
**Build:** stock_transfers table + movement records for both branches

### 4.6 Supplier Price History
**What:** Track price changes from suppliers over time
**Industry:** Procurement ERP
**Current:** No price history
**Build:** supplier_price_history table

---

## MODULE 5: STAFF/HR — Missing Features

### 5.1 Attendance Tracking
**What:** Daily attendance — present/absent/half-day
**Industry:** All HR systems
**Current:** No attendance
**Build:** attendance table with date + status + check_in/out time

### 5.2 Leave Management
**What:** Apply for leave, approve/reject, leave balance
**Industry:** All HR systems
**Current:** No leave management
**Build:** leaves table with type + status + approval

### 5.3 Salary Slip with Deductions
**What:** PF, TDS, advance deductions in salary slip
**Industry:** All payroll systems
**Current:** Basic salary slip, no deductions
**Build:** Add deduction fields to salary slip generator

### 5.4 Advance/Loan Tracking
**What:** Staff salary advance, track repayment
**Industry:** HR systems
**Current:** No advance tracking
**Build:** staff_advances table with amount + repayment schedule

### 5.5 Commission Tracking
**What:** Sales commission for staff based on deals closed
**Industry:** CRM + HR integration
**Current:** No commission
**Build:** Link won leads/orders to staff, calculate commission %

---

## MODULE 6: REPORTS — Missing Features

### 6.1 Daily Sales Report (WhatsApp)
**What:** Auto-send daily summary to owner on WhatsApp at EOD
**Industry:** RepairDaddy
**Current:** Manual reports only
**Build:** Scheduled job at 9pm → generate summary → WhatsApp to owner

### 6.2 Technician Efficiency Report
**What:** Jobs/day, avg repair time, revenue per technician
**Industry:** RepairDaddy analytics
**Current:** Not available
**Build:** Aggregate job cards by technician with time calculations

### 6.3 Customer Lifetime Value
**What:** Total revenue per customer across all orders + services
**Industry:** CRM analytics
**Current:** Not calculated
**Build:** Aggregate orders + job cards + invoices by phone number

### 6.4 Branch Comparison
**What:** Side-by-side revenue, jobs, orders comparison between branches
**Industry:** Multi-branch ERP
**Current:** Branch stats separately
**Build:** Comparative chart in ERP Reports

### 6.5 Cash Flow Statement
**What:** Money in (revenue) vs money out (expenses) by week/month
**Industry:** Accounting ERP
**Current:** P&L only
**Build:** Cash flow chart with inflow/outflow bars

---

## PRIORITY MATRIX

### P0 — Critical (Do First)
| Feature | Module | Effort | Impact |
|---------|--------|--------|--------|
| Parts inventory auto-deduction on job card | Job Cards | Medium | High |
| Duplicate lead detection | CRM | Low | High |
| Bulk actions (assign/status) | CRM | Medium | High |
| Attendance tracking | Staff | Medium | High |
| Payment reminders (auto WhatsApp) | Billing | Low | High |
| Reorder alerts per product | Inventory | Low | High |

### P1 — High Value
| Feature | Module | Effort | Impact |
|---------|--------|--------|--------|
| Lead import CSV | CRM | Medium | High |
| WhatsApp template messages | CRM | Low | High |
| Job card timeline view | Job Cards | Medium | High |
| Before/after photos | Job Cards | Medium | Medium |
| Warranty tracking | Job Cards | Low | High |
| Partial payment tracking | Billing | Medium | High |
| Daily sales report on WhatsApp | Reports | Low | High |
| Technician performance dashboard | Reports | Medium | High |

### P2 — Medium Value
| Feature | Module | Effort | Impact |
|---------|--------|--------|--------|
| Customer 360 view | CRM | High | High |
| Sales forecasting | CRM | Medium | Medium |
| Lead aging display | CRM | Low | Medium |
| Reminder/task system | CRM | Medium | Medium |
| Inter-branch stock transfer | Inventory | Medium | Medium |
| GST reports (GSTR-1) | Billing | High | High |
| Salary with deductions | Staff | Low | Medium |
| Cash flow statement | Reports | Medium | Medium |

### P3 — Nice to Have
| Feature | Module | Effort | Impact |
|---------|--------|--------|--------|
| Customer portal (repair tracking) | Job Cards | High | Medium |
| Barcode scanning | Inventory | Medium | Medium |
| Product variants | Inventory | High | Low |
| Serial number tracking | Inventory | Medium | Medium |
| Credit notes | Billing | Medium | Low |
| Tally export | Billing | Medium | Low |
| Commission tracking | Staff | Medium | Low |
| Customer signature | Job Cards | Medium | Low |

---

## COMPETITIVE COMPARISON

| Feature | AI Laptop Wala | RepairDaddy | BytePhase | Zoho CRM |
|---------|:-:|:-:|:-:|:-:|
| Job Cards | ✅ | ✅ | ✅ | ❌ |
| Kanban Pipeline | ✅ | ❌ | ❌ | ✅ |
| WhatsApp Auto | ✅ | ✅ | ✅ | ❌ |
| GST Billing | ✅ | ✅ | ✅ | ✅ |
| Multi-branch | ✅ | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | ✅ | ❌ |
| Lead Scoring | Partial | ❌ | ❌ | ✅ |
| Parts Auto-Deduct | ❌ | ✅ | ✅ | ❌ |
| Attendance | ❌ | ❌ | ✅ | ❌ |
| Customer Portal | ❌ | ✅ | ❌ | ❌ |
| Before/After Photos | ❌ | ✅ | ✅ | ❌ |
| Warranty Tracking | ❌ | ✅ | ✅ | ❌ |
| Barcode Scan | ❌ | ✅ | ❌ | ❌ |
| Daily WA Report | ❌ | ✅ | ❌ | ❌ |
| Ecommerce | ✅ | ❌ | ❌ | ❌ |
| Blog/CMS | ✅ | ❌ | ❌ | ❌ |
| Social Posting | ✅ | ❌ | ❌ | ❌ |

**AI Laptop Wala unique advantages:** Ecommerce + Blog + Social Media + WhatsApp AI Agent — no competitor has all of these.

---

## RECOMMENDED IMPLEMENTATION ORDER

### Sprint 1 (This Week) — Quick Wins
1. Parts auto-deduction on job card save
2. Duplicate lead detection (phone/email check)
3. Reorder level per product + smart alerts
4. Payment reminder auto-WhatsApp (3 days overdue)
5. Lead aging (days in stage)

### Sprint 2 (Next Week) — Core ERP
1. Job card timeline view
2. Warranty tracking
3. Attendance tracking (simple check-in/out)
4. Bulk lead actions
5. WhatsApp message templates

### Sprint 3 — Advanced
1. Before/after photos on job cards
2. Partial payment tracking
3. Daily sales report on WhatsApp
4. Technician performance dashboard
5. Lead import CSV

### Sprint 4 — Enterprise
1. Customer 360 view
2. GST reports (GSTR-1 format)
3. Sales forecasting
4. Inter-branch stock transfer
5. Customer repair tracking portal

---

## TECH NOTES

- All new tables follow existing PostgreSQL schema pattern
- WhatsApp notifications use existing `queueNotification()` system
- File uploads use existing Multer + `/uploads/media/` path
- All new routes follow `authMiddleware + adminOnly` pattern
- Frontend components follow existing ERPLayout + shadcn/ui pattern

---

*Last updated: May 2026 | Based on research of RepairDaddy, BytePhase, CRMJIO, Zoho CRM, Salesforce, HubSpot*

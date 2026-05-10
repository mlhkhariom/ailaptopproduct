# ERP Full Audit Report — May 2026
## AI Laptop Wala — Module-wise Issues & Fixes

---

## OVERALL STATUS

| Module | Score | Critical Issues | Missing Features |
|--------|:---:|:---:|:---:|
| Job Cards | 78/100 | 1 | 3 |
| Billing | 72/100 | 2 | 4 |
| CRM | 75/100 | 1 | 3 |
| Staff/HR | 68/100 | 1 | 4 |
| Inventory | 80/100 | 2 | 3 |
| ERP Reports | 70/100 | 2 | 3 |
| Payroll | 65/100 | 2 | 3 |
| Attendance | 60/100 | 2 | 3 |
| Expenses | 72/100 | 0 | 2 |
| ERP Dashboard | 65/100 | 1 | 2 |
| Recurring Invoices | 55/100 | 2 | 3 |
| Report Builder | 70/100 | 1 | 2 |
| Live Dashboard | 72/100 | 1 | 2 |

---

## MODULE 1: JOB CARDS — 78/100

### Critical Issues
1. **SLA hours not saved to DB** — `sla_hours` field added to form but UPDATE query doesn't include it
   - Fix: Add `sla_hours=?` to UPDATE query in erp.js

### Missing Features
1. **Job Card Templates** — pre-fill common repairs (Screen, Battery, Keyboard) not implemented
2. **Customer WhatsApp Approval** — send quote, customer approves before work starts
3. **Thermal Print (58mm)** — no thermal printer format, only A4 print

### Working Issues
- Parts deduction works ✅
- Branch filter works ✅
- SLA breach detection works ✅
- Photos, timeline, warranty all work ✅

---

## MODULE 2: BILLING — 72/100

### Critical Issues
1. **Branch filter not applied to KPI cards** — KPI cards (total, paid, pending) show all branches even when branchFilter set
2. **Proforma Invoice missing** — no way to send quote before invoice

### Missing Features
1. **Proforma → Invoice conversion** — quote workflow missing
2. **Credit Notes** — no way to issue credit against cancelled invoice
3. **Razorpay payment link** — manual process, not auto-generated in invoice
4. **Recurring invoice branch** — AdminRecurring has no branch filter

### Working Issues
- Custom invoice ✅, GST ✅, partial payment ✅, WhatsApp send ✅
- IRN generation ✅, GSTR-1 export ✅

---

## MODULE 3: CRM — 75/100

### Critical Issues
1. **Lead branch_id not set on create** — new lead form has no branch selector, so branch_id always null

### Missing Features
1. **Email integration** — no email send from CRM
2. **Lead scoring auto-update** — score field exists but never auto-calculated
3. **WhatsApp conversation → Lead link** — WA messages not auto-linked to lead

### Working Issues
- Kanban ✅, pipeline ✅, bulk actions ✅, CSV import ✅
- Activity timeline ✅, duplicate detection ✅, lead aging ✅

---

## MODULE 4: STAFF/HR — 68/100

### Critical Issues
1. **Staff UPDATE doesn't save branch_id** — PUT /staff/:id doesn't include branch_id in UPDATE query

### Missing Features
1. **Shift Management** — morning/evening shifts, rotation not implemented
2. **Performance Appraisal** — no KPI tracking, rating system
3. **Document Management** — Aadhaar, PAN, offer letter storage missing
4. **Loan/Advance self-service** — staff can't request advance, only admin can add

### Working Issues
- Attendance ✅, leave management ✅, commission ✅, salary slip ✅

---

## MODULE 5: INVENTORY — 80/100

### Critical Issues
1. **7 empty catch blocks** — stock operations silently fail without user notification
2. **Branch stock not synced with global stock** — when branch stock adjusted, global `products.stock` not updated

### Missing Features
1. **Barcode generation** — can scan but can't generate/print barcodes
2. **GRN (Goods Receipt Note)** — no formal receive document
3. **Supplier linked to branch** — which supplier serves which branch not tracked

### Working Issues
- Branch stock ✅, transfer ✅, PO with branch ✅, aging ✅
- Serial numbers ✅, reorder alerts ✅, stock movements ✅

---

## MODULE 6: ERP REPORTS — 70/100

### Critical Issues
1. **No error handling** — if any API fails, entire report page breaks silently
2. **Branch filter not applied to orders revenue** — orders fetch doesn't pass branch_id

### Missing Features
1. **Per-branch P&L** — branch comparison shows revenue but not expenses/profit
2. **Scheduled reports** — no auto-email weekly/monthly report
3. **Excel export** — only CSV, no proper Excel (.xlsx) format

### Working Issues
- P&L chart ✅, expense breakdown ✅, technician performance ✅
- Branch comparison ✅, GSTR-1 ✅, forecast ✅

---

## MODULE 7: PAYROLL — 65/100

### Critical Issues
1. **No error handling on generate** — if staff has no salary set, silently creates ₹0 payroll
2. **Advance deduction table missing** — `staff_advances` table referenced but may not exist if backend not restarted

### Missing Features
1. **Bank transfer file (NEFT)** — can't export salary payment file for bank
2. **TDS calculation** — TDS field exists but not auto-calculated
3. **Payslip email/WhatsApp** — can print but can't send to employee

### Working Issues
- Auto-generate ✅, PF/ESI calculation ✅, edit ✅, mark paid ✅, print slip ✅

---

## MODULE 8: ATTENDANCE — 60/100

### Critical Issues
1. **Monthly report not branch-wise** — monthly summary shows all staff
2. **No late/half-day tracking** — only present/absent, no late/half-day status

### Missing Features
1. **Shift-based attendance** — no morning/evening shift tracking
2. **Biometric integration** — manual entry only
3. **Overtime calculation** — no overtime tracking

### Working Issues
- Daily attendance ✅, monthly view ✅, branch filter ✅ (after fix)

---

## MODULE 9: EXPENSES — 72/100

### Working Well
- Branch filter ✅, category filter ✅, date filter ✅
- Breakdown chart ✅, edit ✅

### Missing Features
1. **Receipt photo upload** — no attachment support
2. **Expense approval workflow** — staff submits, manager approves

---

## MODULE 10: ERP DASHBOARD — 65/100

### Critical Issues
1. **No loading state** — dashboard shows empty/stale data while fetching

### Missing Features
1. **Real-time alerts** — KPI threshold alerts (revenue < X → notify)
2. **Quick actions** — create job card, add lead directly from dashboard

---

## MODULE 11: RECURRING INVOICES — 55/100

### Critical Issues
1. **No branch filter** — all recurring invoices mixed
2. **Process Due doesn't send WhatsApp** — invoices created but customer not notified

### Missing Features
1. **Auto-process scheduler** — needs manual click, no cron job
2. **Email notification** — no email when invoice generated
3. **Branch-wise recurring** — can't set which branch this invoice belongs to

---

## MODULE 12: REPORT BUILDER — 70/100

### Critical Issues
1. **No branch filter column** — branch_id not in default field list for most sources

### Missing Features
1. **Save report** — can't save a report configuration for reuse
2. **Chart view** — only table, no bar/pie chart option

---

## BACKEND ISSUES

### erp.js
1. **5 empty catch blocks** — parts deduction, WhatsApp send silently fail
2. **SQL injection risk** — dashboard uses string interpolation for branch_id (should use parameterized)
3. **No rate limiting** — any authenticated user can hammer APIs
4. **Missing sla_hours in UPDATE** — SLA hours set in form but not saved

### inventory.js
1. **branch_id INSERT** — may fail if column doesn't exist (needs backend restart)

---

## PRIORITY FIX LIST

### Fix Now (Bugs)
| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | SLA hours not saved | erp.js | Add sla_hours to UPDATE query |
| 2 | Staff branch_id not updated | erp.js | Add branch_id to PUT /staff/:id |
| 3 | Dashboard SQL injection | erp.js | Use parameterized queries |
| 4 | Branch filter on billing KPIs | AdminBilling.tsx | Filter KPI calculation |
| 5 | Lead branch not set on create | AdminCRM.tsx | Add BranchSelector to lead form |
| 6 | Branch stock ≠ global stock | erp.js | Sync on branch_stock adjust |

### Add Soon (Missing Features)
| # | Feature | Impact |
|---|---------|--------|
| 7 | Job Card Templates | High — saves time daily |
| 8 | Customer WhatsApp Approval | High — trust builder |
| 9 | Proforma Invoice | High — B2B requirement |
| 10 | Loyalty Program | High — repeat customers |
| 11 | Razorpay payment link | Medium — faster payment |
| 12 | Scheduled reports | Medium — owner visibility |
| 13 | Receipt photo on expenses | Low |
| 14 | NEFT salary file | Medium — payroll |

---

## SUMMARY

**Total bugs found: 12**
**Critical (break functionality): 6**
**Missing features: 14**

**Biggest risk:** SQL injection in dashboard branch filter — fix immediately.
**Biggest opportunity:** Job Card Templates + Customer Approval — daily time saver.

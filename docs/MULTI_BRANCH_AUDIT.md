# Multi-Branch ERP Audit Report
## AI Laptop Wala — Silver Mall + Bangali Chouraha

> **Date:** May 2026
> **Branches:** Silver Mall (Vijay Nagar) + Bangali Chouraha

---

## OVERALL MULTI-BRANCH SCORE: 42/100

| Module | Branch Support | Score | Critical Issues |
|--------|:---:|:---:|:---|
| Job Cards | Partial | 55/100 | No branch-wise technician assignment |
| Billing | None | 20/100 | All invoices mixed, no branch filter |
| CRM / Leads | None | 15/100 | Leads not assigned to branch |
| Staff / HR | None | 10/100 | Payroll not branch-wise |
| Inventory | Good | 70/100 | Branch stock done, PO done |
| Reports | Partial | 45/100 | Branch comparison done, rest mixed |
| Dashboard | None | 10/100 | No branch-wise live stats |
| Expenses | None | 5/100 | All expenses mixed |
| Attendance | None | 10/100 | No branch-wise attendance |
| Ecommerce Orders | None | 15/100 | Orders not linked to branch |

---

## MODULE-WISE ISSUES

### 1. JOB CARDS — Score: 55/100

**What works:**
- branch_id column exists on service_bookings
- Branch filter in job card list

**What's broken:**
- Technician list not filtered by branch (Silver Mall technician shows in Bangali Chouraha)
- Job card create — branch not auto-set from logged-in user's branch
- SLA breach report not branch-wise
- Job card stats on dashboard not split by branch
- Repair portal (/track) shows all branches mixed

**Fix needed:**
- Staff table needs branch_id
- Job card form auto-select branch based on staff
- Technician dropdown filtered by selected branch

---

### 2. BILLING — Score: 20/100

**What works:** Nothing branch-wise

**What's broken:**
- Custom invoices have NO branch_id
- Service invoices have branch_id but billing page shows all mixed
- No branch filter on billing page
- Revenue reports mix both branches
- GST report not branch-wise (different GSTIN per branch possible)
- Invoice numbering not branch-wise (ALW-001 vs BGC-001)

**Fix needed:**
- branch_id on custom_invoices table
- Branch filter on billing page
- Branch-wise invoice prefix (ALW = Silver Mall, BGC = Bangali Chouraha)

---

### 3. CRM / LEADS — Score: 15/100

**What works:** Nothing branch-wise

**What's broken:**
- Leads have NO branch_id
- Lead assigned_to not linked to branch
- WhatsApp leads auto-created without branch
- CRM pipeline shows all branches mixed
- Lead source report not branch-wise
- No way to know which branch a lead came from

**Fix needed:**
- branch_id on leads table
- Branch filter on CRM page
- Auto-assign branch when lead created from WhatsApp

---

### 4. STAFF / HR — Score: 10/100

**What works:** Nothing branch-wise

**What's broken:**
- Staff table has NO branch_id
- Attendance not branch-wise
- Payroll not branch-wise (can't generate Silver Mall payroll separately)
- Leave management not branch-wise
- Commission not branch-wise
- Can't see "Silver Mall staff" vs "Bangali Chouraha staff"

**Fix needed:**
- branch_id on staff table
- Branch filter on staff, attendance, payroll pages
- Payroll generate by branch

---

### 5. INVENTORY — Score: 70/100

**What works:**
- branch_stock table with per-branch stock
- Stock transfer between branches
- PO with branch selection
- Branch stock summary cards

**What's broken:**
- When job card parts used — deducted from global stock, not branch stock
- When ecommerce order placed — deducted from global stock, not branch stock
- Reorder alerts not branch-wise
- Supplier not linked to branch (which supplier serves which branch?)

**Fix needed:**
- Job card parts deduction from branch_stock
- Order fulfillment from branch_stock
- Reorder alerts per branch

---

### 6. EXPENSES — Score: 5/100

**What works:** Nothing branch-wise

**What's broken:**
- All expenses mixed — can't see Silver Mall expenses vs Bangali Chouraha
- No branch_id on expenses table
- P&L report mixes both branches
- Can't calculate per-branch profitability

**Fix needed:**
- branch_id on expenses table
- Branch filter on expenses page
- Per-branch P&L

---

### 7. REPORTS — Score: 45/100

**What works:**
- Branch comparison dashboard (revenue side-by-side)

**What's broken:**
- P&L report not branch-wise
- GST report not branch-wise
- Technician performance not branch-wise
- Sales forecast not branch-wise
- Expense breakdown not branch-wise
- Custom report builder has no branch filter by default

**Fix needed:**
- Branch filter on all report pages
- Per-branch P&L
- Per-branch GST export

---

### 8. DASHBOARD (ERP Overview) — Score: 10/100

**What works:** Nothing branch-wise

**What's broken:**
- Today's revenue = both branches combined
- Pending jobs = both branches combined
- No way to see "Silver Mall today" vs "Bangali Chouraha today"
- No branch selector on dashboard

**Fix needed:**
- Branch selector on ERP dashboard
- All KPI cards filter by selected branch

---

### 9. ATTENDANCE — Score: 10/100

**What works:** Nothing branch-wise

**What's broken:**
- Attendance page shows all staff mixed
- Can't mark attendance branch-wise
- Monthly report not branch-wise

---

### 10. ECOMMERCE ORDERS — Score: 15/100

**What works:** branch_id column exists on orders

**What's broken:**
- Orders not assigned to branch at checkout
- Order fulfillment not from branch stock
- No branch filter on orders page

---

## PRIORITY FIX PLAN

### Phase A — Critical (1-2 days)
These break daily operations:

| # | Fix | Impact |
|---|-----|--------|
| 1 | **Staff branch_id** — assign each staff to a branch | Payroll, attendance, job cards |
| 2 | **Billing branch filter** — filter invoices by branch | Daily billing |
| 3 | **Expenses branch_id** — tag each expense to branch | P&L accuracy |
| 4 | **CRM branch_id** — tag leads to branch | Lead management |
| 5 | **Dashboard branch selector** — filter all KPIs | Daily monitoring |

### Phase B — Important (3-5 days)
These improve accuracy:

| # | Fix | Impact |
|---|-----|--------|
| 6 | **Job card parts → branch stock deduction** | Inventory accuracy |
| 7 | **Payroll by branch** | HR management |
| 8 | **Branch-wise P&L report** | Financial clarity |
| 9 | **Technician filter by branch** | Job card accuracy |
| 10 | **Branch-wise invoice prefix** | Professional invoicing |

### Phase C — Enhancement (1 week)
| # | Fix | Impact |
|---|-----|--------|
| 11 | Branch-wise GST report | Tax filing |
| 12 | Branch-wise attendance | HR |
| 13 | Branch-wise reorder alerts | Inventory |
| 14 | Branch-wise sales forecast | Planning |

---

## WHAT ENTERPRISE ERP DOES FOR MULTI-BRANCH

| Feature | Odoo | SAP B1 | AI Laptop Wala |
|---------|:---:|:---:|:---:|
| Branch-wise P&L | ✅ | ✅ | ❌ |
| Branch-wise stock | ✅ | ✅ | ✅ |
| Branch-wise staff | ✅ | ✅ | ❌ |
| Branch-wise billing | ✅ | ✅ | ❌ |
| Branch-wise payroll | ✅ | ✅ | ❌ |
| Branch-wise dashboard | ✅ | ✅ | ❌ |
| Inter-branch transfer | ✅ | ✅ | ✅ |
| Branch-wise GST | ✅ | ✅ | ❌ |
| Consolidated reports | ✅ | ✅ | Partial |

---

## SUMMARY

**Current state:** Inventory is branch-aware. Everything else is mixed.

**Biggest pain point:** Owner cannot see "Silver Mall made ₹X today" vs "Bangali Chouraha made ₹Y today" — this is the #1 feature needed.

**Recommended first fix:** Staff branch_id + Dashboard branch selector — these unlock everything else.

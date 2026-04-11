

# Apsoncure PHC — Complete Enhancement Plan

## Current State Analysis

After reviewing the full codebase, here's what EXISTS and what's MISSING or needs improvement:

### Already Built (18 pages, 15 admin modules)
- Home, Products, Product Detail, Cart, Checkout, Blog, BlogPost, About, Contact, FAQ, Privacy, Terms, Refund, Shipping, Login, Register, Account, NotFound
- Admin: Dashboard, Products, Orders, Payments, Customers, Categories, Social, Blog, Media, WhatsApp, CMS, Reports, Settings, Contacts, Users

### What Needs Work

---

## Phase 1: Authentication & Route Protection

1. **Protected Routes Component** — Admin routes should redirect to login if not authenticated or not admin. Customer routes like `/account` should require login.
2. **Login/Register UI Polish** — Add "Forgot Password" flow, social login buttons (Google placeholder), better validation errors.
3. **Admin login separation** — `/admin` routes check `isAdmin` from AuthContext, redirect to `/login` with message if not admin.

---

## Phase 2: Public Pages Improvement

4. **Product Detail Page** — Add image gallery zoom, sticky "Add to Cart" bar on mobile, reviews section with star breakdown, share buttons, reels carousel with video player UI.
5. **Products Page** — Add grid/list view toggle, better filter sidebar with checkboxes, price range slider, "New Arrivals" and "Best Sellers" badges.
6. **Checkout Page** — Connect to cart state (currently hardcoded items), add coupon code field, order summary improvements, address save option.
7. **Cart Page** — Add "You may also like" section, empty cart illustration, saved for later section.
8. **Blog & BlogPost** — Add reading time, share buttons, author card, related posts, categories sidebar.
9. **About Page** — Add timeline/milestones, certifications section, video introduction placeholder.
10. **Contact Page** — Add Google Maps embed placeholder, office hours, response time indicator.
11. **Privacy/Terms/Refund/Shipping** — Add table of contents sidebar, print button, last updated date, better typography.

---

## Phase 3: Admin Panel Improvements

12. **Contact Queries Module** — Verify it's accessible from sidebar (currently added). Add reply functionality, status pipeline (New → Read → Replied → Resolved), export contacts CSV.
13. **Orders Module** — Add date range filter, payment status filter, order detail modal with timeline, bulk actions (mark shipped, print invoice), invoice PDF generation.
14. **Payment Tracking Module** — New dedicated module showing payment transactions, refund management, daily/weekly settlement summary, payment method breakdown chart.
15. **User & Roles** — Add role change confirmation, activity log per user, bulk role assignment, user search by email/phone.
16. **CMS Module** — Verify sidebar link works. Add drag-and-drop reorder for banners, preview button that opens homepage in new tab.

---

## Phase 4: Social Media & WhatsApp

17. **Social Automation** — Add auto-link products to reels (when publishing, select product → reel appears on product detail page). Add analytics per post (likes, reach mockup), content calendar drag-and-drop.
18. **WhatsApp Module** — Already has WhatsApp Web-style UI. Add quick reply from contact queries, broadcast list management, message template variables preview.

---

## Phase 5: New Features

19. **Wishlist System** — Heart icon on product cards, wishlist page accessible from account, move to cart functionality.
20. **Coupon/Discount Module** (Admin) — Create coupons (percentage/flat), set expiry, usage limits, apply at checkout.
21. **Notification Center** (Admin) — Bell icon in admin header showing new orders, new contacts, low stock alerts.
22. **Order Tracking Page** (Public) — `/track-order` page where customers enter order ID to see status timeline.

---

## Phase 6: README.md — Complete Documentation

23. **Exhaustive README** — Full module-by-module documentation with:
    - Architecture diagram (ASCII)
    - Every module's working logic
    - Database schema recommendations for Lovable Cloud migration
    - API integration guide (Razorpay, Meta Graph, WhatsApp Business)
    - Environment variables needed
    - Deployment steps
    - Developer credits (MLHK Infotech)

---

## Implementation Priority

```text
Priority 1 (Critical):
  ├── Route protection (admin guard)
  ├── Contact queries sidebar fix verification
  ├── Orders filter improvements
  └── Payment tracking module

Priority 2 (Important):
  ├── Product detail page (reels, reviews, gallery)
  ├── Checkout connected to cart state
  ├── CMS sidebar link verification
  └── User roles improvements

Priority 3 (Enhancement):
  ├── All public pages polish
  ├── Wishlist system
  ├── Coupon module
  ├── Notification center
  └── Order tracking page

Priority 4 (Documentation):
  └── Complete README.md
```

---

## Technical Approach

- All UI-only with mock data (no Cloud integration yet)
- Zustand stores for cart, wishlist, notifications state
- React Router guards via wrapper components
- Recharts for any new charts
- Mobile-first responsive throughout
- Developer credit: "MLHK Infotech (Hariom Vishwkarma) — mlhk.in" in footer

Shall I proceed with implementation?


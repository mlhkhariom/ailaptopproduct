

# Product Page Enhancement + Admin CRUD + WhatsApp Auto-Reply Plan

## What We'll Build

### 1. Product Store (Zustand with localStorage persistence)
Create `src/store/productStore.ts` — a persistent Zustand store replacing the static `mockData.ts` products array. Admin can Add/Edit/Delete products, and all public pages (Products, ProductDetail) read from this store in real-time.

### 2. Enhanced Product Detail Page
- Image gallery with multiple thumbnails (not just reels)
- Zoom on hover for main image
- "Recently Viewed" section
- Better mobile layout with sticky bottom bar
- Dynamic data from productStore

### 3. Enhanced Products Listing Page  
- Sidebar filters (category checkboxes, in-stock toggle)
- Better grid cards with quick-add-to-cart overlay
- Reads from productStore (admin changes reflect instantly)

### 4. Admin Products — Full CRUD Working
- **Add Product**: Form saves to productStore → appears on public pages instantly
- **Edit Product**: Pre-filled dialog, updates store
- **Delete Product**: Confirmation dialog, removes from store
- **Duplicate**: Clones product with new ID
- **Bulk Delete/Stock Update**: Works on selected items
- **Image URL preview** in form

### 5. WhatsApp Auto-Reply System
Add an **Automation** tab to AdminWhatsApp with:
- **Auto-Reply Rules Database**: Define keyword → response mappings stored in a Zustand store
  - e.g., keywords: "price", "rate" → auto-reply with product price from productStore
  - keywords: "order status", "track" → reply with order details from mockData
  - keywords: "hello", "hi" → greeting template
- **Rule Builder UI**: Add/Edit/Delete rules with keyword triggers, response templates with variables (`{{product_name}}`, `{{price}}`, `{{order_status}}`)
- **Smart Matching**: When a message comes in, check keywords against rules database, auto-fill response
- **Incoming Message Simulation**: A "Simulate Message" button that triggers the auto-reply logic and shows the matched response
- **Product Lookup**: Type product name → bot fetches price, stock, description from productStore and generates reply

### 6. All Public Pages Read from Stores
- Products page → productStore
- ProductDetail → productStore  
- Home page → already uses cmsStore
- Cart/Checkout → already uses cartStore

## Technical Details

### New Files
- `src/store/productStore.ts` — Zustand persist store with full CRUD for products
- `src/store/whatsappStore.ts` — Zustand store for auto-reply rules, chat messages, contacts

### Modified Files
- `src/pages/Products.tsx` — Read from productStore, enhanced filters
- `src/pages/ProductDetail.tsx` — Read from productStore, image gallery
- `src/pages/admin/AdminProducts.tsx` — Working Add/Edit/Delete with productStore
- `src/pages/admin/AdminWhatsApp.tsx` — Add Automation tab with auto-reply rules, simulate incoming messages, product lookup bot
- `src/components/ProductCard.tsx` — Quick add-to-cart on hover

### Data Flow
```text
Admin Panel                    Public Pages
┌─────────────┐               ┌──────────────┐
│ AdminProducts│──CRUD──►     │ Products.tsx  │
│ (Add/Edit/  │   via        │ ProductDetail │
│  Delete)    │ productStore  │ Cart/Checkout │
└─────────────┘               └──────────────┘

WhatsApp Auto-Reply
┌──────────────────────────────────────────┐
│ Incoming Message → Keyword Match         │
│ → Lookup productStore for details        │
│ → Generate auto-reply with real data     │
│ → Show in chat as bot response           │
└──────────────────────────────────────────┘
```

### Storage
All data persists in localStorage via Zustand `persist` middleware — no backend needed. Works like SQLite for browser-based persistence.


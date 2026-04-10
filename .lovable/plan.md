
# Automated Ayurvedic E-commerce & Social Media Management System

## Design System
- **Colors**: Forest Green (#2D5A27), Sage (#7C9070), Beige (#F5F0E8), Light Gold (#D4A574), White, Dark text (#2C1810)
- **Typography**: Clean sans-serif (Inter) with serif accents for headings
- **Style**: Rounded cards, soft shadows, earthy gradients, leaf/botanical accents

## Customer-Facing Pages

### 1. Home Page (`/`)
- Hero with background image, tagline, "Shop Now" & "Consult Now" CTAs
- Featured products horizontal slider (mock data)
- "Why Ayurveda" benefits section with icons
- Instagram Reels video carousel section
- Customer testimonials carousel
- Footer with contact info, social links, newsletter signup

### 2. Product Listing (`/products`)
- Sidebar/top filters: Category, Price range, Popularity, Rating
- Product grid cards: image, name, price, rating stars, quick-view button
- Sort dropdown, pagination

### 3. Product Detail (`/products/:id`)
- Image gallery with thumbnails
- Product info: name, price, rating, description
- Tabs: Ingredients, Benefits, Usage
- Embedded video/reel section
- Buy Now, Add to Cart, "Consult a Vaidya" (WhatsApp) buttons
- Related products row

### 4. Cart & Checkout (`/cart`, `/checkout`)
- Cart: item list, quantity controls, subtotal, proceed button
- Checkout: address form, order summary, payment option buttons (Razorpay/UPI placeholders)

### 5. Blog (`/blog`, `/blog/:id`)
- Blog listing with cards (image, title, excerpt, date)
- Blog detail with rich content layout, related articles

## Admin Dashboard Pages

### 6. Dashboard Home (`/admin`)
- Sidebar navigation with collapsible menu
- Sales analytics cards (revenue, orders, customers)
- Charts: sales trend line chart, category pie chart
- Recent orders table, recent activity feed

### 7. Product Management (`/admin/products`)
- Products table with search, filters
- Add/Edit product form: images upload, name, price, category, ingredients, benefits, usage fields

### 8. Order Management (`/admin/orders`)
- Orders table with status badges (Pending/Shipped/Delivered)
- Order detail view with customer info, items, status update dropdown

### 9. Blog Management (`/admin/blog`)
- Blog posts table
- Create/edit form with rich text editor area

### 10. Social Media Automation (`/admin/social`)
- Upload video/reel area
- Toggle options: Post to Instagram? Post to Facebook?
- Link to Product selector (existing or create new)
- Preview card before publishing
- Publishing history/scheduled posts list

### 11. Media Library (`/admin/media`)
- Grid of uploaded images/videos with upload button
- Filter by type, search

### 12. WhatsApp Integration (`/admin/whatsapp`)
- Predefined message templates list
- Template editor with product auto-fill variables
- Preview of WhatsApp message

## Technical Approach
- All pages built with React + TypeScript + Tailwind CSS
- Mock data for all products, orders, blogs, analytics
- Recharts for dashboard charts
- React Router for all navigation
- Reusable component library: ProductCard, OrderRow, StatCard, etc.
- Mobile-first responsive design throughout

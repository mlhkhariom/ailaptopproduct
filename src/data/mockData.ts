// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  nameHi?: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  ingredients: string[];
  benefits: string[];
  usage: string;
  inStock: boolean;
  stock: number;
  sku: string;
  slug: string;
  reels: ProductReel[];
  metaTitle?: string;
  metaDescription?: string;
  focusKeywords?: string[];
  precautions?: string;
  status: "active" | "draft";
}

export interface ProductReel {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  platform: "instagram" | "youtube" | "facebook";
  views: string;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  tax: number;
  shipping: number;
  subtotal: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  paymentStatus: 'paid' | 'failed' | 'refunded' | 'pending';
  paymentMethod: string;
  razorpayId?: string;
  date: string;
  address: string;
  trackingId?: string;
  courierPartner?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  lifetimeValue: number;
  lastOrder: string;
  joinDate: string;
  city: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  status: "published" | "draft";
  metaTitle?: string;
  metaDescription?: string;
  linkedProducts?: string[];
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  productCount: number;
  metaDescription?: string;
  image?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatar: string;
  location: string;
}

export interface SocialPost {
  id: number;
  platform: string;
  product: string;
  caption: string;
  status: "published" | "scheduled" | "draft" | "failed";
  date: string;
  likes: number;
  views: string;
  comments: number;
  shares: number;
  embedOnWebsite: boolean;
}

// ─── Products (loaded from API — this is fallback/empty) ──────────────────────
export const products: Product[] = [];

export const categories: string[] = [
  "All", "Laptops", "MacBooks", "Gaming", "Business", "Accessories", "Desktops"
];

export const categoryList: Category[] = [
  { id: "1", name: "Laptops", nameEn: "Laptops", slug: "laptops", productCount: 0, metaDescription: "Buy certified refurbished laptops in Indore", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300" },
  { id: "2", name: "MacBooks", nameEn: "MacBooks", slug: "macbooks", productCount: 0, metaDescription: "Open-box MacBooks at best price in Indore" },
  { id: "3", name: "Gaming", nameEn: "Gaming Laptops", slug: "gaming", productCount: 0, metaDescription: "Gaming laptops in Indore — Asus ROG, Lenovo Legion, HP Omen" },
  { id: "4", name: "Business", nameEn: "Business Laptops", slug: "business", productCount: 0, metaDescription: "Business laptops — Dell, HP, Lenovo ThinkPad in Indore" },
  { id: "5", name: "Accessories", nameEn: "Accessories", slug: "accessories", productCount: 0 },
  { id: "6", name: "Desktops", nameEn: "Desktops", slug: "desktops", productCount: 0 },
];

// ─── Orders (empty — loaded from API) ────────────────────────────────────────
export const orders: Order[] = [];

// ─── Customers (empty — loaded from API) ─────────────────────────────────────
export const customers: Customer[] = [];

// ─── Blog Posts (empty — loaded from API) ────────────────────────────────────
export const blogPosts: BlogPost[] = [];

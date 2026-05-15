// ── Shared TypeScript types for the entire frontend ──────

export interface Product {
  id: string;
  name: string;
  name_hi?: string;
  price: number;
  original_price?: number;
  image: string;
  images?: ProductImage[];
  category: string;
  brand?: string;
  rating: number;
  reviews: number;
  description: string;
  specifications?: Record<string, string>;
  highlights?: string[];
  ingredients?: string[];
  benefits?: string[];
  usage?: string;
  in_stock: boolean;
  stock: number;
  sku: string;
  slug: string;
  badge?: string;
  status: string;
  has_variants?: number;
  variants?: ProductVariant[];
  variant_options?: VariantOption[];
  warranty?: string;
  delivery_info?: string;
  show_public?: number;
  created_at?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  sort_order: number;
  is_primary: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku?: string;
  price: number;
  original_price?: number;
  stock: number;
  in_stock: number;
  attributes: Record<string, string>;
  image?: string;
  sort_order: number;
}

export interface VariantOption {
  id: string;
  product_id: string;
  option_name: string;
  option_values: string[];
  sort_order: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_code?: string;
  status: 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  address: Address;
  tracking_id?: string;
  courier?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

export interface Address {
  name: string;
  phone: string;
  email?: string;
  line?: string;
  address?: string;
  city: string;
  state: string;
  pin: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'superadmin' | 'staff';
  phone?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  source: string;
  interest?: string;
  budget?: number;
  status: string;
  priority: string;
  assigned_to?: string;
  tags?: string;
  score?: number;
  next_followup?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read?: number;
  created_at: string;
}

export interface Coupon {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order?: number;
  description?: string;
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
  button_text?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  review: string;
  images?: string[];
  verified_purchase?: number;
  created_at: string;
}

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

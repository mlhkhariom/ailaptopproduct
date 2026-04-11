import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/mockData";

interface CartItem {
  product: Product;
  qty: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  appliedCoupon: string | null;
  discount: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const COUPONS: Record<string, { type: "percent" | "flat"; value: number; minOrder: number }> = {
  "AYUR10": { type: "percent", value: 10, minOrder: 499 },
  "FLAT100": { type: "flat", value: 100, minOrder: 999 },
  "WELCOME20": { type: "percent", value: 20, minOrder: 299 },
  "FREESHIP": { type: "flat", value: 50, minOrder: 0 },
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      discount: 0,

      addItem: (product, qty = 1) => set((s) => {
        const existing = s.items.find((i) => i.product.id === product.id);
        if (existing) {
          return { items: s.items.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i) };
        }
        return { items: [...s.items, { product, qty }] };
      }),

      removeItem: (productId) => set((s) => ({
        items: s.items.filter((i) => i.product.id !== productId),
      })),

      updateQty: (productId, qty) => set((s) => ({
        items: qty <= 0
          ? s.items.filter((i) => i.product.id !== productId)
          : s.items.map((i) => i.product.id === productId ? { ...i, qty } : i),
      })),

      clearCart: () => set({ items: [], appliedCoupon: null, discount: 0 }),

      applyCoupon: (code) => {
        const coupon = COUPONS[code.toUpperCase()];
        if (!coupon) return false;
        const subtotal = get().getSubtotal();
        if (subtotal < coupon.minOrder) return false;
        const discount = coupon.type === "percent" ? Math.round(subtotal * coupon.value / 100) : coupon.value;
        set({ appliedCoupon: code.toUpperCase(), discount });
        return true;
      },

      removeCoupon: () => set({ appliedCoupon: null, discount: 0 }),

      getSubtotal: () => get().items.reduce((s, i) => s + i.product.price * i.qty, 0),
      getTotal: () => Math.max(0, get().getSubtotal() - get().discount),
      getItemCount: () => get().items.reduce((s, i) => s + i.qty, 0),
    }),
    { name: "apsoncure-cart" }
  )
);

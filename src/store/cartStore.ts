import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";
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
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const COUPONS: Record<string, { type: "percent" | "flat"; value: number; minOrder: number }> = {
  "ALW10": { type: "percent", value: 10, minOrder: 999 },
  "FLAT200": { type: "flat", value: 200, minOrder: 1999 },
  "WELCOME15": { type: "percent", value: 15, minOrder: 999 },
  "FREESHIP": { type: "flat", value: 150, minOrder: 0 },
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

      applyCoupon: async (code) => {
        try {
          const { discount } = await api.validateCoupon(code, get().getSubtotal());
          set({ appliedCoupon: code.toUpperCase(), discount });
          return true;
        } catch {
          return false;
        }
      },

      removeCoupon: () => set({ appliedCoupon: null, discount: 0 }),

      getSubtotal: () => get().items.reduce((s, i) => s + i.product.price * i.qty, 0),
      getTotal: () => Math.max(0, get().getSubtotal() - get().discount),
      getItemCount: () => get().items.reduce((s, i) => s + i.qty, 0),
    }),
    { name: "ailaptopwala-cart" }
  )
);

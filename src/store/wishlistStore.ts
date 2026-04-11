import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  items: string[]; // product IDs
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId) => set((s) => ({ items: s.items.includes(productId) ? s.items : [...s.items, productId] })),
      removeItem: (productId) => set((s) => ({ items: s.items.filter((id) => id !== productId) })),
      toggleItem: (productId) => {
        const s = get();
        if (s.items.includes(productId)) {
          set({ items: s.items.filter((id) => id !== productId) });
        } else {
          set({ items: [...s.items, productId] });
        }
      },
      isInWishlist: (productId) => get().items.includes(productId),
    }),
    { name: "apsoncure-wishlist" }
  )
);

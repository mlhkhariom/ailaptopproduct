import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistItem { id: string; name: string; price: number; image: string; slug: string; [key: string]: any; }
interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistItem) => void;
  hasItem: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set(s => ({ items: s.items.find(i => i.id === item.id) ? s.items : [...s.items, item] })),
      removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
      toggleItem: (item) => get().hasItem(item.id) ? get().removeItem(item.id) : get().addItem(item),
      hasItem: (id) => get().items.some(i => i.id === id),
      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'ailaptop-wishlist' }
  )
);

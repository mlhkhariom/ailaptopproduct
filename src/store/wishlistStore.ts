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
  syncFromServer: () => Promise<void>;
  syncToServer: () => Promise<void>;
}

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` });

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set(s => ({ items: s.items.find(i => i.id === item.id) ? s.items : [...s.items, item] }));
        // Sync to backend if logged in
        if (localStorage.getItem('ailaptopwala_token')) {
          fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify({ product_id: item.id }) }).catch(() => {});
        }
      },
      removeItem: (id) => {
        set(s => ({ items: s.items.filter(i => i.id !== id) }));
        if (localStorage.getItem('ailaptopwala_token')) {
          fetch(`/api/wishlist/${id}`, { method: 'DELETE', headers: authHeader() }).catch(() => {});
        }
      },
      toggleItem: (item) => get().hasItem(item.id) ? get().removeItem(item.id) : get().addItem(item),
      hasItem: (id) => get().items.some(i => i.id === id),
      clearWishlist: () => set({ items: [] }),

      syncFromServer: async () => {
        if (!localStorage.getItem('ailaptopwala_token')) return;
        try {
          const res = await fetch('/api/wishlist', { headers: authHeader() }).then(r => r.json());
          if (Array.isArray(res)) {
            const items = res.map((r: any) => ({ id: r.product_id, name: r.name, price: r.price, image: r.image, slug: r.slug }));
            set({ items });
          }
        } catch {}
      },

      syncToServer: async () => {
        if (!localStorage.getItem('ailaptopwala_token')) return;
        const localIds = get().items.map(i => i.id);
        if (!localIds.length) return;
        try {
          await fetch('/api/wishlist/sync', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify({ product_ids: localIds }) });
        } catch {}
      },
    }),
    { name: 'ailaptop-wishlist' }
  )
);

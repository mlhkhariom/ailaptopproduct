import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/mockData";
import { products as initialProducts, categories as initialCategories } from "@/data/mockData";

interface ProductStore {
  products: Product[];
  categories: string[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  deleteProducts: (ids: string[]) => void;
  duplicateProduct: (id: string) => void;
  updateStock: (id: string, stock: number) => void;
  bulkUpdateStock: (ids: string[], inStock: boolean) => void;
  addCategory: (cat: string) => void;
  getProduct: (id: string) => Product | undefined;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      categories: initialCategories,

      addProduct: (product) => {
        const id = Date.now().toString();
        set((s) => ({ products: [...s.products, { ...product, id }] }));
      },

      updateProduct: (id, updates) => {
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      deleteProduct: (id) => {
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
      },

      deleteProducts: (ids) => {
        set((s) => ({ products: s.products.filter((p) => !ids.includes(p.id)) }));
      },

      duplicateProduct: (id) => {
        const product = get().products.find((p) => p.id === id);
        if (product) {
          const newId = Date.now().toString();
          set((s) => ({
            products: [...s.products, { ...product, id: newId, name: `${product.name} (Copy)`, sku: `${product.sku}-COPY` }],
          }));
        }
      },

      updateStock: (id, stock) => {
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, stock, inStock: stock > 0 } : p
          ),
        }));
      },

      bulkUpdateStock: (ids, inStock) => {
        set((s) => ({
          products: s.products.map((p) =>
            ids.includes(p.id) ? { ...p, inStock, stock: inStock ? Math.max(p.stock, 10) : 0 } : p
          ),
        }));
      },

      addCategory: (cat) => {
        set((s) => ({
          categories: s.categories.includes(cat) ? s.categories : [...s.categories, cat],
        }));
      },

      getProduct: (id) => get().products.find((p) => p.id === id),
    }),
    { name: "apsoncure-products" }
  )
);

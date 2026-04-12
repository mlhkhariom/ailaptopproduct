import { create } from "zustand";
import { api } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  name_hi?: string;
  price: number;
  original_price?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  ingredients: string[];
  benefits: string[];
  usage: string;
  in_stock: boolean;
  stock: number;
  sku: string;
  slug: string;
  badge?: string;
  status: string;
  // legacy compat
  inStock?: boolean;
  originalPrice?: number;
  nameHi?: string;
}

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  fetchProducts: (params?: Record<string, string>) => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteProducts: (ids: string[]) => Promise<void>;
  duplicateProduct: (id: string) => Promise<void>;
  updateStock: (id: string, stock: number) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  isLoading: false,

  fetchProducts: async (params) => {
    set({ isLoading: true });
    try {
      const data = await api.getProducts(params);
      // normalize field names for legacy compat
      const products = data.map((p: Product) => ({ ...p, inStock: p.in_stock, originalPrice: p.original_price, nameHi: p.name_hi }));
      set({ products });
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (product) => {
    await api.createProduct(product);
    await get().fetchProducts();
  },

  updateProduct: async (id, updates) => {
    await api.updateProduct(id, updates);
    await get().fetchProducts();
  },

  deleteProduct: async (id) => {
    await api.deleteProduct(id);
    set(s => ({ products: s.products.filter(p => p.id !== id) }));
  },

  deleteProducts: async (ids) => {
    await Promise.all(ids.map(id => api.deleteProduct(id)));
    set(s => ({ products: s.products.filter(p => !ids.includes(p.id)) }));
  },

  duplicateProduct: async (id) => {
    const p = get().products.find(p => p.id === id);
    if (!p) return;
    const { id: _, ...rest } = p;
    await api.createProduct({ ...rest, name: `${p.name} (Copy)`, sku: `${p.sku}-COPY`, slug: `${p.slug}-copy` });
    await get().fetchProducts();
  },

  updateStock: async (id, stock) => {
    await api.updateProduct(id, { stock, in_stock: stock > 0 });
    set(s => ({ products: s.products.map(p => p.id === id ? { ...p, stock, in_stock: stock > 0, inStock: stock > 0 } : p) }));
  },

  getProduct: (id) => get().products.find(p => p.id === id || p.slug === id),
}));

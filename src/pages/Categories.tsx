import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid3X3 } from "lucide-react";
import CustomerLayout from "@/components/layout/CustomerLayout";
import SEOHead from "@/components/common/SEOHead";

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => { fetch('/api/categories?flat=1').then(r => r.json()).then(d => { if (Array.isArray(d)) setCategories(d); }).catch(() => {}); }, []);

  return (
    <CustomerLayout>
      <SEOHead title="All Categories — AI Laptop Wala" description="Browse all product categories. Laptops, MacBooks, Gaming, Desktops, Accessories and more." canonical="/categories" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black flex items-center gap-2"><Grid3X3 className="h-7 w-7" /> All <span className="gradient-text">Categories</span></h1>
          <p className="text-muted-foreground text-sm mt-1">Browse by category to find what you need</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link key={cat.id} to={`/products?category=${cat.name}`} className="group">
              <div className="bg-card border rounded-xl p-6 text-center hover:border-primary hover:shadow-lg transition-all">
                {cat.image ? <img src={cat.image} alt={cat.name} className="w-16 h-16 object-cover rounded-lg mx-auto mb-3" /> : <div className="text-4xl mb-3">{cat.icon || '📦'}</div>}
                <h3 className="font-bold text-sm group-hover:text-primary">{cat.name}</h3>
                {cat.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>}
              </div>
            </Link>
          ))}
          {categories.length === 0 && ['Laptops', 'MacBooks', 'Gaming', 'Desktops', 'Accessories', 'Components'].map(c => (
            <Link key={c} to={`/products?category=${c}`} className="group">
              <div className="bg-card border rounded-xl p-6 text-center hover:border-primary hover:shadow-lg transition-all">
                <div className="text-4xl mb-3">💻</div>
                <h3 className="font-bold text-sm group-hover:text-primary">{c}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
}

import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import CustomerLayout from "@/components/layout/CustomerLayout";
import SEOHead from "@/components/common/SEOHead";
import ProductCard from "@/components/ecommerce/ProductCard";
import { useProductStore } from "@/store/productStore";

export default function NewArrivals() {
  const { products, fetchProducts, isLoading } = useProductStore();
  useEffect(() => { fetchProducts({ sort: 'newest', limit: '20' }); }, []);

  return (
    <CustomerLayout>
      <SEOHead title="New Arrivals — AI Laptop Wala" description="Latest laptops just arrived! Check out our newest additions — Dell, HP, Lenovo, MacBook." canonical="/new-arrivals" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black flex items-center gap-2"><Sparkles className="h-7 w-7 text-primary" /> New <span className="gradient-text">Arrivals</span></h1>
          <p className="text-muted-foreground text-sm mt-1">Fresh stock — just added to our collection</p>
        </div>
        {isLoading ? <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{products.slice(0, 20).map(p => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </div>
    </CustomerLayout>
  );
}

import { useEffect } from "react";
import { Trophy } from "lucide-react";
import CustomerLayout from "@/components/layout/CustomerLayout";
import SEOHead from "@/components/common/SEOHead";
import ProductCard from "@/components/ecommerce/ProductCard";
import { useProductStore } from "@/store/productStore";

export default function BestSellers() {
  const { products, fetchProducts, isLoading } = useProductStore();
  useEffect(() => { fetchProducts({ sort: 'popular', limit: '20' }); }, []);

  return (
    <CustomerLayout>
      <SEOHead title="Best Sellers — AI Laptop Wala" description="Most popular laptops at AI Laptop Wala. Top-rated, most reviewed products in Indore." canonical="/best-sellers" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black flex items-center gap-2"><Trophy className="h-7 w-7 text-yellow-500" /> Best <span className="gradient-text">Sellers</span></h1>
          <p className="text-muted-foreground text-sm mt-1">Our most popular products — loved by customers</p>
        </div>
        {isLoading ? <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{products.slice(0, 20).map(p => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </div>
    </CustomerLayout>
  );
}

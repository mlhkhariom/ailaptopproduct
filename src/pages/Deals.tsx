import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flame, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CustomerLayout from "@/components/layout/CustomerLayout";
import SEOHead from "@/components/common/SEOHead";
import ProductCard from "@/components/ecommerce/ProductCard";
import { useProductStore } from "@/store/productStore";

export default function Deals() {
  const { products, fetchProducts, isLoading } = useProductStore();
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => { fetchProducts({ sort: 'discount', limit: '20' }); }, []);
  useEffect(() => {
    const tick = () => { const now = new Date(); const end = new Date(now); end.setHours(23, 59, 59); const d = Math.max(0, end.getTime() - now.getTime()); setTimeLeft({ h: Math.floor(d / 3600000), m: Math.floor((d % 3600000) / 60000), s: Math.floor((d % 60000) / 1000) }); };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

  const deals = products.filter(p => p.original_price && p.original_price > p.price * 1.1);

  return (
    <CustomerLayout>
      <SEOHead title="Today's Deals — AI Laptop Wala" description="Best deals on laptops in Indore. Flash sale, discounts up to 40% off. Limited time offers." canonical="/deals" />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 md:p-8 text-white mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black flex items-center gap-2"><Flame className="h-8 w-8" /> Today's Deals</h1>
              <p className="text-white/80 text-sm mt-1">Limited time offers — grab before they're gone!</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="text-sm">Ends in:</span>
              {[['h', timeLeft.h], ['m', timeLeft.m], ['s', timeLeft.s]].map(([l, v]) => (
                <div key={l as string} className="bg-white/20 rounded-lg px-2.5 py-1 text-center min-w-[40px]">
                  <span className="text-lg font-bold">{String(v).padStart(2, '0')}</span>
                  <span className="text-[9px] block -mt-0.5">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        {isLoading ? (
          <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
        ) : deals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-semibold mb-2">No active deals right now</p>
            <p className="text-muted-foreground text-sm mb-4">Check back soon for new offers!</p>
            <Link to="/products"><Button>Browse All Products</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {deals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

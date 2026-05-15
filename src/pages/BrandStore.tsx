import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerLayout from "@/components/layout/CustomerLayout";
import SEOHead from "@/components/common/SEOHead";
import ProductCard from "@/components/ecommerce/ProductCard";
import { useProductStore } from "@/store/productStore";

const BRAND_INFO: Record<string, { logo?: string; desc: string; tagline: string }> = {
  dell: { desc: "Dell laptops — Latitude, Inspiron, XPS series. Business-grade reliability.", tagline: "Built for Business" },
  hp: { desc: "HP laptops — EliteBook, ProBook, Pavilion. Premium build quality.", tagline: "Premium Performance" },
  lenovo: { desc: "Lenovo laptops — ThinkPad, IdeaPad, Legion. Legendary keyboards.", tagline: "Think Different" },
  apple: { desc: "Apple MacBooks — Air, Pro. M1/M2 chips, Retina display.", tagline: "Think Apple" },
  asus: { desc: "ASUS laptops — ROG, ZenBook, VivoBook. Gaming & productivity.", tagline: "In Search of Incredible" },
  acer: { desc: "Acer laptops — Aspire, Nitro, Swift. Value for money.", tagline: "Explore Beyond Limits" },
};

export default function BrandStore() {
  const { brand } = useParams();
  const { products, fetchProducts, isLoading } = useProductStore();

  useEffect(() => { fetchProducts({ brand: brand || '' }); }, [brand]);

  const brandName = brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : '';
  const info = BRAND_INFO[brand?.toLowerCase() || ''] || { desc: `${brandName} laptops available at AI Laptop Wala, Indore.`, tagline: '' };

  return (
    <CustomerLayout>
      <SEOHead title={`${brandName} Laptops in Indore | AI Laptop Wala`} description={info.desc} canonical={`/brands/${brand}`} />
      <div className="container mx-auto px-4 py-8">
        {/* Brand Header */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-muted/50 to-muted/20 border">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-primary">Home</Link><span>/</span>
            <Link to="/products" className="hover:text-primary">Products</Link><span>/</span>
            <span className="text-foreground font-medium">{brandName}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-black mb-2">{brandName} <span className="gradient-text">Laptops</span></h1>
          {info.tagline && <p className="text-sm text-muted-foreground italic mb-1">{info.tagline}</p>}
          <p className="text-sm text-muted-foreground">{info.desc}</p>
          <p className="text-sm font-medium mt-3">{products.length} products available</p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-semibold mb-2">No {brandName} products found</p>
            <Link to="/products"><Button variant="outline">Browse All Products</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

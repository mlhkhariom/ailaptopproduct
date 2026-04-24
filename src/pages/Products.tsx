import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutGrid, List, Search, X } from "lucide-react";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";
import ProductCard from "@/components/ProductCard";
import { useProductStore } from "@/store/productStore";
import { api } from "@/lib/api";

const Products = () => {
  const { products, fetchProducts } = useProductStore();
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || "");
  useEffect(() => { setSearch(searchParams.get('q') || ""); }, [searchParams]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    fetchProducts();
    api.getCategories().then((cats: any[]) => setCategories(["All", ...cats.map((c: any) => c.name)])).catch(() => {});
  }, []);

  const filtered = products
    .filter((p) => p.status === "active")
    .filter((p) => category === "All" || p.category === category)
    .filter((p) => !inStockOnly || p.in_stock)
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "newest") return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      return b.reviews - a.reviews;
    });

  const newArrivals = products.slice(-2).map(p => p.id);
  const bestSellers = products.filter(p => p.reviews > 200).map(p => p.id);

  return (
    <CustomerLayout>
      <SEOHead
        title={search ? `"${search}" Laptops in Indore` : "Buy Laptops in Indore — Refurbished, MacBook, Gaming"}
        description="Buy certified refurbished laptops in Indore. MacBooks, gaming laptops, business laptops at best prices. AI Laptop Wala — Silver Mall, Indore."
        canonical="/products"
        breadcrumbs={[{ name: "Products", url: "/products" }]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Laptops for Sale in Indore",
          "url": "https://ailaptopwala.com/products",
          "numberOfItems": products.length,
          "itemListElement": products.slice(0, 10).map((p: any, i: number) => ({
            "@type": "ListItem",
            "position": i + 1,
            "url": `https://ailaptopwala.com/products/${p.slug || p.id}`,
            "name": p.name
          }))
        }}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black mb-1">Buy <span className="gradient-text">Laptops</span> in Indore</h1>
          <p className="text-muted-foreground text-sm">Certified refurbished laptops — Dell, HP, Lenovo, MacBook, Gaming</p>
        </div>

        {/* Top Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search laptops..." className="pl-8 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch("")} className="absolute right-2 top-2.5"><X className="h-4 w-4 text-muted-foreground" /></button>}
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${category === c ? "bg-primary text-white" : "bg-muted hover:bg-primary/10"}`}>
                {c}
              </button>
            ))}
          </div>

          {/* Sort */}
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44 h-9 text-sm shrink-0"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="hidden md:flex items-center gap-1 border rounded-lg p-0.5 shrink-0">
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("grid")}><LayoutGrid className="h-3.5 w-3.5" /></Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("list")}><List className="h-3.5 w-3.5" /></Button>
          </div>
        </div>

        {/* Results count + clear */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{filtered.length} products found</p>
          {(category !== "All" || inStockOnly || search) && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setCategory("All"); setInStockOnly(false); setSearch(""); }}>
              <X className="h-3 w-3 mr-1" /> Clear Filters
            </Button>
          )}
        </div>

        {/* Products Grid */}
        <div className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5" : "space-y-4"}>
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">No products found</p>
            <Button variant="outline" size="sm" onClick={() => { setCategory("All"); setSearch(""); }}>Clear Filters</Button>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default Products;

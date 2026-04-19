import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";
import ProductCard from "@/components/ProductCard";
import { useProductStore } from "@/store/productStore";
import { api } from "@/lib/api";

const Products = () => {
  const { products, fetchProducts } = useProductStore();
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("popular");
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || "");
  useEffect(() => { setSearch(searchParams.get('q') || ""); }, [searchParams]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [showFilters, setShowFilters] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    fetchProducts();
    api.getCategories().then((cats: any[]) => setCategories(["All", ...cats.map((c: any) => c.name)])).catch(() => {});
  }, []);

  const maxPrice = Math.max(...products.map(p => p.price), 2000);

  const filtered = products
    .filter((p) => p.status === "active")
    .filter((p) => category === "All" || p.category === category)
    .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
    .filter((p) => !inStockOnly || p.in_stock)
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.name_hi && p.name_hi.includes(search)))
    .sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "newest") return 0;
      return b.reviews - a.reviews;
    });

  const newArrivals = products.slice(-2).map(p => p.id);
  const bestSellers = products.filter(p => p.reviews > 200).map(p => p.id);

  return (
    <CustomerLayout>
      <SEOHead
        title={search ? `"${search}" Laptops in Indore` : "Buy Laptops in Indore — Refurbished, MacBook, Gaming"}
        description={`Buy certified refurbished laptops in Indore. ${search ? `Search results for "${search}". ` : ""}MacBooks, gaming laptops, business laptops at best prices. AI Laptop Wala — Silver Mall, Indore.`}
        canonical="/products"
        breadcrumbs={[{ name: "Products", url: "/products" }]}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-1">Our Products</h1>
            <p className="text-muted-foreground">Explore our complete range of authentic Laptop products</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-8 w-52 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-2.5">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 md:hidden" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <div className="hidden md:flex items-center gap-1 border rounded-lg p-0.5">
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("grid")}><LayoutGrid className="h-3.5 w-3.5" /></Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("list")}><List className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-56 shrink-0 space-y-6`}>
            <div>
              <h3 className="text-sm font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`block w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${category === c ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    {c} {c !== "All" && <span className="text-xs opacity-70">({products.filter(p => p.category === c && p.status === "active").length})</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Price Range</h3>
              <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={maxPrice} step={50} className="mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox checked={inStockOnly} onCheckedChange={(v) => setInStockOnly(!!v)} id="instock" />
              <label htmlFor="instock" className="text-sm">In Stock Only</label>
            </div>

            {(category !== "All" || inStockOnly || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setCategory("All"); setInStockOnly(false); setPriceRange([0, maxPrice]); }}>
                <X className="h-3 w-3 mr-1" /> Clear Filters
              </Button>
            )}
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Showing {filtered.length} products</p>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-48 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={viewMode === "grid" ? "grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" : "space-y-4"}>
              {filtered.map((p) => (
                <div key={p.id} className="relative">
                  {newArrivals.includes(p.id) && <Badge className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground text-[9px]">NEW</Badge>}
                  {bestSellers.includes(p.id) && !newArrivals.includes(p.id) && <Badge className="absolute top-2 right-2 z-10 bg-accent text-accent-foreground text-[9px]">BESTSELLER</Badge>}
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg mb-2">No products found</p>
                <p className="text-sm">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Products;
